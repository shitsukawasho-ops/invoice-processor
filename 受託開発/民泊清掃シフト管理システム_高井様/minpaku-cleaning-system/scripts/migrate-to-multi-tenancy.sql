-- マルチテナント移行用SQLスクリプト
-- 既存データを保持しながらOrganizationモデルを追加

-- 1. Organizationテーブルを作成
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- 2. slugにユニーク制約を追加
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");

-- 3. デフォルトのOrganizationを作成
INSERT INTO "Organization" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
VALUES ('default-org', 'デフォルト組織', 'default', true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- 4. AdminテーブルにorganizationIdを追加
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
UPDATE "Admin" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL;
ALTER TABLE "Admin" ALTER COLUMN "organizationId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Admin_organizationId_idx" ON "Admin"("organizationId");
ALTER TABLE "Admin" DROP CONSTRAINT IF EXISTS "Admin_organizationId_fkey";
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. PropertyテーブルにorganizationIdを追加
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
UPDATE "Property" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL;
ALTER TABLE "Property" ALTER COLUMN "organizationId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Property_organizationId_idx" ON "Property"("organizationId");
ALTER TABLE "Property" DROP CONSTRAINT IF EXISTS "Property_organizationId_fkey";
ALTER TABLE "Property" ADD CONSTRAINT "Property_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. StaffテーブルにorganizationIdを追加
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
UPDATE "Staff" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL;
ALTER TABLE "Staff" ALTER COLUMN "organizationId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Staff_organizationId_idx" ON "Staff"("organizationId");
ALTER TABLE "Staff" DROP CONSTRAINT IF EXISTS "Staff_organizationId_fkey";
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Settingテーブルを修正（keyのユニーク制約を削除してorganizationId付きに変更）
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
UPDATE "Setting" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL;
ALTER TABLE "Setting" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Setting" DROP CONSTRAINT IF EXISTS "Setting_key_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_organizationId_key_key" ON "Setting"("organizationId", "key");
CREATE INDEX IF NOT EXISTS "Setting_organizationId_idx" ON "Setting"("organizationId");
ALTER TABLE "Setting" DROP CONSTRAINT IF EXISTS "Setting_organizationId_fkey";
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. LineRegistrationテーブルにorganizationIdを追加（オプショナル）
ALTER TABLE "LineRegistration" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
CREATE INDEX IF NOT EXISTS "LineRegistration_organizationId_idx" ON "LineRegistration"("organizationId");
ALTER TABLE "LineRegistration" DROP CONSTRAINT IF EXISTS "LineRegistration_organizationId_fkey";
ALTER TABLE "LineRegistration" ADD CONSTRAINT "LineRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
