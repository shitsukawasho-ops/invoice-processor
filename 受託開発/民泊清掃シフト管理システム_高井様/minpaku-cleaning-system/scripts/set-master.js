const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findFirst({
    orderBy: { createdAt: 'asc' }
  });
  
  if (admin) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { isMaster: true }
    });
    console.log('マスター設定完了');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
  } else {
    console.log('管理者アカウントが見つかりません');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
