-- Migration: Add Deliverable Options for Agreement Types 1, 2, 3 (CORRECTED with proper Khmer terminology)
-- These options define the baseline → target percentage progression for each deliverable
-- Updated to use "ទិន្នន័យ" (data) as the correct terminology

-- Type 1 Deliverable Options
-- Deliverable 1
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 1,
  'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៩០% ត្រូវបង្កើន ៣-៥% នៅឆ្នាំ',
  'If baseline data is below 90%, increase by 3-5% this year',
  'less_than', 90, 95, 0, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 1;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 2,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩០% ត្រូវបង្កើនដល់ ៩៥%',
  'If baseline data equals 90%, increase to 95%',
  'equal', 90, 95, 1, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 1;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 3,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩៥% ឬលើស ត្រូវរក្សាឲ្យថេរ',
  'If baseline data equals or exceeds 95%, maintain at least the same level',
  'greater_or_equal', 95, 95, 2, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 1;

-- Deliverable 2
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 1,
  'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៨៥% ត្រូវបង្កើន ៨-១០% នៅឆ្នាំ',
  'If baseline data is below 85%, increase by 8-10% this year',
  'less_than', 85, 95, 0, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 2;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 2,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨៥% ត្រូវបង្កើនដល់ ៩៥%',
  'If baseline data equals 85%, increase to 95%',
  'equal', 85, 95, 1, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 2;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 3,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩៥% ឬលើស ត្រូវរក្សាឲ្យថេរ',
  'If baseline data equals or exceeds 95%, maintain at least the same level',
  'greater_or_equal', 95, 95, 2, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 2;

-- Deliverable 3
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 1,
  'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៨០% ត្រូវបង្កើន ១០-១៥% នៅឆ្នាំ',
  'If baseline data is below 80%, increase by 10-15% this year',
  'less_than', 80, 95, 0, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 3;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 2,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨០% ត្រូវបង្កើនដល់ ៩៥%',
  'If baseline data equals 80%, increase to 95%',
  'equal', 80, 95, 1, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 3;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 3,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩៥% ឬលើស ត្រូវរក្សាឲ្យថេរ',
  'If baseline data equals or exceeds 95%, maintain at least the same level',
  'greater_or_equal', 95, 95, 2, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 3;

-- Deliverable 4
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 1,
  'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៧៥% ត្រូវបង្កើន ១២-១៨% នៅឆ្នាំ',
  'If baseline data is below 75%, increase by 12-18% this year',
  'less_than', 75, 90, 0, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 4;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 2,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៧៥% ត្រូវបង្កើនដល់ ៩០%',
  'If baseline data equals 75%, increase to 90%',
  'equal', 75, 90, 1, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 4;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 3,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩០% ឬលើស ត្រូវរក្សាឲ្យថេរ',
  'If baseline data equals or exceeds 90%, maintain at least the same level',
  'greater_or_equal', 90, 90, 2, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 4;

-- Deliverable 5
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 1,
  'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៧០% ត្រូវបង្កើន ១៥-២០% នៅឆ្នាំ',
  'If baseline data is below 70%, increase by 15-20% this year',
  'less_than', 70, 90, 0, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 5;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 2,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៧០% ត្រូវបង្កើនដល់ ៩០%',
  'If baseline data equals 70%, increase to 90%',
  'equal', 70, 90, 1, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 5;

INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, 3,
  'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩០% ឬលើស ត្រូវរក្សាឲ្យថេរ',
  'If baseline data equals or exceeds 90%, maintain at least the same level',
  'greater_or_equal', 90, 90, 2, true, NOW()
FROM contract_deliverables d
WHERE d.contract_type = 1 AND d.deliverable_number = 5;

-- Type 2 Deliverable Options

-- Deliverable 1
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៨៥% ត្រូវបង្កើន ៥-៨% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨៥% ត្រូវបង្កើនដល់ ៩៣%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩៣% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 85%, increase by 5-8% this year' WHEN 2 THEN 'If baseline data equals 85%, increase to 93%' ELSE 'If baseline data equals or exceeds 93%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 85 WHEN 2 THEN 85 ELSE 93 END,
  CASE opt_num WHEN 1 THEN 93 WHEN 2 THEN 93 ELSE 93 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 2 AND d.deliverable_number = 1;

-- Deliverable 2
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៨០% ត្រូវបង្កើន ៧-១០% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨០% ត្រូវបង្កើនដល់ ៩១%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩១% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 80%, increase by 7-10% this year' WHEN 2 THEN 'If baseline data equals 80%, increase to 91%' ELSE 'If baseline data equals or exceeds 91%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 80 WHEN 2 THEN 80 ELSE 91 END,
  CASE opt_num WHEN 1 THEN 91 WHEN 2 THEN 91 ELSE 91 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 2 AND d.deliverable_number = 2;

-- Deliverable 3
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៧៥% ត្រូវបង្កើន ១០-១២% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៧៥% ត្រូវបង្កើនដល់ ៨៩%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨៩% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 75%, increase by 10-12% this year' WHEN 2 THEN 'If baseline data equals 75%, increase to 89%' ELSE 'If baseline data equals or exceeds 89%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 75 WHEN 2 THEN 75 ELSE 89 END,
  CASE opt_num WHEN 1 THEN 89 WHEN 2 THEN 89 ELSE 89 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 2 AND d.deliverable_number = 3;

-- Deliverable 4
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៧០% ត្រូវបង្កើន ១២-១៥% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៧០% ត្រូវបង្កើនដល់ ៨៧%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨៧% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 70%, increase by 12-15% this year' WHEN 2 THEN 'If baseline data equals 70%, increase to 87%' ELSE 'If baseline data equals or exceeds 87%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 70 WHEN 2 THEN 70 ELSE 87 END,
  CASE opt_num WHEN 1 THEN 87 WHEN 2 THEN 87 ELSE 87 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 2 AND d.deliverable_number = 4;

-- Deliverable 5
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៦៥% ត្រូវបង្កើន ១៥-១៨% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៦៥% ត្រូវបង្កើនដល់ ៨៥%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨៥% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 65%, increase by 15-18% this year' WHEN 2 THEN 'If baseline data equals 65%, increase to 85%' ELSE 'If baseline data equals or exceeds 85%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 65 WHEN 2 THEN 65 ELSE 85 END,
  CASE opt_num WHEN 1 THEN 85 WHEN 2 THEN 85 ELSE 85 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 2 AND d.deliverable_number = 5;

-- Type 3 Deliverable Options

-- Deliverable 1
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៨០% ត្រូវបង្កើន ៦-९% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៨០% ត្រូវបង្កើនដល់ ៩២%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩២% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 80%, increase by 6-9% this year' WHEN 2 THEN 'If baseline data equals 80%, increase to 92%' ELSE 'If baseline data equals or exceeds 92%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 80 WHEN 2 THEN 80 ELSE 92 END,
  CASE opt_num WHEN 1 THEN 92 WHEN 2 THEN 92 ELSE 92 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 3 AND d.deliverable_number = 1;

-- Deliverable 2
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៧៥% ត្រូវបង្កើន ८-११% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៧៥% ត្រូវបង្កើនដល់ ៩០%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩០% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 75%, increase by 8-11% this year' WHEN 2 THEN 'If baseline data equals 75%, increase to 90%' ELSE 'If baseline data equals or exceeds 90%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 75 WHEN 2 THEN 75 ELSE 90 END,
  CASE opt_num WHEN 1 THEN 90 WHEN 2 THEN 90 ELSE 90 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 3 AND d.deliverable_number = 2;

-- Deliverable 3
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ७०% ត្រូវបង្កើន १०-១३% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ७०% ត្រូវបង្កើនដល់ ८៨%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ८៨% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 70%, increase by 10-13% this year' WHEN 2 THEN 'If baseline data equals 70%, increase to 88%' ELSE 'If baseline data equals or exceeds 88%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 70 WHEN 2 THEN 70 ELSE 88 END,
  CASE opt_num WHEN 1 THEN 88 WHEN 2 THEN 88 ELSE 88 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 3 AND d.deliverable_number = 3;

-- Deliverable 4
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ६५% ត្រូវបង្កើន ១២-១៥% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ६५% ត្រូវបង្កើនដល់ ८៦%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ८៦% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 65%, increase by 12-15% this year' WHEN 2 THEN 'If baseline data equals 65%, increase to 86%' ELSE 'If baseline data equals or exceeds 86%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 65 WHEN 2 THEN 65 ELSE 86 END,
  CASE opt_num WHEN 1 THEN 86 WHEN 2 THEN 86 ELSE 86 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 3 AND d.deliverable_number = 4;

-- Deliverable 5
INSERT INTO deliverable_options (deliverable_id, option_number, option_text_khmer, option_text_english, condition_type, baseline_percentage, target_percentage, order_index, is_active, updated_at)
SELECT d.id, opt_num,
  CASE opt_num WHEN 1 THEN 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ६०% ត្រូវបង្កើន १४-១७% នៅឆ្នាំ' WHEN 2 THEN 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ६०% ត្រូវបង្កើនដល់ ८៤%' ELSE 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ८៤% ឬលើស ត្រូវរក្សាឲ្យថេរ' END,
  CASE opt_num WHEN 1 THEN 'If baseline data is below 60%, increase by 14-17% this year' WHEN 2 THEN 'If baseline data equals 60%, increase to 84%' ELSE 'If baseline data equals or exceeds 84%, maintain at least the same level' END,
  CASE opt_num WHEN 1 THEN 'less_than' WHEN 2 THEN 'equal' ELSE 'greater_or_equal' END,
  CASE opt_num WHEN 1 THEN 60 WHEN 2 THEN 60 ELSE 84 END,
  CASE opt_num WHEN 1 THEN 84 WHEN 2 THEN 84 ELSE 84 END,
  opt_num - 1, true, NOW()
FROM contract_deliverables d, (SELECT 1 as opt_num UNION SELECT 2 UNION SELECT 3) AS opts
WHERE d.contract_type = 3 AND d.deliverable_number = 5;
