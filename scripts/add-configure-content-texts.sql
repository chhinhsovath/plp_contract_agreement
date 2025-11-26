-- Add content_texts for configure page
-- This allows SUPER_ADMIN to edit all text via CMS

-- Baseline Input Labels
INSERT INTO content_texts (key, text_khmer, text_english, category, description) VALUES
('configure_baseline_percentage_label', 'តម្លៃមូលដ្ឋាននៃលទ្ធផលនៅឆ្នាំសិក្សា២០២៤-២០២៥ (%)', 'Baseline value of outcome for 2024-2025 academic year (%)', 'contract_configure', 'Label for baseline percentage input field'),
('configure_baseline_source_label', 'ប្រភពទិន្នន័យមូលដ្ឋាន (ជម្រើស)', 'Baseline data source (Optional)', 'contract_configure', 'Label for baseline source input field'),
('configure_baseline_date_label', 'កាលបរិច្ឆេទដែលបានវាស់វែងតម្លៃមូលដ្ឋាន (ជម្រើស)', 'Date when baseline value was measured (Optional)', 'contract_configure', 'Label for baseline date input field'),
('configure_baseline_notes_label', 'ចំណាំលម្អិតបន្ថែម (ជម្រើស)', 'Additional detailed notes (Optional)', 'contract_configure', 'Label for baseline notes input field')
ON CONFLICT (key) DO UPDATE SET
  text_khmer = EXCLUDED.text_khmer,
  text_english = EXCLUDED.text_english,
  updated_at = CURRENT_TIMESTAMP;

-- Yes/No Question for Type 5 Deliverables 2 & 3
INSERT INTO content_texts (key, text_khmer, text_english, category, description) VALUES
('configure_yesno_question', 'តើលទ្ធផលនេះមានឬទេ?', 'Does this outcome exist?', 'contract_configure', 'Yes/No question for Type 5 deliverables 2 & 3'),
('configure_yes_option', 'បាទ/ចាស', 'Yes', 'contract_configure', 'Yes option in Khmer'),
('configure_no_option', 'ទេ', 'No', 'contract_configure', 'No option in Khmer')
ON CONFLICT (key) DO UPDATE SET
  text_khmer = EXCLUDED.text_khmer,
  text_english = EXCLUDED.text_english,
  updated_at = CURRENT_TIMESTAMP;

-- Input Placeholders
INSERT INTO content_texts (key, text_khmer, text_english, category, description) VALUES
('configure_baseline_percentage_placeholder', 'ឧ. 85.5', 'e.g. 85.5', 'contract_configure', 'Placeholder for baseline percentage input'),
('configure_baseline_source_placeholder', 'ឧ. របាយការណ៍ឆ្នាំ 2024', 'e.g. 2024 Annual Report', 'contract_configure', 'Placeholder for baseline source input'),
('configure_baseline_notes_placeholder', 'ពន្យល់លម្អិតបន្ថែមពីលើតម្លៃមូលដ្ឋាននេះ...', 'Further explanation about this baseline value...', 'contract_configure', 'Placeholder for baseline notes textarea')
ON CONFLICT (key) DO UPDATE SET
  text_khmer = EXCLUDED.text_khmer,
  text_english = EXCLUDED.text_english,
  updated_at = CURRENT_TIMESTAMP;

-- View Mode Display Labels
INSERT INTO content_texts (key, text_khmer, text_english, category, description) VALUES
('configure_baseline_info_title', 'ព័ត៌មាននៃតម្លៃមូលដ្ឋាន', 'Baseline Information', 'contract_configure', 'Title for baseline information section'),
('configure_baseline_percentage_display', 'តម្លៃមូលដ្ឋាន', 'Baseline %', 'contract_configure', 'Display label for baseline percentage'),
('configure_baseline_source_display', 'ប្រភព', 'Source', 'contract_configure', 'Display label for baseline source'),
('configure_baseline_date_display', 'កាលបរិច្ឆេទ', 'Date', 'contract_configure', 'Display label for baseline date'),
('configure_baseline_notes_display', 'ចំណាំ', 'Notes', 'contract_configure', 'Display label for baseline notes')
ON CONFLICT (key) DO UPDATE SET
  text_khmer = EXCLUDED.text_khmer,
  text_english = EXCLUDED.text_english,
  updated_at = CURRENT_TIMESTAMP;

-- Success message
SELECT 'Content texts for configure page added successfully!' as result;
