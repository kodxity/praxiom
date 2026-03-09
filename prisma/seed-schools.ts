import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const schools = [
  // ECSD - Edmonton Catholic School District
  { name: 'Archbishop MacDonald High School',  shortName: 'Archbishop Mac',   district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'Bishop Carroll High School',         shortName: 'Bishop Carroll',   district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'Holy Trinity Catholic High School', shortName: 'Holy Trinity',     district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'J.H. Picard Catholic High School',  shortName: 'J.H. Picard',     district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'McNally High School',                shortName: 'McNally',          district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'Mother Margaret Mary High School',  shortName: 'Mother Margaret',  district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'Queen of Peace High School',         shortName: 'Queen of Peace',   district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'Sacred Heart High School',           shortName: 'Sacred Heart',     district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'St. Francis Xavier High School',    shortName: 'St. FX',           district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'St. Joseph High School',             shortName: 'St. Joseph',       district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'St. Maria Goretti High School',     shortName: 'St. Maria Goretti',district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'St. Martin de Porres High School',  shortName: 'St. Martin',       district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'St. Nicholas High School',           shortName: 'St. Nicholas',     district: 'ECSD', emailDomain: 'ecsd.net' },
  { name: 'St. Peter the Apostle High School', shortName: 'St. Peter',        district: 'ECSD', emailDomain: 'ecsd.net' },

  // EPSB - Edmonton Public Schools
  { name: 'Eastglen High School',               shortName: 'Eastglen',         district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Harry Ainlay High School',           shortName: 'Harry Ainlay',     district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'J. Percy Page High School',          shortName: 'J. Percy Page',    district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Jasper Place High School',           shortName: 'Jasper Place',     district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Lillian Osborne High School',        shortName: 'Lillian Osborne',  district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'M.E. LaZerte High School',           shortName: 'M.E. LaZerte',     district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Old Scona Academic High School',     shortName: 'Old Scona',        district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Ross Sheppard High School',          shortName: 'Ross Sheppard',    district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Strathcona High School',             shortName: 'Strathcona',       district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Victoria School of the Arts',        shortName: 'Victoria',         district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'W.P. Wagner High School',            shortName: 'W.P. Wagner',      district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Windermere High School',             shortName: 'Windermere',       district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Paul Kane High School',              shortName: 'Paul Kane',        district: 'EPSB', emailDomain: 'epsb.ca' },
  { name: 'Calder High School',                 shortName: 'Calder',           district: 'EPSB', emailDomain: 'epsb.ca' },
];

async function main() {
  console.log('Seeding schools...');
  let created = 0;
  for (const school of schools) {
    const existing = await prisma.school.findFirst({ where: { name: school.name } });
    if (!existing) {
      await prisma.school.create({ data: school });
      created++;
    }
  }
  console.log(`Done. Created ${created} new schools (${schools.length - created} already existed).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
