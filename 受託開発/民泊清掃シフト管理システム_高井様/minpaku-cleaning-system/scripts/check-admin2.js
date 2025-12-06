const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findUnique({
    where: { email: 'test@test.com' },
    include: { organization: true }
  });
  
  if (admin) {
    console.log('Admin:', JSON.stringify({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isMaster: admin.isMaster,
      orgId: admin.organizationId,
      orgName: admin.organization?.name
    }, null, 2));
  } else {
    console.log('Admin not found');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
