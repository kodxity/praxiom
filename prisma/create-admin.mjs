import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';

function createPrismaClient() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

const hashed = hashSync('7f1ZT7mlr597JeHjUyh8rd9s7Ai5yjjy', 12);

// Use raw SQL to bypass any column mismatch between schema and DB
await prisma.$executeRaw`
  INSERT INTO "User" (id, username, password, "isAdmin", "isApproved", "createdAt", rating)
  VALUES (gen_random_uuid(), 'admin', ${hashed}, true, true, NOW(), 0)
  ON CONFLICT (username) DO UPDATE
    SET password = ${hashed}, "isAdmin" = true, "isApproved" = true
`;

console.log('Done: admin account created/updated');
await prisma.$disconnect();
