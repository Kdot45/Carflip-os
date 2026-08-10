-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('flipper', 'dealer');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('lead', 'bought', 'repairing', 'listed', 'sold', 'abandoned');

-- CreateEnum
CREATE TYPE "TitleStatus" AS ENUM ('clean', 'salvage', 'rebuilt', 'other');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('exterior', 'engine', 'dash', 'tires', 'underside', 'other');

-- CreateEnum
CREATE TYPE "EstimateSource" AS ENUM ('ai', 'user', 'mixed');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "LineItemCategory" AS ENUM ('mechanical', 'body', 'electrical', 'tires', 'other');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('safety', 'required', 'cosmetic');

-- CreateEnum
CREATE TYPE "AiPurpose" AS ENUM ('triage', 'estimate', 'chat');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "home_zip" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'flipper',
    "default_labor_rate_mechanical" DECIMAL(10,2) NOT NULL DEFAULT 75,
    "default_labor_rate_body" DECIMAL(10,2) NOT NULL DEFAULT 65,
    "default_contingency_pct" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "default_margin_pct" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'lead',
    "vin" TEXT,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "miles" INTEGER NOT NULL,
    "title_status" "TitleStatus" NOT NULL DEFAULT 'clean',
    "asking_price" DECIMAL(10,2) NOT NULL,
    "purchase_price" DECIMAL(10,2),
    "zip_for_deal" TEXT NOT NULL,
    "listing_url" TEXT,
    "listing_notes_text" TEXT,
    "expected_resale_price" DECIMAL(10,2),
    "selling_costs" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "target_profit_amount" DECIMAL(10,2),
    "target_margin_pct" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_photos" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" "PhotoType" NOT NULL DEFAULT 'other',
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obd_readings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "raw_codes_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obd_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_estimates" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "source" "EstimateSource" NOT NULL DEFAULT 'user',
    "confidence" "Confidence" NOT NULL DEFAULT 'medium',
    "parts_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "labor_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "diagnostics_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "consumables_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fees_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "contingency_pct" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "contingency_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_low" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_expected" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_worst" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "suggested_max_bid" DECIMAL(10,2),
    "assumptions_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_line_items" (
    "id" TEXT NOT NULL,
    "estimate_id" TEXT NOT NULL,
    "category" "LineItemCategory" NOT NULL DEFAULT 'mechanical',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'required',
    "parts_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "labor_hours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "labor_rate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "diy_ok" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_runs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "purpose" "AiPurpose" NOT NULL,
    "input_summary" TEXT NOT NULL,
    "output_summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "project_photos_project_id_idx" ON "project_photos"("project_id");

-- CreateIndex
CREATE INDEX "obd_readings_project_id_idx" ON "obd_readings"("project_id");

-- CreateIndex
CREATE INDEX "repair_estimates_project_id_idx" ON "repair_estimates"("project_id");

-- CreateIndex
CREATE INDEX "repair_line_items_estimate_id_idx" ON "repair_line_items"("estimate_id");

-- CreateIndex
CREATE INDEX "receipts_project_id_idx" ON "receipts"("project_id");

-- CreateIndex
CREATE INDEX "checklist_items_project_id_idx" ON "checklist_items"("project_id");

-- CreateIndex
CREATE INDEX "ai_runs_project_id_idx" ON "ai_runs"("project_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_photos" ADD CONSTRAINT "project_photos_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obd_readings" ADD CONSTRAINT "obd_readings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_estimates" ADD CONSTRAINT "repair_estimates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_line_items" ADD CONSTRAINT "repair_line_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "repair_estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
