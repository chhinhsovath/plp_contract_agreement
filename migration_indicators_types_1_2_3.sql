-- Database Migration: Add Indicators for Agreement Types 1, 2, 3
-- Date: October 28, 2025
-- Purpose: Insert 5 indicators for each of types 1, 2, 3
-- Create contract_indicators linking them with baseline/target values

-- ============================================================================
-- AGREEMENT 1: PMU ↔ PCU Performance Agreement Indicators
-- ============================================================================

-- First, ensure indicators exist in the indicators table
-- These are global indicators that can be reused across contracts

-- Indicator 1: Plan Implementation Rate
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  101,  -- Using 100+ range for Agreement 1
  'ការអនុវត្តផែនការលម្អិត',
  'Plan Implementation Rate',
  'Percentage of planned activities implemented on time and to specification',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 2: Goal Alignment Rate
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  102,
  'ភាពឆបគ្នាលើគោលដៅ',
  'Goal Alignment Rate',
  'Percentage of activities aligned with agreed strategic goals',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 3: Quality of Results
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  103,
  'ការលទ្ធផលមានគុណភាព',
  'Quality of Results',
  'Quality score of deliverables measured against quality standards',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 4: Report Timeliness
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  104,
  'ភាពឆបគ្នាលើកាលវិភាគដាក់របាយការណ៍',
  'Report Timeliness',
  'Percentage of reports submitted on time',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 5: Awareness of Achievement
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  105,
  'ដឹងខ្លួននូវសមិទ្ធកម្ម',
  'Awareness of Achievement',
  'Percentage of stakeholders aware of program achievements',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- ============================================================================
-- AGREEMENT 2: PCU Chief ↔ Project Manager Indicators
-- ============================================================================

-- Indicator 1: Plan Execution Rate
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  201,  -- Using 200+ range for Agreement 2
  'ការអនុវត្តផែនការប្រតិបត្តិការ',
  'Plan Execution Rate',
  'Percentage of operational plan activities completed on schedule',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 2: Budget Efficiency
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  202,
  'ប្រសិទ្ធភាពនៃការប្រើប្រាស់ប្រាក់',
  'Budget Efficiency',
  'Percentage of budget utilized effectively for planned activities',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 3: Project Quality Score
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  203,
  'គុណភាពលទ្ធផលគម្រោង',
  'Project Quality Score',
  'Overall quality assessment of project outputs and deliverables',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 4: Schedule Adherence
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  204,
  'ភាពឆបគ្នាលើកាលវិភាគ',
  'Schedule Adherence',
  'Percentage of project milestones completed on schedule',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 5: Problem Resolution Rate
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  205,
  'ដឹងខ្លួននូវបញ្ហាដែលបានដោះស្រាយ',
  'Problem Resolution Rate',
  'Percentage of identified problems resolved within agreed timeframe',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- ============================================================================
-- AGREEMENT 3: Project Manager ↔ Regional Officers Indicators
-- ============================================================================

-- Indicator 1: Regional Plan Execution
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  301,  -- Using 300+ range for Agreement 3
  'ការអនុវត្តផែនការតាមតំបន់',
  'Regional Plan Execution',
  'Percentage of regional implementation plans executed',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 2: Field Officer Capacity
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  302,
  'សមត្ថភាពរបស់មន្ត្រីល្អ',
  'Field Officer Capacity',
  'Skills and competency assessment score of regional field officers',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 3: Regional Data Quality
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  303,
  'គុណភាពទិន្នន័យក្នុងតំបន់',
  'Regional Data Quality',
  'Quality and completeness of data collected from regional level',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 4: Target Achievement Rate
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  304,
  'ការសម្រេចបាននូវគោលដៅក្នុងតំបន់',
  'Target Achievement Rate',
  'Percentage of regional targets achieved',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- Indicator 5: Community Impact Score
INSERT INTO indicators (
  indicator_number,
  indicator_name_khmer,
  indicator_name_english,
  description,
  created_at
) VALUES (
  305,
  'ផលប៉ះពាល់ដែលរួមចំណែក',
  'Community Impact Score',
  'Assessment of community-level impact and satisfaction',
  NOW()
)
ON CONFLICT (indicator_number) DO NOTHING;

-- ============================================================================
-- LINKING INDICATORS TO CONTRACTS
-- ============================================================================

-- NOTE: These statements assume contracts exist. If they don't, they'll fail
-- with foreign key constraint error. In that case, run after creating contracts.

-- For now, we're just defining the indicators in the database.
-- The linking will happen via the API when contracts are created.

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify indicators were inserted
SELECT
  indicator_number,
  indicator_name_khmer,
  indicator_name_english
FROM indicators
WHERE indicator_number BETWEEN 101 AND 305
ORDER BY indicator_number;

-- Count by agreement type range
SELECT
  CASE
    WHEN indicator_number BETWEEN 101 AND 105 THEN 'Agreement 1'
    WHEN indicator_number BETWEEN 201 AND 205 THEN 'Agreement 2'
    WHEN indicator_number BETWEEN 301 AND 305 THEN 'Agreement 3'
  END as Agreement,
  COUNT(*) as Indicator_Count
FROM indicators
WHERE indicator_number BETWEEN 101 AND 305
GROUP BY Agreement;

-- ============================================================================
-- NOTES ON INDICATOR LINKING
-- ============================================================================

-- When a contract is created for types 1, 2, or 3:
-- 1. API will check contract_type
-- 2. API will select appropriate indicators based on type:
--    - Type 1: Indicators 101-105
--    - Type 2: Indicators 201-205
--    - Type 3: Indicators 301-305
-- 3. API will create contract_indicators records with baseline/target values

-- Example linking (to be executed by API):
--
-- INSERT INTO contract_indicators (
--   contract_id,
--   indicator_id,
--   baseline_percentage,
--   target_percentage,
--   timeline,
--   created_at
-- ) VALUES
-- (contract_id, 101, 85, 95, 'annual', NOW()),
-- (contract_id, 102, 80, 95, 'annual', NOW()),
-- (contract_id, 103, 75, 95, 'annual', NOW()),
-- (contract_id, 104, 90, 100, 'annual', NOW()),
-- (contract_id, 105, 70, 90, 'annual', NOW());

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

