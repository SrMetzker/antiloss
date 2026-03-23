-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM (
  'SPIRITS',
  'BEER',
  'WINE',
  'COCKTAILS',
  'SOFT_DRINKS',
  'FOOD',
  'OTHER'
);

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "category" "ProductCategory" NOT NULL DEFAULT 'OTHER';
