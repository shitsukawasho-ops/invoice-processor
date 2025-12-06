const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const testEmail = 'test@test.com';
  const testPassword = process.argv[2] || 'test';
  
  console.log('Testing login for:', testEmail);
  console.log('With password:', testPassword);
  
  const admin = await prisma.admin.findUnique({
    where: { email: testEmail },
    include: { organization: true }
  });
  
  if (!admin) {
    console.log('Admin not found!');
    return;
  }
  
  console.log('Admin found:', admin.name);
  
  const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
  console.log('Password valid:', isValid);
  
  if (!isValid) {
    console.log('Hash:', admin.passwordHash.substring(0, 20) + '...');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
