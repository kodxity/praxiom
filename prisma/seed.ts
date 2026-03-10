import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const password = await hash("admin123", 12);
  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password,
      isAdmin: true,
      isApproved: true,
      description: "System Administrator",
    },
    create: {
      username: "admin",
      password,
      isAdmin: true,
      isApproved: true,
      description: "System Administrator",
    },
  });
  console.log({ user });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
