-- Database Migration: Add Deliverables for Agreement Types 1, 2, 3
-- Date: October 28, 2025
-- Purpose: Insert 5 deliverables for each of types 1, 2, 3
-- Each deliverable will have 3 options (baseline, mid, target)

-- ============================================================================
-- AGREEMENT 1: PMU ↔ PCU Performance Agreement
-- ============================================================================

-- Deliverable 1: National Strategic Policy & Guidance Framework
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  1,
  1,
  'ឯកសារស្ដង់ដារហាក់ដូច និងនិយមន័យលម្អិតនៃនយោបាយយុទ្ធសាស្ត្រ',
  'National Strategic Policy & Guidance Framework',
  'នយោបាយស្ដង់ដារ និងឯកសារណែនាំលម្អិត ដែលផ្តល់ជូនគបក ដើម្បីអនុវត្តគម្រោង',
  'Comprehensive policy framework and strategic guidance document provided by PMU to PCU for implementation',
  NOW()
);

-- Deliverable 2: Annual Work Plan & Budget Allocation
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  1,
  2,
  'ផែនការការងារប្រចាំឆ្នាំ និងថវិកាលម្អិត',
  'Annual Work Plan & Budget Allocation',
  'ផែនការលម្អិត និងថវិកាលម្អិត ដែលមាន ផ្ដល់ឱ្យគបក ក្នុងរយៈពេលឆ្នាំ',
  'Comprehensive annual work plan with detailed budget breakdown and resource allocation',
  NOW()
);

-- Deliverable 3: Quarterly Monitoring & Data System
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  1,
  3,
  'ប្រព័ន្ធត្រួតពិនិត្យ និងប្រមូលទិន្នន័យប្រចាំត្រីមាស',
  'Quarterly Monitoring & Data System',
  'ប្រព័ន្ធស្មារតែ និងប្រមូលទិន្នន័យ ដែលប្រើសម្រាប់វាស់វែងលក្ខណៈវិនិច្ឆ័យសមិទ្ធកម្ម',
  'Monitoring system and data collection framework for tracking PCU progress against targets',
  NOW()
);

-- Deliverable 4: Mid-Year & End-Year Performance Evaluation
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  1,
  4,
  'ការវាយតម្លៃសមិទ្ធកម្មក្នុងចុងឆមាស និងចុងឆ្នាំ',
  'Mid-Year & End-Year Performance Evaluation',
  'របាយការណ៍វាយតម្លៃលម្អិត នៃការសម្រេចបាននូវគោលដៅរបស់គបក',
  'Formal performance evaluation reports assessing PCU achievement against agreed targets',
  NOW()
);

-- Deliverable 5: Coordination & Collaboration Evidence
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  1,
  5,
  'ឯកសារលម្អិតបង្ហាញការសម្របសម្រួល និងសហការ',
  'Coordination & Collaboration Evidence',
  'ឯកសារលម្អិត ដែលបង្ហាញពីក្រមប្របាមប់ រវាងគបស និងគបក',
  'Documentation of coordination mechanisms and evidence of effective collaboration',
  NOW()
);

-- ============================================================================
-- AGREEMENT 2: PCU Chief ↔ Project Manager Performance Agreement
-- ============================================================================

-- Deliverable 1: Project Operational Management Plan
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  2,
  1,
  'ផែនការគ្រប់គ្រងប្រតិបត្តិការគម្រោង',
  'Project Operational Management Plan',
  'ផែនការលម្អិត និងនីតិវិធីសម្រាប់គ្រប់គ្រងប្រតិបត្តិការប្រចាំថ្ងៃរបស់គម្រោង',
  'Operational procedures and management framework for daily project execution',
  NOW()
);

-- Deliverable 2: Coordination & Weekly Meetings
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  2,
  2,
  'ការកម្មវិធីកិច្ចប្រជុំសម្របសម្រួលប្រចាំសប្តាហ៍',
  'Coordination & Weekly Meetings',
  'កិច្ចប្រជុំសម្របសម្រួលប្រចាំសប្តាហ៍ រវាងប្រធាននាយកដ្ឋាន និងប្រធានគម្រោង',
  'Regular coordination meetings between PCU Chief and Project Manager for project oversight',
  NOW()
);

-- Deliverable 3: Monthly Progress Reports
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  2,
  3,
  'របាយការណ៍វឌ្ឍនភាពប្រតិបត្តិការប្រចាំខែ',
  'Monthly Progress Reports',
  'របាយការណ៍លម្អិត នៃលទ្ធផល និងវឌ្ឍនភាពប្រតិបត្តិការគម្រោងរបស់ប្រធាននាយកដ្ឋាន',
  'Regular monitoring and reporting of project progress to PCU Chief',
  NOW()
);

-- Deliverable 4: Quality Assurance & Checkpoint System
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  2,
  4,
  'ប្រព័ន្ធធានាគុណភាព និងចំណុចត្រួតពិនិត្យ',
  'Quality Assurance & Checkpoint System',
  'ប្រព័ន្ធត្រួតពិនិត្យ និងធានាគុណភាព ដើម្បីធានាលក្ខណៈគុណភាពនៃលទ្ធផលគម្រោង',
  'Quality assurance mechanisms and regular checkpoints to ensure project quality standards',
  NOW()
);

-- Deliverable 5: Risk Management & Problem Resolution
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  2,
  5,
  'ការគ្រប់គ្រងហានិភ័យ និងដោះស្រាយបញ្ហា',
  'Risk Management & Problem Resolution',
  'នីតិវិធីក្នុងការកំណត់អត្ថន័យ ការគ្រប់គ្រង ហានិភ័យ ឬបញ្ហាដែលកើតឡើងក្នុងការអនុវត្ត',
  'Risk identification, mitigation, and problem resolution procedures',
  NOW()
);

-- ============================================================================
-- AGREEMENT 3: Project Manager ↔ Regional Officers Performance Agreement
-- ============================================================================

-- Deliverable 1: Regional Implementation Plans
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  3,
  1,
  'ផែនការអនុវត្តលម្អិតក្នុងតំបន់',
  'Regional Implementation Plans',
  'ផែនការលម្អិត សម្រាប់អនុវត្តនៅក្នុងតំបន់ផ្សេងៗ (ភាគខាងជើង កើត ត្បូង លិច)',
  'Detailed regional work plans for each region (Northern, Eastern, Southern, Western)',
  NOW()
);

-- Deliverable 2: Field Officer Training & Capacity Building
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  3,
  2,
  'ផែនការបណ្តុះបណ្តាល និងលើកកម្ពស់សមត្ថភាពមន្ត្រីល្អ',
  'Field Officer Training & Capacity Building',
  'ផែនការបណ្តុះបណ្តាល និងលើកកម្ពស់សមត្ថភាព របស់មន្ត្រីគម្រោងក្នុងតំបន់',
  'Comprehensive training and capacity building program for regional field officers',
  NOW()
);

-- Deliverable 3: Monthly Regional Reports & Data Collection
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  3,
  3,
  'របាយការណ៍វឌ្ឍនភាពលម្អិតប្រចាំខែក្នុងតំបន់',
  'Monthly Regional Reports & Data Collection',
  'របាយការណ៍ រប់ទាប់ និងទិន្នន័យដែលប្រមូលលម្អិត ក្នុងតំបន់ផ្សេងៗ',
  'Regular field-level data collection and regional progress reporting',
  NOW()
);

-- Deliverable 4: Regional Coordination Meetings
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  3,
  4,
  'កិច្ចប្រជុំសម្របសម្រួលលម្អិតក្នុងតំបន់',
  'Regional Coordination Meetings',
  'កិច្ចប្រជុំសម្របសម្រួល រវាងប្រធានគម្រោង និងមន្ត្រីគម្រោងក្នុងតំបន់',
  'Regular regional coordination meetings between Project Manager and Regional Officers',
  NOW()
);

-- Deliverable 5: Regional Target Achievement & Impact
INSERT INTO contract_deliverables (
  contract_type,
  deliverable_number,
  title_khmer,
  title_english,
  description_khmer,
  description_english,
  created_at
) VALUES (
  3,
  5,
  'លទ្ធផលនៃការសម្រេចបាននូវគោលដៅក្នុងតំបន់',
  'Regional Target Achievement & Impact',
  'ឯកសារលម្អិត ដែលបង្ហាញ លទ្ធផល ផលប៉ះពាល់ នៃការអនុវត្តក្នុងតំបន់',
  'Documentation and verification of regional target achievement and program impact',
  NOW()
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify insertions
SELECT 'Agreement 1 Deliverables' as Type, COUNT(*) as Count
FROM contract_deliverables WHERE contract_type = 1
UNION ALL
SELECT 'Agreement 2 Deliverables', COUNT(*)
FROM contract_deliverables WHERE contract_type = 2
UNION ALL
SELECT 'Agreement 3 Deliverables', COUNT(*)
FROM contract_deliverables WHERE contract_type = 3
UNION ALL
SELECT 'Total Deliverables', COUNT(*)
FROM contract_deliverables WHERE contract_type IN (1, 2, 3);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

