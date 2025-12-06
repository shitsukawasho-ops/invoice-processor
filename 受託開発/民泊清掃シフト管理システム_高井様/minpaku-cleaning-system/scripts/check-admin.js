const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findUnique({
    where: { email: 'test@test.com' }
  });
  
  if (admin) {
    console.log('Admin found:', admin.email);
    console.log('Password hash exists:', !!admin.passwordHash);
    console.log('Hash length:', admin.passwordHash.length);
    console.log('Hash valid format:', admin.passwordHash.startsWith('$2'));
  } else {
    console.log('Admin not found');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
