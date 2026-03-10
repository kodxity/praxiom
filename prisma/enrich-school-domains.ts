/**
 * Fetches university domain data from the Hipo API and updates
 * all matching schools in the DB with their real email domains.
 *
 * Match strategy: case-insensitive exact name match first,
 * then fuzzy (DB name contains API name, or API name contains DB name).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type HipoU = {
  name: string;
  domains: string[];
  'state-province': string | null;
  country: string;
};

async function fetchAll(country: string): Promise<HipoU[]> {
  const url = `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as HipoU[];
      console.log(`  Fetched ${data.length} entries for ${country}`);
      return data;
    } catch (e) {
      console.warn(`  Attempt ${attempt} failed for ${country}: ${(e as Error).message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  console.warn(`  Giving up on ${country}`);
  return [];
}

async function fetchFromGitHub(): Promise<HipoU[]> {
  const url = 'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as HipoU[];
      console.log(`  Fetched ${data.length} total entries from GitHub`);
      return data.filter(u => ['United States', 'Canada', 'Mexico'].includes(u.country));
    } catch (e) {
      console.warn(`  GitHub attempt ${attempt} failed: ${(e as Error).message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
  return [];
}

function pickDomain(domains: string[]): string | null {
  if (!domains.length) return null;
  // Prefer .edu / .ca / .ac.* domains
  const preferred = domains.find(d => d.endsWith('.edu') || d.endsWith('.ca') || d.includes('.ac.'));
  return preferred ?? domains[0];
}

async function main() {
  console.log('Fetching university data…');
  // Try GitHub full dataset first (more reliable for large US dataset)
  let all = await fetchFromGitHub();
  if (all.length === 0) {
    console.log('GitHub fallback failed, trying per-country API…');
    const us = await fetchAll('United States');
    const ca = await fetchAll('Canada');
    const mx = await fetchAll('Mexico');
    all = [...us, ...ca, ...mx];
  }
  console.log(`Fetched ${all.length} universities total.`);

  // Build lookup map: lowercase name → domain
  const apiMap = new Map<string, string>();
  for (const u of all) {
    const domain = pickDomain(u.domains);
    if (domain) apiMap.set(u.name.toLowerCase().trim(), domain);
  }

  // Load all schools, skip the ECSD/EPSB ones (they have managed domains)
  const schools = await prisma.school.findMany();
  const filtered = schools.filter(
    s => s.emailDomain !== 'ecsd.net' && s.emailDomain !== 'epsb.ca'
  );

  console.log(`Attempting to match ${filtered.length} schools…`);

  let updated = 0;
  let skipped = 0;

  for (const school of filtered) {
    const nameLower = school.name.toLowerCase().trim();

    // 1. Exact match
    let domain = apiMap.get(nameLower) ?? null;

    // 2. Fuzzy: try stripping common suffixes
    if (!domain) {
      const stripped = nameLower
        .replace(/,?\s*(the\s+)?university\s+of\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      for (const [key, val] of apiMap) {
        if (key.includes(stripped) || stripped.includes(key.replace(/\s+/g, ' ').trim())) {
          domain = val;
          break;
        }
      }
    }

    // 3. Fuzzy: DB name contains API name or vice-versa (min 8 chars to avoid false positives)
    if (!domain) {
      for (const [key, val] of apiMap) {
        if (key.length >= 8 && (nameLower.includes(key) || key.includes(nameLower))) {
          domain = val;
          break;
        }
      }
    }

    if (domain && domain !== school.emailDomain) {
      await prisma.school.update({ where: { id: school.id }, data: { emailDomain: domain } });
      console.log(`  ✅ ${school.name} → ${domain}`);
      updated++;
    } else if (!domain) {
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, No match found: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
