import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extended content with all remaining static text from all pages
const extendedContent = [
  // Contract Sign - Messages and Errors
  { key: 'sign_already_signed_message', text_khmer: 'អ្នកបានចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងរួចហើយ', text_english: 'You have already signed the contract', category: 'contract_sign', description: 'Message when user already signed' },
  { key: 'sign_already_read_message', text_khmer: 'អ្នកបានអានកិច្ចសន្យារួចហើយ', text_english: 'You have already read the contract', category: 'contract_sign', description: 'Message when user already read' },
  { key: 'sign_no_contract_type_error', text_khmer: 'អ្នកមិនមានប្រភេទកិច្ចសន្យា', text_english: 'You do not have a contract type', category: 'contract_sign', description: 'Error when no contract type' },
  { key: 'sign_agree_warning', text_khmer: 'សូមយល់ព្រមលើកិច្ចសន្យា', text_english: 'Please agree to the contract', category: 'contract_sign', description: 'Warning to agree first' },
  { key: 'sign_save_error', text_khmer: 'មានបញ្ហាក្នុងការរក្សាទុក', text_english: 'Problem saving', category: 'contract_sign', description: 'Save error message' },
  { key: 'sign_connection_error', text_khmer: 'មានបញ្ហាក្នុងការតភ្ជាប់', text_english: 'Connection problem', category: 'contract_sign', description: 'Connection error' },
  { key: 'sign_no_contract_error_title', text_khmer: 'មិនមានកិច្ចសន្យា', text_english: 'No Contract', category: 'contract_sign', description: 'No contract alert title' },
  { key: 'sign_no_contract_error_description', text_khmer: 'មិនអាចរកឃើញកិច្ចសន្យាសម្រាប់អ្នក', text_english: 'Cannot find contract for you', category: 'contract_sign', description: 'No contract alert description' },

  // Contract Sign - Article Labels and Content
  { key: 'sign_party_a_label', text_khmer: 'ភាគី ក:', text_english: 'Party A:', category: 'contract_sign', description: 'Party A label' },
  { key: 'sign_party_b_label', text_khmer: 'ភាគី ខ:', text_english: 'Party B:', category: 'contract_sign', description: 'Party B label' },
  { key: 'sign_representative_label', text_khmer: 'តំណាងដោយ:', text_english: 'Represented by:', category: 'contract_sign', description: 'Representative label' },
  { key: 'sign_position_label', text_khmer: 'មុខតំណែង:', text_english: 'Position:', category: 'contract_sign', description: 'Position label' },
  { key: 'sign_article_1_title', text_khmer: 'មាត្រា ១: គោលបំណង', text_english: 'Article 1: Purpose', category: 'contract_sign', description: 'Article 1 title' },
  { key: 'sign_article_1_content', text_khmer: 'កិច្ចព្រមព្រៀងនេះមានគោលបំណងកំណត់ការទទួលខុសត្រូវ និងកាតព្វកិច្ចរបស់ភាគីទាំងពីរក្នុងការអនុវត្តគម្រោងកម្មវិធីអប់រំ។ ភាគីទាំងពីរយល់ព្រមអនុវត្តតាមលក្ខខណ្ឌ និងកាតព្វកិច្ចដែលបានកំណត់ក្នុងកិច្ចព្រមព្រៀងនេះ។', text_english: 'This agreement defines responsibilities and obligations of both parties in implementing the education program.', category: 'contract_sign', description: 'Article 1 content' },
  { key: 'sign_article_2_title', text_khmer: 'មាត្រា ២: មុខងារនិងទំនួលខុសត្រូវ:', text_english: 'Article 2: Duties and Responsibilities:', category: 'contract_sign', description: 'Article 2 title' },
  { key: 'sign_article_3_title', text_khmer: 'មាត្រា ៣: លក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង:', text_english: 'Article 3: Terms of Agreement:', category: 'contract_sign', description: 'Article 3 title' },
  { key: 'sign_article_4_title', text_khmer: 'មាត្រា ៤: រយៈពេលនៃកិច្ចព្រមព្រៀង', text_english: 'Article 4: Duration of Agreement', category: 'contract_sign', description: 'Article 4 title' },
  { key: 'sign_article_4_content', text_khmer: 'កិច្ចព្រមព្រៀងនេះមានសុពលភាពរយៈពេល ១ឆ្នាំ ចាប់ពីថ្ងៃចុះហត្ថលេខា។ ការបន្តកិច្ចព្រមព្រៀងត្រូវធ្វើឡើងដោយការព្រមព្រៀងរវាងភាគីទាំងពីរ។', text_english: 'This agreement is valid for 1 year from signing date.', category: 'contract_sign', description: 'Article 4 content' },
  { key: 'sign_article_5_title', text_khmer: 'មាត្រា ៥: ការតាមដាន និងវាយតម្លៃ', text_english: 'Article 5: Monitoring and Evaluation', category: 'contract_sign', description: 'Article 5 title' },
  { key: 'sign_article_5_content', text_khmer: 'ភាគីទាំងពីរយល់ព្រមធ្វើការតាមដាន និងវាយតម្លៃការអនុវត្តកិច្ចព្រមព្រៀងជាប្រចាំត្រីមាស។ របាយការណ៍វឌ្ឍនភាពត្រូវដាក់ជូនភាគីពាក់ព័ន្ធតាមពេលវេលាដែលបានកំណត់។', text_english: 'Both parties agree to conduct quarterly M&E.', category: 'contract_sign', description: 'Article 5 content' },
  { key: 'sign_article_6_title', text_khmer: 'មាត្រា ៦: ការកែប្រែកិច្ចព្រមព្រៀង', text_english: 'Article 6: Agreement Amendments', category: 'contract_sign', description: 'Article 6 title' },
  { key: 'sign_article_6_content', text_khmer: 'រាល់ការកែប្រែលើខ្លឹមសារនៃកិច្ចព្រមព្រៀងនេះ ត្រូវធ្វើឡើងជាលាយលក្ខណ៍អក្សរ និងមានការយល់ព្រមពីភាគីទាំងពីរ។', text_english: 'Any amendments must be in writing with mutual consent.', category: 'contract_sign', description: 'Article 6 content' },
  { key: 'sign_article_7_title', text_khmer: 'មាត្រា ៧: ការទទួលខុសត្រូវផ្នែកច្បាប់', text_english: 'Article 7: Legal Responsibilities', category: 'contract_sign', description: 'Article 7 title' },
  { key: 'sign_article_7_content', text_khmer: 'ភាគីទាំងពីរយល់ព្រមគោរពតាមច្បាប់ និងបទប្បញ្ញត្តិជាធរមានទាំងអស់។ ក្នុងករណីមានវិវាទកើតឡើង ភាគីទាំងពីរនឹងដោះស្រាយតាមការចរចា និងការសម្របសម្រួល។', text_english: 'Both parties agree to comply with all laws.', category: 'contract_sign', description: 'Article 7 content' },
  { key: 'sign_article_8_title', text_khmer: 'មាត្រា ៨: ហត្ថលេខា និងការបញ្ជាក់', text_english: 'Article 8: Signature and Confirmation', category: 'contract_sign', description: 'Article 8 title' },
  { key: 'sign_article_8_content', text_khmer: 'កិច្ចព្រមព្រៀងនេះធ្វើឡើងជាពីរច្បាប់ដូចគ្នា ដែលមានសុពលភាពស្មើគ្នា។ ភាគីនីមួយៗរក្សាទុកមួយច្បាប់។', text_english: 'Agreement made in two identical copies.', category: 'contract_sign', description: 'Article 8 content' },
  { key: 'sign_signature_seal_label', text_khmer: 'ហត្ថលេខា និងត្រា', text_english: 'Signature and Seal', category: 'contract_sign', description: 'Signature and seal label' },
  { key: 'sign_end_of_contract', text_khmer: '*** ចុងបញ្ចប់នៃកិច្ចសន្យា ***', text_english: '*** End of Contract ***', category: 'contract_sign', description: 'End marker' },

  // Contract Configure - More Messages
  { key: 'configure_no_access_error', text_khmer: 'អ្នកមិនមានសិទ្ធិចូលប្រើទំព័របង្កើតកិច្ចព្រមព្រៀង', text_english: 'No permission to access configuration', category: 'contract_configure', description: 'No access error' },
  { key: 'configure_invalid_type_error', text_khmer: 'ប្រភេទកិច្ចព្រមព្រៀងមិនត្រឹមត្រូវ', text_english: 'Invalid contract type', category: 'contract_configure', description: 'Invalid type error' },
  { key: 'configure_read_first_warning', text_khmer: 'សូមអានកិច្ចសន្យាជាមុនសិន', text_english: 'Please read contract first', category: 'contract_configure', description: 'Read first warning' },
  { key: 'configure_fetch_current_error', text_khmer: 'មិនអាចទាញយកការជ្រើសរើសបច្ចុប្បន្នបាន', text_english: 'Cannot fetch current selections', category: 'contract_configure', description: 'Fetch selections error' },
  { key: 'configure_data_error', text_khmer: 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ', text_english: 'Problem fetching data', category: 'contract_configure', description: 'Data fetch error' },
  { key: 'configure_load_error', text_khmer: 'មិនអាចទាញយកទិន្នន័យបាន', text_english: 'Cannot load data', category: 'contract_configure', description: 'Load error' },
  { key: 'configure_select_one_warning', text_khmer: 'សូមជ្រើសរើសជម្រើសមួយ', text_english: 'Please select one option', category: 'contract_configure', description: 'Select option warning' },
  { key: 'configure_select_all_error', text_khmer: 'សូមជ្រើសរើសជម្រើសសម្រាប់សមិទ្ធកម្មទាំងអស់', text_english: 'Select all deliverables', category: 'contract_configure', description: 'Select all error' },
  { key: 'configure_save_error', text_khmer: 'មានបញ្ហាក្នុងការរក្សាទុក', text_english: 'Problem saving', category: 'contract_configure', description: 'Save error' },
  { key: 'configure_connection_error', text_khmer: 'មានបញ្ហាក្នុងការតភ្ជាប់', text_english: 'Connection problem', category: 'contract_configure', description: 'Connection error' },

  // Contract Submit - All Messages
  { key: 'submit_already_signed', text_khmer: 'អ្នកបានចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងរួចហើយ', text_english: 'Already signed', category: 'contract_submit', description: 'Already signed message' },
  { key: 'submit_config_required', text_khmer: 'សូមបំពេញការកំណត់រចនាសម្ព័ន្ធជាមុនសិន', text_english: 'Complete configuration first', category: 'contract_submit', description: 'Config required warning' },
  { key: 'submit_read_required', text_khmer: 'សូមអានកិច្ចសន្យាជាមុនសិន', text_english: 'Read contract first', category: 'contract_submit', description: 'Read required warning' },
  { key: 'submit_selections_lost', text_khmer: 'ការជ្រើសរើសរបស់អ្នកបាត់បង់ សូមធ្វើការកំណត់រចនាសម្ព័ន្ធឡើងវិញ', text_english: 'Selections lost, reconfigure', category: 'contract_submit', description: 'Selections lost error' },
  { key: 'submit_signature_warning', text_khmer: 'សូមចុះហត្ថលេខា', text_english: 'Please sign', category: 'contract_submit', description: 'Signature warning' },
  { key: 'submit_signature_error', text_khmer: 'មានបញ្ហាក្នុងការចុះហត្ថលេខា', text_english: 'Problem with signature', category: 'contract_submit', description: 'Signature error' },
  { key: 'submit_connection_error', text_khmer: 'មានបញ្ហាក្នុងការតភ្ជាប់', text_english: 'Connection problem', category: 'contract_submit', description: 'Connection error' },

  // Signature - All Messages
  { key: 'signature_select_warning', text_khmer: 'សូមជ្រើសរើសរូបភាពហត្ថលេខា', text_english: 'Select signature image', category: 'signature', description: 'Select image warning' },
  { key: 'signature_saved', text_khmer: 'ហត្ថលេខាបានរក្សាទុក', text_english: 'Signature saved', category: 'signature', description: 'Saved message' },
  { key: 'signature_invalid_type', text_khmer: 'សូមជ្រើសរើសរូបភាពប្រភេទ PNG ឬ JPG', text_english: 'Select PNG or JPG', category: 'signature', description: 'Invalid type error' },
  { key: 'signature_too_large', text_khmer: 'ទំហំរូបភាពធំពេក (អតិបរមា 2MB)', text_english: 'Image too large (max 2MB)', category: 'signature', description: 'Size error' },
  { key: 'signature_uploaded', text_khmer: 'បានផ្ទុករូបភាពហត្ថលេខា', text_english: 'Signature uploaded', category: 'signature', description: 'Upload success' },
  { key: 'signature_file_hint', text_khmer: '(ប្រភេទ: PNG, JPG | ទំហំអតិបរមា: 2MB)', text_english: '(Type: PNG, JPG | Max: 2MB)', category: 'signature', description: 'File hint' },
  { key: 'signature_uploaded_click_change', text_khmer: '✓ បានផ្ទុករូបភាព (ចុចដើម្បីប្តូរ)', text_english: '✓ Uploaded (click to change)', category: 'signature', description: 'Uploaded status' },
  { key: 'signature_drag_text', text_khmer: 'ចុច ឬអូសរូបភាពមកទីនេះ', text_english: 'Click or drag image here', category: 'signature', description: 'Drag and drop text' },
  { key: 'signature_drag_hint', text_khmer: 'ជ្រើសរើសរូបភាពហត្ថលេខារបស់អ្នក (PNG ឬ JPG)', text_english: 'Select signature (PNG or JPG)', category: 'signature', description: 'Upload hint' },
  { key: 'signature_delete_image', text_khmer: 'លុបរូបភាព', text_english: 'Delete Image', category: 'signature', description: 'Delete image button' },

  // Dashboard - All Content
  { key: 'dashboard_title', text_khmer: 'ផ្ទាំងគ្រប់គ្រង M&E', text_english: 'M&E Dashboard', category: 'dashboard', description: 'Dashboard title' },
  { key: 'dashboard_subtitle', text_khmer: 'តាមដានវឌ្ឍនភាព វាយតម្លៃលទ្ធផល និងផែនការគម្រោង', text_english: 'Monitor, evaluate, and plan', category: 'dashboard', description: 'Dashboard subtitle' },
  { key: 'dashboard_contract_type_filter', text_khmer: 'ប្រភេទកិច្ចព្រមព្រៀង:', text_english: 'Contract Type:', category: 'dashboard', description: 'Contract type filter' },
  { key: 'dashboard_duration_filter', text_khmer: 'រយៈពេល:', text_english: 'Duration:', category: 'dashboard', description: 'Duration filter' },
  { key: 'dashboard_download_contract', text_khmer: 'ទាញយកកិច្ចសន្យា PDF', text_english: 'Download Contract PDF', category: 'dashboard', description: 'Download button' },
  { key: 'dashboard_reset_demo', text_khmer: 'កំណត់ឡើងវិញ', text_english: 'Reset', category: 'dashboard', description: 'Reset button' },
  { key: 'dashboard_total_indicators', text_khmer: 'សូចនាករសរុប', text_english: 'Total Indicators', category: 'dashboard', description: 'Total indicators' },
  { key: 'dashboard_total_activities', text_khmer: 'សកម្មភាពសរុប', text_english: 'Total Activities', category: 'dashboard', description: 'Total activities' },
  { key: 'dashboard_achieved', text_khmer: 'សម្រេច', text_english: 'Achieved', category: 'dashboard', description: 'Achieved label' },
  { key: 'dashboard_completed', text_khmer: 'បានបញ្ចប់', text_english: 'Completed', category: 'dashboard', description: 'Completed label' },
  { key: 'dashboard_on_track', text_khmer: 'តាមគម្រោង', text_english: 'On Track', category: 'dashboard', description: 'On track label' },
  { key: 'dashboard_in_progress', text_khmer: 'កំពុងដំណើរការ', text_english: 'In Progress', category: 'dashboard', description: 'In progress' },
  { key: 'dashboard_overall_progress', text_khmer: 'វឌ្ឍនភាពរួម', text_english: 'Overall Progress', category: 'dashboard', description: 'Overall progress' },
  { key: 'dashboard_tab_indicators', text_khmer: 'សូចនាករ', text_english: 'Indicators', category: 'dashboard', description: 'Indicators tab' },
  { key: 'dashboard_tab_deliverables', text_khmer: 'សមិទ្ធកម្ម', text_english: 'Deliverables', category: 'dashboard', description: 'Deliverables tab' },
  { key: 'dashboard_tab_milestones', text_khmer: 'ចំណុចសំខាន់', text_english: 'Milestones', category: 'dashboard', description: 'Milestones tab' },
  { key: 'dashboard_tab_contracts', text_khmer: 'បញ្ជីកិច្ចសន្យា', text_english: 'Contracts List', category: 'dashboard', description: 'Contracts tab' },
  { key: 'dashboard_create_indicator', text_khmer: 'បង្កើតសូចនាករថ្មី', text_english: 'Create New Indicator', category: 'dashboard', description: 'Create indicator button' },
  { key: 'dashboard_no_indicators', text_khmer: 'គ្មានសូចនាករ', text_english: 'No indicators', category: 'dashboard', description: 'No indicators' },
  { key: 'dashboard_no_deliverables', text_khmer: 'គ្មានសមិទ្ធកម្ម', text_english: 'No deliverables', category: 'dashboard', description: 'No deliverables' },
  { key: 'dashboard_no_milestones', text_khmer: 'មិនទាន់មានទិន្នន័យតាមដានសមិទ្ធកម្ម', text_english: 'No milestone data yet', category: 'dashboard', description: 'No milestones' },
  { key: 'dashboard_no_contracts', text_khmer: 'គ្មានកិច្ចសន្យា', text_english: 'No contracts', category: 'dashboard', description: 'No contracts' },
  { key: 'dashboard_delete_indicator_confirm', text_khmer: 'តើអ្នកចង់លុបសូចនាករនេះមែនទេ?', text_english: 'Delete this indicator?', category: 'dashboard', description: 'Delete confirm' },
  { key: 'dashboard_delete_activity_confirm', text_khmer: 'តើអ្នកចង់លុបសកម្មភាពនេះមែនទេ?', text_english: 'Delete this activity?', category: 'dashboard', description: 'Delete activity confirm' },
  { key: 'dashboard_indicator_deleted', text_khmer: 'សូចនាករបានលុប', text_english: 'Indicator deleted', category: 'dashboard', description: 'Deleted success' },
  { key: 'dashboard_indicator_delete_error', text_khmer: 'មិនអាចលុបសូចនាករបាន', text_english: 'Cannot delete indicator', category: 'dashboard', description: 'Delete error' },
  { key: 'dashboard_activity_deleted', text_khmer: 'សកម្មភាពបានលុប', text_english: 'Activity deleted', category: 'dashboard', description: 'Activity deleted' },
  { key: 'dashboard_activity_delete_error', text_khmer: 'មិនអាចលុបសកម្មភាពបាន', text_english: 'Cannot delete activity', category: 'dashboard', description: 'Activity delete error' },
  { key: 'dashboard_logout_success', text_khmer: 'ចាកចេញដោយជោគជ័យ', text_english: 'Logged out successfully', category: 'dashboard', description: 'Logout success' },
  { key: 'dashboard_logout_error', text_khmer: 'មានបញ្ហាក្នុងការចាកចេញ', text_english: 'Problem logging out', category: 'dashboard', description: 'Logout error' },
  { key: 'dashboard_password_success', text_khmer: 'បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ', text_english: 'Password changed', category: 'dashboard', description: 'Password success' },
  { key: 'dashboard_password_incorrect', text_khmer: 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ', text_english: 'Incorrect password', category: 'dashboard', description: 'Wrong password' },
  { key: 'dashboard_password_error', text_khmer: 'មានបញ្ហាក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់', text_english: 'Password change error', category: 'dashboard', description: 'Password error' },
  { key: 'dashboard_password_min_length', text_khmer: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ', text_english: 'Min 6 characters', category: 'dashboard', description: 'Min length error' },
  { key: 'dashboard_password_mismatch', text_khmer: 'ពាក្យសម្ងាត់មិនដូចគ្នា', text_english: 'Passwords do not match', category: 'dashboard', description: 'Mismatch error' },
  { key: 'dashboard_reset_success', text_khmer: 'កំណត់ដាក់ទិន្នន័យសាកល្បងឡើងវិញដោយជោគជ័យ', text_english: 'Demo reset success', category: 'dashboard', description: 'Reset success' },
  { key: 'dashboard_reset_error', text_khmer: 'មានបញ្ហាក្នុងការកំណត់ឡើងវិញ', text_english: 'Reset problem', category: 'dashboard', description: 'Reset error' },
  { key: 'dashboard_menu_profile', text_khmer: 'ព័ត៌មានផ្ទាល់ខ្លួន', text_english: 'Profile', category: 'dashboard', description: 'Profile menu' },
  { key: 'dashboard_menu_password', text_khmer: 'ផ្លាស់ប្តូរពាក្យសម្ងាត់', text_english: 'Change Password', category: 'dashboard', description: 'Password menu' },
  { key: 'dashboard_menu_configure', text_khmer: 'កំណត់សមិទ្ធកម្ម', text_english: 'Configure Deliverables', category: 'dashboard', description: 'Configure menu' },
  { key: 'dashboard_menu_logout', text_khmer: 'ចាកចេញ', text_english: 'Logout', category: 'dashboard', description: 'Logout menu' },
  { key: 'dashboard_password_modal_title', text_khmer: 'ផ្លាស់ប្តូរពាក្យសម្ងាត់', text_english: 'Change Password', category: 'dashboard', description: 'Password modal title' },
  { key: 'dashboard_current_password', text_khmer: 'ពាក្យសម្ងាត់បច្ចុប្បន្ន', text_english: 'Current Password', category: 'dashboard', description: 'Current password label' },
  { key: 'dashboard_new_password', text_khmer: 'ពាក្យសម្ងាត់ថ្មី', text_english: 'New Password', category: 'dashboard', description: 'New password label' },
  { key: 'dashboard_confirm_password', text_khmer: 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី', text_english: 'Confirm Password', category: 'dashboard', description: 'Confirm password label' },
  { key: 'dashboard_table_code', text_khmer: 'កូដ', text_english: 'Code', category: 'dashboard', description: 'Table: Code' },
  { key: 'dashboard_table_indicator', text_khmer: 'សូចនាករ', text_english: 'Indicator', category: 'dashboard', description: 'Table: Indicator' },
  { key: 'dashboard_table_type', text_khmer: 'ប្រភេទ', text_english: 'Type', category: 'dashboard', description: 'Table: Type' },
  { key: 'dashboard_table_target', text_khmer: 'គោលដៅ', text_english: 'Target', category: 'dashboard', description: 'Table: Target' },
  { key: 'dashboard_table_current', text_khmer: 'បច្ចុប្បន្ន', text_english: 'Current', category: 'dashboard', description: 'Table: Current' },
  { key: 'dashboard_table_progress', text_khmer: 'វឌ្ឍនភាព', text_english: 'Progress', category: 'dashboard', description: 'Table: Progress' },
  { key: 'dashboard_table_status', text_khmer: 'ស្ថានភាព', text_english: 'Status', category: 'dashboard', description: 'Table: Status' },
  { key: 'dashboard_table_actions', text_khmer: 'សកម្មភាព', text_english: 'Actions', category: 'dashboard', description: 'Table: Actions' },
  { key: 'dashboard_input_data', text_khmer: 'បញ្ចូល', text_english: 'Input', category: 'dashboard', description: 'Input data button' },
  { key: 'dashboard_edit_coming_soon', text_khmer: 'មុខងារកែសម្រួលនឹងមានឆាប់ៗនេះ', text_english: 'Edit coming soon', category: 'dashboard', description: 'Edit placeholder' },
  { key: 'dashboard_contract_warning', text_khmer: 'សូមចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងមុនសិន', text_english: 'Sign contract first', category: 'dashboard', description: 'Sign warning' },
  { key: 'dashboard_confirm_yes', text_khmer: 'បាទ/ចាស', text_english: 'Yes', category: 'dashboard', description: 'Yes button' },
  { key: 'dashboard_confirm_no', text_khmer: 'ទេ', text_english: 'No', category: 'dashboard', description: 'No button' }
]

async function main() {
  console.log('🌱 Seeding extended content texts...')

  let created = 0
  let updated = 0

  for (const content of extendedContent) {
    const result = await prisma.content_texts.upsert({
      where: { key: content.key },
      update: content,
      create: content
    })

    if (result.created_at.getTime() === result.updated_at.getTime()) {
      created++
    } else {
      updated++
    }
  }

  console.log(`✅ Created ${created} new content texts`)
  console.log(`✅ Updated ${updated} existing content texts`)
  console.log(`✅ Total: ${extendedContent.length} content texts processed`)

  // Show total count in database
  const total = await prisma.content_texts.count({ where: { is_active: true } })
  console.log(`📊 Total active content texts in database: ${total}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
