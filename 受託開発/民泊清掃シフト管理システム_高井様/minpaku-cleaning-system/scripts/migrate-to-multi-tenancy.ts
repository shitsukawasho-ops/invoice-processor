// マルチテナント移行スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('Starting multi-tenancy migration...');

    try {
        // 1. Organizationテーブルを作成
        console.log('1. Creating Organization table...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Organization" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
      )
    `);

        // 2. slugにユニーク制約を追加
        console.log('2. Adding slug unique constraint...');
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug")
    `);

        // 3. デフォルトのOrganizationを作成
        console.log('3. Creating default organization...');
        await prisma.$executeRawUnsafe(`
      INSERT INTO "Organization" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
      VALUES ('default-org', 'デフォルト組織', 'default', true, NOW(), NOW())
      ON CONFLICT ("slug") DO NOTHING
    `);

        // 4. AdminテーブルにorganizationIdを追加
        console.log('4. Migrating Admin table...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "organizationId" TEXT`);
        await prisma.$executeRawUnsafe(`UPDATE "Admin" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Admin" ALTER COLUMN "organizationId" SET NOT NULL`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Admin_organizationId_idx" ON "Admin"("organizationId")`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Admin" DROP CONSTRAINT IF EXISTS "Admin_organizationId_fkey"`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Admin" ADD CONSTRAINT "Admin_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // 5. PropertyテーブルにorganizationIdを追加
        console.log('5. Migrating Property table...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "organizationId" TEXT`);
        await prisma.$executeRawUnsafe(`UPDATE "Property" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Property" ALTER COLUMN "organizationId" SET NOT NULL`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Property_organizationId_idx" ON "Property"("organizationId")`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Property" DROP CONSTRAINT IF EXISTS "Property_organizationId_fkey"`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Property" ADD CONSTRAINT "Property_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // 6. StaffテーブルにorganizationIdを追加
        console.log('6. Migrating Staff table...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "organizationId" TEXT`);
        await prisma.$executeRawUnsafe(`UPDATE "Staff" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ALTER COLUMN "organizationId" SET NOT NULL`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Staff_organizationId_idx" ON "Staff"("organizationId")`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" DROP CONSTRAINT IF EXISTS "Staff_organizationId_fkey"`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Staff" ADD CONSTRAINT "Staff_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // 7. SettingテーブルにorganizationIdを追加
        console.log('7. Migrating Setting table...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "organizationId" TEXT`);
        await prisma.$executeRawUnsafe(`UPDATE "Setting" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Setting" ALTER COLUMN "organizationId" SET NOT NULL`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Setting" DROP CONSTRAINT IF EXISTS "Setting_key_key"`);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Setting_organizationId_key_key" ON "Setting"("organizationId", "key")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Setting_organizationId_idx" ON "Setting"("organizationId")`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Setting" DROP CONSTRAINT IF EXISTS "Setting_organizationId_fkey"`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Setting" ADD CONSTRAINT "Setting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // 8. LineRegistrationテーブルにorganizationIdを追加（オプショナル）
        console.log('8. Migrating LineRegistration table...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "LineRegistration" ADD COLUMN IF NOT EXISTS "organizationId" TEXT`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "LineRegistration_organizationId_idx" ON "LineRegistration"("organizationId")`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "LineRegistration" DROP CONSTRAINT IF EXISTS "LineRegistration_organizationId_fkey"`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "LineRegistration" ADD CONSTRAINT "LineRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
