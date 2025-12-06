import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // デフォルト組織をまず確認/作成
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      id: "default-org",
      name: "デフォルト組織",
      slug: "default",
    },
  });

  console.log("Created/found organization:", defaultOrg.name);

  // 管理者ユーザーの作成
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "管理者",
      organizationId: defaultOrg.id,
    },
  });

  console.log("Created admin:", admin.email);

  // サンプル物件の作成
  const properties = await Promise.all([
    prisma.property.upsert({
      where: { id: "prop-1" },
      update: {},
      create: {
        id: "prop-1",
        organizationId: defaultOrg.id,
        name: "サンシャインコンドミニアム 301号室",
        address: "東京都新宿区西新宿1-1-1",
        checkoutTime: "11:00",
        cleaningDurationMinutes: 90,
        cleaningFee: 5000,
      },
    }),
    prisma.property.upsert({
      where: { id: "prop-2" },
      update: {},
      create: {
        id: "prop-2",
        organizationId: defaultOrg.id,
        name: "レイクビューマンション 502号室",
        address: "東京都渋谷区代々木2-2-2",
        checkoutTime: "10:00",
        cleaningDurationMinutes: 120,
        cleaningFee: 7000,
      },
    }),
    prisma.property.upsert({
      where: { id: "prop-3" },
      update: {},
      create: {
        id: "prop-3",
        organizationId: defaultOrg.id,
        name: "グリーンハイツ 203号室",
        address: "東京都港区六本木3-3-3",
        checkoutTime: "11:00",
        cleaningDurationMinutes: 60,
        cleaningFee: 4000,
      },
    }),
  ]);

  console.log("Created properties:", properties.length);

  // サンプルスタッフの作成
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: "staff-1" },
      update: {},
      create: {
        id: "staff-1",
        organizationId: defaultOrg.id,
        name: "田中 花子",
        phone: "090-1234-5678",
        lineUserId: null,
      },
    }),
    prisma.staff.upsert({
      where: { id: "staff-2" },
      update: {},
      create: {
        id: "staff-2",
        organizationId: defaultOrg.id,
        name: "佐藤 太郎",
        phone: "090-2345-6789",
        lineUserId: null,
      },
    }),
    prisma.staff.upsert({
      where: { id: "staff-3" },
      update: {},
      create: {
        id: "staff-3",
        organizationId: defaultOrg.id,
        name: "鈴木 美咲",
        phone: "090-3456-7890",
        lineUserId: null,
      },
    }),
  ]);

  console.log("Created staff:", staff.length);

  // スタッフと物件の割当
  await prisma.staffPropertyAssignment.deleteMany({});
  await Promise.all([
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-1", propertyId: "prop-1" },
    }),
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-1", propertyId: "prop-2" },
    }),
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-2", propertyId: "prop-2" },
    }),
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-2", propertyId: "prop-3" },
    }),
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-3", propertyId: "prop-1" },
    }),
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-3", propertyId: "prop-2" },
    }),
    prisma.staffPropertyAssignment.create({
      data: { staffId: "staff-3", propertyId: "prop-3" },
    }),
  ]);

  console.log("Created staff-property assignments");

  // サンプル清掃タスクの作成
  const today = new Date();
  const tasks = await Promise.all([
    prisma.cleaningTask.upsert({
      where: { id: "task-1" },
      update: {},
      create: {
        id: "task-1",
        propertyId: "prop-1",
        staffId: "staff-1",
        cleaningDate: today,
        checkoutTime: "11:00",
        status: "confirmed",
        cleaningFee: 5000,
        notificationSentAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        acceptedAt: new Date(today.getTime() - 23 * 60 * 60 * 1000),
      },
    }),
    prisma.cleaningTask.upsert({
      where: { id: "task-2" },
      update: {},
      create: {
        id: "task-2",
        propertyId: "prop-2",
        cleaningDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        checkoutTime: "10:00",
        status: "notifying",
        cleaningFee: 7000,
        notificationSentAt: new Date(),
      },
    }),
    prisma.cleaningTask.upsert({
      where: { id: "task-3" },
      update: {},
      create: {
        id: "task-3",
        propertyId: "prop-3",
        cleaningDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        checkoutTime: "11:00",
        status: "pending",
        cleaningFee: 4000,
      },
    }),
    prisma.cleaningTask.upsert({
      where: { id: "task-4" },
      update: {},
      create: {
        id: "task-4",
        propertyId: "prop-1",
        cleaningDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        checkoutTime: "11:00",
        status: "pending",
        cleaningFee: 5000,
      },
    }),
  ]);

  console.log("Created cleaning tasks:", tasks.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
