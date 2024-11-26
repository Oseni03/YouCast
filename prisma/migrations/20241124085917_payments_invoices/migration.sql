-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER DEFAULT 0,
ADD COLUMN     "subscription" TEXT;

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "payment_time" TEXT NOT NULL,
    "payment_date" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "customer_details" TEXT NOT NULL,
    "payment_intent" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription_id" TEXT NOT NULL,
    "stripe_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "plan_id" TEXT NOT NULL,
    "default_payment_method_id" TEXT,
    "email" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "amount_paid" TEXT NOT NULL,
    "amount_due" TEXT,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
