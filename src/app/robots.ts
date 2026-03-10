import { MetadataRoute } from 'next';

const BASE_URL = (process.env.NEXTAUTH_URL ?? 'https://mathshowup2.vercel.app').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/teacher/',
                    '/user/*/settings',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
