import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const url = process.env.DATABASE_URL;
    console.log('[DEBUG] DB Client creation - URL present:', !!url);
    if (url) {
        console.log('[DEBUG] DB Endpoint:', url.split('@')[1] || 'UNKNOWN');
    }
    const adapter = new PrismaPg({ connectionString: url! });
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
