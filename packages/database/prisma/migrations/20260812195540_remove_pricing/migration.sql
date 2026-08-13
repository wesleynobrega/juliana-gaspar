-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Subscription";

-- AlterTable
ALTER TABLE "DeliveryZone" DROP COLUMN "fee";

-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "planType",
DROP COLUMN "paymentStatus",
DROP COLUMN "totalAmount";

-- AlterTable
ALTER TABLE "OrderComponent" DROP COLUMN "unitPrice";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "unitPrice";

-- AlterTable
ALTER TABLE "TechnicalSheet" DROP COLUMN "price";
