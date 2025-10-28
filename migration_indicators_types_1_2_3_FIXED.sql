-- Database Migration: Add Indicators for Agreement Types 1, 2, 3 (FIXED)
-- Date: October 28, 2025
-- Create 5 indicators for each agreement type with proper schema

-- ============================================================================
-- AGREEMENT 1: PMU ↔ PCU Performance Agreement Indicators
-- ============================================================================

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR1-IND-001',
  101,
  'ការអនុវត្តផែនការលម្អិត',
  'Plan Implementation Rate',
  85.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of planned activities implemented"}'::jsonb,
  'ភាគរយនៃសកម្មភាពដែលបានផែនការអនុវត្ត',
  'Percentage of planned activities implemented on time and to specification',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR1-IND-002',
  102,
  'ភាពឆបគ្នាលើគោលដៅ',
  'Goal Alignment Rate',
  80.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of activities aligned with strategic goals"}'::jsonb,
  'ភាគរយនៃសកម្មភាពឆបគ្នាលើគោលដៅយុទ្ធសាស្ត្រ',
  'Percentage of activities aligned with agreed strategic goals',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR1-IND-003',
  103,
  'ការលទ្ធផលមានគុណភាព',
  'Quality of Results',
  75.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "score", "description": "Quality score of deliverables"}'::jsonb,
  'ពិន្ទុគុណភាពលទ្ធផល',
  'Quality score of deliverables measured against quality standards',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR1-IND-004',
  104,
  'ភាពឆបគ្នាលើកាលវិភាគដាក់របាយការណ៍',
  'Report Timeliness',
  90.0,
  100.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of reports submitted on time"}'::jsonb,
  'ភាគរយរបាយការណ៍ដាក់ឱ្យដល់ទាន់ពេលវេលា',
  'Percentage of reports submitted on time',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR1-IND-005',
  105,
  'ដឹងខ្លួននូវសមិទ្ធកម្ម',
  'Awareness of Achievement',
  70.0,
  90.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of stakeholders aware of achievements"}'::jsonb,
  'ភាគរយអ្នកចាប់អារម្មណ៍ដឹងពីសមិទ្ធកម្ម',
  'Percentage of stakeholders aware of program achievements',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- AGREEMENT 2: PCU Chief ↔ Project Manager Indicators
-- ============================================================================

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR2-IND-001',
  201,
  'ការអនុវត្តផែនការប្រតិបត្តិការ',
  'Plan Execution Rate',
  90.0,
  98.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of operational plan activities completed"}'::jsonb,
  'ភាគរយសកម្មភាពផែនការប្រតិបត្តិការបានអនុវត្ត',
  'Percentage of operational plan activities completed on schedule',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR2-IND-002',
  202,
  'ប្រសិទ្ធភាពនៃការប្រើប្រាស់ប្រាក់',
  'Budget Efficiency',
  85.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of budget utilized effectively"}'::jsonb,
  'ភាគរយថវិកាប្រើប្រាស់យ៉ាងមានប្រសិទ្ធភាព',
  'Percentage of budget utilized effectively for planned activities',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR2-IND-003',
  203,
  'គុណភាពលទ្ធផលគម្រោង',
  'Project Quality Score',
  75.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "score", "description": "Overall quality assessment of project outputs"}'::jsonb,
  'ពិន្ទុគុណភាពលទ្ធផលគម្រោង',
  'Overall quality assessment of project outputs and deliverables',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR2-IND-004',
  204,
  'ភាពឆបគ្នាលើកាលវិភាគ',
  'Schedule Adherence',
  85.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of milestones completed on schedule"}'::jsonb,
  'ភាគរយលក្ខណៈម៉ាយល៍បានសម្រេច',
  'Percentage of project milestones completed on schedule',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR2-IND-005',
  205,
  'ដឹងខ្លួននូវបញ្ហាដែលបានដោះស្រាយ',
  'Problem Resolution Rate',
  80.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of problems resolved within timeframe"}'::jsonb,
  'ភាគរយបញ្ហាដែលបានដោះស្រាយក្នុងរយៈពេល',
  'Percentage of identified problems resolved within agreed timeframe',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- AGREEMENT 3: Project Manager ↔ Regional Officers Indicators
-- ============================================================================

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR3-IND-001',
  301,
  'ការអនុវត្តផែនការតាមតំបន់',
  'Regional Plan Execution',
  80.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of regional implementation plans executed"}'::jsonb,
  'ភាគរយផែនការអនុវត្តក្នុងតំបន់',
  'Percentage of regional implementation plans executed',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR3-IND-002',
  302,
  'សមត្ថភាពរបស់មន្ត្រីល្អ',
  'Field Officer Capacity',
  70.0,
  90.0,
  false,
  'January',
  'December',
  '{"method": "score", "description": "Skills and competency assessment of field officers"}'::jsonb,
  'ពិន្ទុសមត្ថភាពមន្ត្រីល្អ',
  'Skills and competency assessment score of regional field officers',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR3-IND-003',
  303,
  'គុណភាពទិន្នន័យក្នុងតំបន់',
  'Regional Data Quality',
  75.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Quality and completeness of regional data"}'::jsonb,
  'គុណភាពលក្ខណៈទិន្នន័យក្នុងតំបន់',
  'Quality and completeness of data collected from regional level',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR3-IND-004',
  304,
  'ការសម្រេចបាននូវគោលដៅក្នុងតំបន់',
  'Target Achievement Rate',
  75.0,
  95.0,
  false,
  'January',
  'December',
  '{"method": "percentage", "description": "Percentage of regional targets achieved"}'::jsonb,
  'ភាគរយគោលដៅក្នុងតំបន់បានសម្រេច',
  'Percentage of regional targets achieved',
  true,
  NOW(),
  NOW()
);

INSERT INTO indicators (
  indicator_code,
  indicator_number,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage,
  is_reduction_target,
  implementation_start,
  implementation_end,
  calculation_rules,
  description_km,
  description_en,
  is_active,
  created_at,
  updated_at
) VALUES (
  'AGR3-IND-005',
  305,
  'ផលប៉ះពាល់ដែលរួមចំណែក',
  'Community Impact Score',
  70.0,
  92.0,
  false,
  'January',
  'December',
  '{"method": "score", "description": "Assessment of community-level impact"}'::jsonb,
  'ពិន្ទុផលប៉ះពាល់ដែលរួមចំណែក',
  'Assessment of community-level impact and satisfaction',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Indicators Inserted Successfully' as Status;

SELECT
  indicator_number,
  indicator_code,
  indicator_name_km,
  indicator_name_en,
  baseline_percentage,
  target_percentage
FROM indicators
WHERE indicator_number BETWEEN 101 AND 305
ORDER BY indicator_number;

