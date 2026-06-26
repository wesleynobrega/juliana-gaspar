-- CreateEnum
CREATE TYPE "NutrientType" AS ENUM ('PROTEINA', 'CARBOIDRATO', 'FIBRA', 'GORDURA');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('ALMOCO', 'JANTA', 'ALMOCO_JANTA');

-- CreateEnum
CREATE TYPE "SpecialRequestStatus" AS ENUM ('PENDING', 'FULFILLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryZoneId" TEXT,
ADD COLUMN     "mealType" "MealType" NOT NULL DEFAULT 'ALMOCO_JANTA',
ADD COLUMN     "nutritionistPlanId" TEXT,
ADD COLUMN     "sourcePdfUrl" TEXT;

-- AlterTable
ALTER TABLE "WeeklyCycle" ADD COLUMN     "maxClients" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nutrientType" "NutrientType" NOT NULL,
    "photoUrl" TEXT,
    "allergens" TEXT,
    "baseUnit" TEXT NOT NULL DEFAULT 'porção',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalSheet" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "preparationMethod" TEXT NOT NULL,
    "cookingTime" INTEGER NOT NULL,
    "temperature" TEXT,
    "equipment" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderComponent" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionistPlan" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "sourcePdfUrl" TEXT NOT NULL,
    "parsedData" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionistPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "description" TEXT NOT NULL,
    "nutrientType" "NutrientType",
    "status" "SpecialRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalSheet_menuItemId_key" ON "TechnicalSheet"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_cycleId_customerId_key" ON "WaitlistEntry"("cycleId", "customerId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_nutritionistPlanId_fkey" FOREIGN KEY ("nutritionistPlanId") REFERENCES "NutritionistPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalSheet" ADD CONSTRAINT "TechnicalSheet_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderComponent" ADD CONSTRAINT "OrderComponent_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderComponent" ADD CONSTRAINT "OrderComponent_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionistPlan" ADD CONSTRAINT "NutritionistPlan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialRequest" ADD CONSTRAINT "SpecialRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "WeeklyCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
