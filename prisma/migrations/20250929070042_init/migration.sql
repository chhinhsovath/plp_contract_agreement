-- CreateTable
CREATE TABLE "public"."contract_types" (
    "id" SERIAL NOT NULL,
    "type_name_khmer" TEXT NOT NULL,
    "type_name_english" TEXT,
    "template_file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" SERIAL NOT NULL,
    "contract_number" TEXT NOT NULL,
    "contract_type_id" INTEGER NOT NULL,
    "party_a_name" TEXT NOT NULL,
    "party_a_position" TEXT,
    "party_a_organization" TEXT,
    "party_b_name" TEXT NOT NULL,
    "party_b_position" TEXT,
    "party_b_organization" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "additional_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "party_a_signature" TEXT,
    "party_a_signed_date" TIMESTAMP(3),
    "party_b_signature" TEXT,
    "party_b_signed_date" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contract_fields" (
    "id" SERIAL NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_value" TEXT,
    "field_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attachments" (
    "id" SERIAL NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "public"."contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "contract_fields_contract_id_field_name_key" ON "public"."contract_fields"("contract_id", "field_name");

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_contract_type_id_fkey" FOREIGN KEY ("contract_type_id") REFERENCES "public"."contract_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contract_fields" ADD CONSTRAINT "contract_fields_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
