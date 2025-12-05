import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const lineUserId = "Ufd58707cae0301bab1739ed39192100d";
  
  // 佐藤 太郎を検索して更新
  const staff = await prisma.staff.findFirst({
    where: { name: "佐藤 太郎" },
  });

  if (!staff) {
    console.error("Staff '佐藤 太郎' not found");
    return;
  }

  const updated = await prisma.staff.update({
    where: { id: staff.id },
    data: { lineUserId },
  });

  console.log(`Updated staff ${updated.name} with LINE User ID: ${updated.lineUserId}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
