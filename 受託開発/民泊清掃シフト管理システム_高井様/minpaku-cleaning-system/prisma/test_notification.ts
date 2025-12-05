import { PrismaClient } from "@prisma/client";
import { sendTaskNotifications } from "../src/lib/notification";

const prisma = new PrismaClient();

async function main() {
  // 佐藤 太郎を取得
  const staff = await prisma.staff.findFirst({
    where: { name: "佐藤 太郎" },
  });

  if (!staff) throw new Error("Staff not found");

  // 物件を取得
  const property = await prisma.property.findFirst();
  if (!property) throw new Error("Property not found");

  // テスト用タスクを作成（明日の日付）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const task = await prisma.cleaningTask.create({
    data: {
      propertyId: property.id,
      cleaningDate: tomorrow,
      checkoutTime: "10:00",
      cleaningFee: 5000,
      status: "pending", // 未割当状態で作成
    },
  });

  console.log(`Created test task: ${task.id}`);

  // 通知送信（スタッフを指定して送信）
  // 本来は自動マッチングだが、ここでは強制的にこのスタッフに通知を送る
  // sendTaskNotificationsは通常、候補スタッフ全員に送るが、
  // ここでは手動で通知キューを作って送るか、sendTaskNotificationsのロジックに任せる
  // 今回は sendTaskNotifications を呼び出す（スタッフ割当ロジックが動く）
  
  // 佐藤太郎がこの物件を担当しているか確認
  const assignment = await prisma.staffPropertyAssignment.findUnique({
    where: {
      staffId_propertyId: {
        staffId: staff.id,
        propertyId: property.id,
      },
    },
  });

  if (!assignment) {
    // 担当していなければ割り当てる
    await prisma.staffPropertyAssignment.create({
      data: { staffId: staff.id, propertyId: property.id },
    });
    console.log("Assigned staff to property");
  }

  console.log("Sending notifications...");
  await sendTaskNotifications(task.id);
  console.log("Notification process completed");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
