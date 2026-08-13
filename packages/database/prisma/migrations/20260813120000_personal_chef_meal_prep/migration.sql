-- ── Personal Chef + Meal Prep: reestruturação ─────────────────
-- Remove o modelo legado de marmitas por assinatura (ciclos, pedidos,
-- pratos, entregas) e introduz Cliente, PlanoAlimentar, MealPrepSession
-- e PricingConfig. Renomeia tabelas para preservar dados existentes.

-- Drop legacy child tables (CASCADE remove as FKs)
DROP TABLE "OrderComponent" CASCADE;
DROP TABLE "Meal" CASCADE;
DROP TABLE "OrderItem" CASCADE;
DROP TABLE "CycleDish" CASCADE;
DROP TABLE "WaitlistEntry" CASCADE;
DROP TABLE "FavoriteMeal" CASCADE;
DROP TABLE "RecipeItem" CASCADE;

-- Drop legacy parent tables
DROP TABLE "Order" CASCADE;
DROP TABLE "WeeklyCycle" CASCADE;
DROP TABLE "DeliveryZone" CASCADE;
DROP TABLE "Dish" CASCADE;

-- Drop enum órfão (só era usado em "Order")
DROP TYPE "MealType";

-- Novos enums
CREATE TYPE "PlanoOrigem" AS ENUM ('PROFISSIONAL_SAUDE', 'EXPERIENCIA_CHEF');
CREATE TYPE "MealPrepLocal" AS ENUM ('CASA_CLIENTE', 'COZINHA_CHEF');
CREATE TYPE "MealPrepStatus" AS ENUM ('AGENDADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO');

-- Renomeia Customer → Cliente (preserva dados) + campos do profissional de saúde
ALTER TABLE "Customer" RENAME TO "Cliente";
ALTER TABLE "Cliente"
  ADD COLUMN "healthProfessionalName" TEXT,
  ADD COLUMN "healthProfessionalSpecialty" TEXT;

-- Renomeia NutritionistPlan → PlanoAlimentar (preserva dados),
-- remove upload de PDF e adiciona campos do novo modelo
ALTER TABLE "NutritionistPlan" RENAME TO "PlanoAlimentar";
ALTER TABLE "PlanoAlimentar" RENAME COLUMN "customerId" TO "clienteId";
ALTER TABLE "PlanoAlimentar"
  DROP COLUMN "sourcePdfUrl",
  DROP COLUMN "parsedData";
ALTER TABLE "PlanoAlimentar"
  ADD COLUMN "origem" "PlanoOrigem" NOT NULL DEFAULT 'EXPERIENCIA_CHEF',
  ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "period" TEXT,
  ADD COLUMN "healthProfessionalName" TEXT,
  ADD COLUMN "healthProfessionalSpecialty" TEXT;

-- SpecialRequest: renomeia a coluna da FK
ALTER TABLE "SpecialRequest" RENAME COLUMN "customerId" TO "clienteId";

-- MealPrepSession
CREATE TABLE "MealPrepSession" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" "MealPrepLocal" NOT NULL,
    "mealCount" INTEGER,
    "durationHours" INTEGER,
    "status" "MealPrepStatus" NOT NULL DEFAULT 'AGENDADO',
    "groceryService" BOOLEAN NOT NULL DEFAULT false,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPrepSession_pkey" PRIMARY KEY ("id")
);

-- PricingConfig
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PricingConfig_key_key" ON "PricingConfig"("key");

ALTER TABLE "MealPrepSession" ADD CONSTRAINT "MealPrepSession_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealPrepSession" ADD CONSTRAINT "MealPrepSession_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "PlanoAlimentar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
