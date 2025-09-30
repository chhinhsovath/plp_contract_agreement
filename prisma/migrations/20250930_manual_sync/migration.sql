-- Sync database with schema changes

-- Add contract_type column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'contract_type'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "contract_type" INTEGER;
  END IF;
END $$;

-- Update default role from VIEWER to PARTNER
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PARTNER';

-- Create M&E tables

-- CreateTable me_indicators
CREATE TABLE IF NOT EXISTS "me_indicators" (
    "id" SERIAL NOT NULL,
    "indicator_code" TEXT NOT NULL,
    "indicator_name_khmer" TEXT NOT NULL,
    "indicator_name_english" TEXT,
    "indicator_type" TEXT NOT NULL,
    "measurement_unit" TEXT NOT NULL,
    "baseline_value" DOUBLE PRECISION,
    "target_value" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "contract_type" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable me_activities
CREATE TABLE IF NOT EXISTS "me_activities" (
    "id" SERIAL NOT NULL,
    "activity_code" TEXT NOT NULL,
    "activity_name_khmer" TEXT NOT NULL,
    "activity_name_english" TEXT,
    "indicator_id" INTEGER NOT NULL,
    "contract_id" INTEGER,
    "planned_start" TIMESTAMP(3) NOT NULL,
    "planned_end" TIMESTAMP(3) NOT NULL,
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "budget_allocated" DOUBLE PRECISION,
    "budget_spent" DOUBLE PRECISION,
    "responsible_person" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable me_milestones
CREATE TABLE IF NOT EXISTS "me_milestones" (
    "id" SERIAL NOT NULL,
    "milestone_name" TEXT NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "completion_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "deliverables" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable me_beneficiaries
CREATE TABLE IF NOT EXISTS "me_beneficiaries" (
    "id" SERIAL NOT NULL,
    "beneficiary_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER,
    "phone_number" TEXT,
    "location_province" TEXT NOT NULL,
    "location_district" TEXT NOT NULL,
    "location_commune" TEXT,
    "location_village" TEXT,
    "school_name" TEXT,
    "grade_level" TEXT,
    "teacher_type" TEXT,
    "special_needs" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable me_data_collection
CREATE TABLE IF NOT EXISTS "me_data_collection" (
    "id" SERIAL NOT NULL,
    "indicator_id" INTEGER NOT NULL,
    "activity_id" INTEGER,
    "beneficiary_id" INTEGER,
    "collection_date" TIMESTAMP(3) NOT NULL,
    "value_numeric" DOUBLE PRECISION,
    "value_text" TEXT,
    "value_boolean" BOOLEAN,
    "data_source" TEXT,
    "collector_name" TEXT,
    "collector_id" INTEGER,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "verified_by" TEXT,
    "verified_date" TIMESTAMP(3),
    "location_province" TEXT,
    "location_district" TEXT,
    "notes" TEXT,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_data_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable me_training_attendance
CREATE TABLE IF NOT EXISTS "me_training_attendance" (
    "id" SERIAL NOT NULL,
    "training_name" TEXT NOT NULL,
    "training_date" TIMESTAMP(3) NOT NULL,
    "beneficiary_id" INTEGER NOT NULL,
    "attendance_status" TEXT NOT NULL,
    "pre_test_score" DOUBLE PRECISION,
    "post_test_score" DOUBLE PRECISION,
    "certificate_issued" BOOLEAN NOT NULL DEFAULT false,
    "feedback_score" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_training_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable me_reports
CREATE TABLE IF NOT EXISTS "me_reports" (
    "id" SERIAL NOT NULL,
    "report_type" TEXT NOT NULL,
    "report_period_start" TIMESTAMP(3) NOT NULL,
    "report_period_end" TIMESTAMP(3) NOT NULL,
    "generated_by" TEXT NOT NULL,
    "generated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "report_data" JSONB NOT NULL,
    "summary" TEXT,
    "recommendations" TEXT,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "me_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "me_indicators_indicator_code_key" ON "me_indicators"("indicator_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "me_activities_activity_code_key" ON "me_activities"("activity_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "me_beneficiaries_beneficiary_code_key" ON "me_beneficiaries"("beneficiary_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "me_data_collection_collection_date_idx" ON "me_data_collection"("collection_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "me_data_collection_indicator_id_collection_date_idx" ON "me_data_collection"("indicator_id", "collection_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "me_training_attendance_training_date_idx" ON "me_training_attendance"("training_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "me_training_attendance_beneficiary_id_idx" ON "me_training_attendance"("beneficiary_id");

-- AddForeignKey
ALTER TABLE "me_activities" ADD CONSTRAINT "me_activities_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "me_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "me_milestones" ADD CONSTRAINT "me_milestones_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "me_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "me_data_collection" ADD CONSTRAINT "me_data_collection_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "me_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "me_data_collection" ADD CONSTRAINT "me_data_collection_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "me_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "me_data_collection" ADD CONSTRAINT "me_data_collection_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "me_beneficiaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "me_training_attendance" ADD CONSTRAINT "me_training_attendance_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "me_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;