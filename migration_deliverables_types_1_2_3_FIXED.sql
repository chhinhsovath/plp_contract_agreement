-- Database Migration: Add Deliverables for Agreement Types 1, 2, 3 (FIXED)
-- Date: October 28, 2025
-- Updated to match actual schema: deliverable_title_khmer, deliverable_title_english

-- ============================================================================
-- AGREEMENT 1: PMU ↔ PCU Performance Agreement
-- ============================================================================

-- Deliverable 1: National Strategic Policy & Guidance Framework
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  1,
  1,
  'ឯកសារស្ដង់ដារហាក់ដូច និងនិយមន័យលម្អិតនៃនយោបាយយុទ្ធសាស្ត្រ',
  'National Strategic Policy & Guidance Framework',
  'ប្រចាំឆ្នាំ',
  'នយោបាយស្ដង់ដារ និងឯកសារណែនាំលម្អិត ដែលផ្តល់ជូនគបក ដើម្បីអនុវត្តគម្រោង',
  1,
  true,
  NOW(),
  NOW()
);

-- Deliverable 2: Annual Work Plan & Budget Allocation
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  1,
  2,
  'ផែនការការងារប្រចាំឆ្នាំ និងថវិកាលម្អិត',
  'Annual Work Plan & Budget Allocation',
  'ប្រចាំឆ្នាំ',
  'ផែនការលម្អិត និងថវិកាលម្អិត ដែលផ្តល់ឱ្យគបក ក្នុងរយៈពេលឆ្នាំ',
  2,
  true,
  NOW(),
  NOW()
);

-- Deliverable 3: Quarterly Monitoring & Data System
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  1,
  3,
  'ប្រព័ន្ធត្រួតពិនិត្យ និងប្រមូលទិន្នន័យប្រចាំត្រីមាស',
  'Quarterly Monitoring & Data System',
  'ប្រចាំត្រីមាស',
  'ប្រព័ន្ធស្មារតែ និងប្រមូលទិន្នន័យ ដែលប្រើសម្រាប់វាស់វែងលក្ខណៈវិនិច្ឆ័យសមិទ្ធកម្ម',
  3,
  true,
  NOW(),
  NOW()
);

-- Deliverable 4: Mid-Year & End-Year Performance Evaluation
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  1,
  4,
  'ការវាយតម្លៃសមិទ្ធកម្មក្នុងចុងឆមាស និងចុងឆ្នាំ',
  'Mid-Year & End-Year Performance Evaluation',
  'ប្រចាំឆមាស',
  'របាយការណ៍វាយតម្លៃលម្អិត នៃការសម្រេចបាននូវគោលដៅរបស់គបក',
  4,
  true,
  NOW(),
  NOW()
);

-- Deliverable 5: Coordination & Collaboration Evidence
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  1,
  5,
  'ឯកសារលម្អិតបង្ហាញការសម្របសម្រួល និងសហការ',
  'Coordination & Collaboration Evidence',
  'ប្រចាំឆ្នាំ',
  'ឯកសារលម្អិត ដែលបង្ហាញពីក្រមប្របាមប់ រវាងគបស និងគបក',
  5,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- AGREEMENT 2: PCU Chief ↔ Project Manager Performance Agreement
-- ============================================================================

-- Deliverable 1: Project Operational Management Plan
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  2,
  1,
  'ផែនការគ្រប់គ្រងប្រតិបត្តិការគម្រោង',
  'Project Operational Management Plan',
  'ប្រចាំឆ្នាំ',
  'ផែនការលម្អិត និងនីតិវិធីសម្រាប់គ្រប់គ្រងប្រតិបត្តិការប្រចាំថ្ងៃរបស់គម្រោង',
  1,
  true,
  NOW(),
  NOW()
);

-- Deliverable 2: Coordination & Weekly Meetings
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  2,
  2,
  'ការកម្មវិធីកិច្ចប្រជុំសម្របសម្រួលប្រចាំសប្តាហ៍',
  'Coordination & Weekly Meetings',
  'ប្រចាំសប្តាហ៍',
  'កិច្ចប្រជុំសម្របសម្រួលប្រចាំសប្តាហ៍ រវាងប្រធាននាយកដ្ឋាន និងប្រធានគម្រោង',
  2,
  true,
  NOW(),
  NOW()
);

-- Deliverable 3: Monthly Progress Reports
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  2,
  3,
  'របាយការណ៍វឌ្ឍនភាពប្រតិបត្តិការប្រចាំខែ',
  'Monthly Progress Reports',
  'ប្រចាំខែ',
  'របាយការណ៍លម្អិត នៃលទ្ធផល និងវឌ្ឍនភាពប្រតិបត្តិការគម្រោងរបស់ប្រធាននាយកដ្ឋាន',
  3,
  true,
  NOW(),
  NOW()
);

-- Deliverable 4: Quality Assurance & Checkpoint System
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  2,
  4,
  'ប្រព័ន្ធធានាគុណភាព និងចំណុចត្រួតពិនិត្យ',
  'Quality Assurance & Checkpoint System',
  'ប្រចាំខែ',
  'ប្រព័ន្ធត្រួតពិនិត្យ និងធានាគុណភាព ដើម្បីធានាលក្ខណៈគុណភាពនៃលទ្ធផលគម្រោង',
  4,
  true,
  NOW(),
  NOW()
);

-- Deliverable 5: Risk Management & Problem Resolution
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  2,
  5,
  'ការគ្រប់គ្រងហានិភ័យ និងដោះស្រាយបញ្ហា',
  'Risk Management & Problem Resolution',
  'ប្រចាំខែ',
  'នីតិវិធីក្នុងការកំណត់អត្ថន័យ ការគ្រប់គ្រង ហានិភ័យ ឬបញ្ហាដែលកើតឡើងក្នុងការអនុវត្ត',
  5,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- AGREEMENT 3: Project Manager ↔ Regional Officers Performance Agreement
-- ============================================================================

-- Deliverable 1: Regional Implementation Plans
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  3,
  1,
  'ផែនការអនុវត្តលម្អិតក្នុងតំបន់',
  'Regional Implementation Plans',
  'ប្រចាំឆ្នាំ',
  'ផែនការលម្អិត សម្រាប់អនុវត្តនៅក្នុងតំបន់ផ្សេងៗ (ភាគខាងជើង កើត ត្បូង លិច)',
  1,
  true,
  NOW(),
  NOW()
);

-- Deliverable 2: Field Officer Training & Capacity Building
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  3,
  2,
  'ផែនការបណ្តុះបណ្តាល និងលើកកម្ពស់សមត្ថភាពមន្ត្រីល្អ',
  'Field Officer Training & Capacity Building',
  'ប្រចាំខែ',
  'ផែនការបណ្តុះបណ្តាល និងលើកកម្ពស់សមត្ថភាព របស់មន្ត្រីគម្រោងក្នុងតំបន់',
  2,
  true,
  NOW(),
  NOW()
);

-- Deliverable 3: Monthly Regional Reports & Data Collection
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  3,
  3,
  'របាយការណ៍វឌ្ឍនភាពលម្អិតប្រចាំខែក្នុងតំបន់',
  'Monthly Regional Reports & Data Collection',
  'ប្រចាំខែ',
  'របាយការណ៍ រប់ទាប់ និងទិន្នន័យដែលប្រមូលលម្អិត ក្នុងតំបន់ផ្សេងៗ',
  3,
  true,
  NOW(),
  NOW()
);

-- Deliverable 4: Regional Coordination Meetings
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  3,
  4,
  'កិច្ចប្រជុំសម្របសម្រួលលម្អិតក្នុងតំបន់',
  'Regional Coordination Meetings',
  'ប្រចាំខែ',
  'កិច្ចប្រជុំសម្របសម្រួល រវាងប្រធានគម្រោង និងមន្ត្រីគម្រោងក្នុងតំបន់',
  4,
  true,
  NOW(),
  NOW()
);

-- Deliverable 5: Regional Target Achievement & Impact
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english,
  timeline,
  activities_text,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES (
  3,
  5,
  'លទ្ធផលនៃការសម្រេចបាននូវគោលដៅក្នុងតំបន់',
  'Regional Target Achievement & Impact',
  'ប្រចាំត្រីមាស',
  'ឯកសារលម្អិត ដែលបង្ហាញ លទ្ធផល ផលប៉ះពាល់ នៃការអនុវត្តក្នុងតំបន់',
  5,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Deliverables Inserted Successfully' as Status;

SELECT
  contract_type,
  COUNT(*) as Deliverable_Count
FROM contract_deliverables
WHERE contract_type IN (1, 2, 3)
GROUP BY contract_type
ORDER BY contract_type;

SELECT
  contract_type,
  deliverable_number,
  deliverable_title_khmer,
  deliverable_title_english
FROM contract_deliverables
WHERE contract_type IN (1, 2, 3)
ORDER BY contract_type, deliverable_number;

