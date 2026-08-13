-- DropForeignKey
ALTER TABLE "TechnicalSheetIngredient" DROP CONSTRAINT "TechnicalSheetIngredient_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "TechnicalSheetIngredient" DROP CONSTRAINT "TechnicalSheetIngredient_technicalSheetId_fkey";

-- DropTable
DROP TABLE "Ingredient";

-- DropTable
DROP TABLE "TechnicalSheetIngredient";
