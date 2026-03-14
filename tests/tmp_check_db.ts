import { prisma } from '../src/lib/db';

async function check() {
  try {
    const groups = await prisma.orgGroup.findMany({
      take: 5,
      select: { id: true, name: true }
    });
    console.log('Groups:', groups);
    
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, username: true }
    });
    console.log('Users:', users);
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    process.exit();
  }
}

check();
