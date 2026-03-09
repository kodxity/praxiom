import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const BASE_URL = (process.env.NEXTAUTH_URL ?? 'https://mathshowup2.vercel.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}`,             lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
        { url: `${BASE_URL}/contests`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
        { url: `${BASE_URL}/problems`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
        { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
        { url: `${BASE_URL}/blog`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
        { url: `${BASE_URL}/register`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/legal`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    ];

    let contestRoutes: MetadataRoute.Sitemap = [];
    let userRoutes: MetadataRoute.Sitemap = [];
    let postRoutes: MetadataRoute.Sitemap = [];

    try {
        const [contests, users, posts] = await Promise.all([
            prisma.contest.findMany({
                select: { id: true, startTime: true },
                orderBy: { startTime: 'desc' },
                take: 200,
            }),
            prisma.user.findMany({
                where: { isApproved: true },
                select: { username: true, createdAt: true },
                orderBy: { rating: 'desc' },
                take: 500,
            }),
            prisma.blogPost.findMany({
                select: { id: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 200,
            }),
        ]);

        contestRoutes = contests.map(c => ({
            url: `${BASE_URL}/contests/${c.id}`,
            lastModified: c.startTime,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        userRoutes = users.map(u => ({
            url: `${BASE_URL}/user/${encodeURIComponent(u.username)}`,
            lastModified: u.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        }));

        postRoutes = posts.map(p => ({
            url: `${BASE_URL}/posts/${p.id}`,
            lastModified: p.createdAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));
    } catch {
        // DB unavailable — return static routes only
    }

    return [...staticRoutes, ...contestRoutes, ...userRoutes, ...postRoutes];
}
