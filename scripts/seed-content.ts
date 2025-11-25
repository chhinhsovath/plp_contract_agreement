import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const contentTexts = [
  // Contract Sign Page
  {
    key: 'contract_sign_page_title',
    text_khmer: 'កិច្ចព្រមព្រៀង',
    text_english: 'Contract Agreement',
    category: 'contract_sign',
    description: 'Main page title for contract reading page'
  },
  {
    key: 'contract_sign_subtitle',
    text_khmer: 'សូមអានកិច្ចសន្យាដោយប្រុងប្រយ័ត្ន មុនពេលចុះហត្ថលេខា',
    text_english: 'Please read the contract carefully before signing',
    category: 'contract_sign',
    description: 'Subtitle on contract reading page'
  },
  {
    key: 'contract_sign_progress_label',
    text_khmer: 'វឌ្ឍនភាពនៃការអាន:',
    text_english: 'Reading Progress:',
    category: 'contract_sign',
    description: 'Progress bar label'
  },
  {
    key: 'contract_sign_scroll_message',
    text_khmer: 'សូមរមូរចុះក្រោមដើម្បីអានកិច្ចសន្យាទាំងស្រុង',
    text_english: 'Please scroll down to read the entire contract',
    category: 'contract_sign',
    description: 'Message to scroll to bottom'
  },
  {
    key: 'contract_sign_completed_title',
    text_khmer: 'អ្នកបានអានកិច្ចសន្យារួចរាល់',
    text_english: 'You have finished reading the contract',
    category: 'contract_sign',
    description: 'Alert title when scrolled to bottom'
  },
  {
    key: 'contract_sign_completed_description',
    text_khmer: 'ឥឡូវនេះអ្នកអាចយល់ព្រម និងបន្តទៅជំហានបន្ទាប់',
    text_english: 'Now you can agree and proceed to the next step',
    category: 'contract_sign',
    description: 'Alert description when scrolled to bottom'
  },
  {
    key: 'contract_sign_agreement_checkbox',
    text_khmer: 'ខ្ញុំបានអាន យល់ និងយល់ព្រមតាមលក្ខខណ្ឌទាំងអស់នៃកិច្ចព្រមព្រៀងនេះ',
    text_english: 'I have read, understood, and agree to all terms of this agreement',
    category: 'contract_sign',
    description: 'Agreement checkbox text'
  },
  {
    key: 'contract_sign_proceed_button',
    text_khmer: 'បន្តទៅជំហានបន្ទាប់',
    text_english: 'Proceed to Next Step',
    category: 'contract_sign',
    description: 'Button to proceed to configuration'
  },
  {
    key: 'contract_sign_success_message',
    text_khmer: 'អ្នកបានអានកិច្ចសន្យារួចរាល់!',
    text_english: 'You have finished reading the contract!',
    category: 'contract_sign',
    description: 'Success message after marking as read'
  },

  // Contract Configure Page
  {
    key: 'contract_configure_page_title',
    text_khmer: 'កំណត់រចនាសម្ព័ន្ធកិច្ចសន្យា',
    text_english: 'Configure Contract',
    category: 'contract_configure',
    description: 'Main page title for configuration'
  },
  {
    key: 'contract_configure_subtitle',
    text_khmer: 'សូមជ្រើសរើសជម្រើសមួយសម្រាប់សមិទ្ធកម្មនីមួយៗ ដោយផ្អែកលើទិន្នន័យមូលដ្ឋានរបស់អ្នក',
    text_english: 'Please select one option for each deliverable based on your baseline data',
    category: 'contract_configure',
    description: 'Subtitle on configuration page'
  },
  {
    key: 'contract_configure_deliverable_label',
    text_khmer: 'សមិទ្ធកម្មទី',
    text_english: 'Deliverable',
    category: 'contract_configure',
    description: 'Label for deliverable number'
  },
  {
    key: 'contract_configure_alert_message',
    text_khmer: 'សូមអានជម្រើសទាំង ៣ ឱ្យបានច្បាស់ហើយជ្រើសរើសជម្រើសដែលត្រូវនឹងស្ថានភាពសាលារៀនក្នុងក្រុងស្រុកខណ្ឌរបស់អ្នក',
    text_english: 'Please read all 3 options carefully and select the one that matches your school situation',
    category: 'contract_configure',
    description: 'Alert message at top of configuration'
  },
  {
    key: 'contract_configure_select_option_label',
    text_khmer: 'សូមជ្រើសរើសជម្រើសមួយ:',
    text_english: 'Please select one option:',
    category: 'contract_configure',
    description: 'Label above option selection'
  },
  {
    key: 'contract_configure_option_label',
    text_khmer: 'ជម្រើសទី',
    text_english: 'Option',
    category: 'contract_configure',
    description: 'Label for option number'
  },
  {
    key: 'contract_configure_baseline_label',
    text_khmer: 'ព័ត៌មាននៃតម្លៃមូលដ្ឋាន',
    text_english: 'Baseline Information',
    category: 'contract_configure',
    description: 'Section title for baseline inputs'
  },
  {
    key: 'contract_configure_target_label',
    text_khmer: 'គោលដៅ:',
    text_english: 'Target:',
    category: 'contract_configure',
    description: 'Label for baseline to target percentage'
  },
  {
    key: 'contract_configure_activities_label',
    text_khmer: 'សកម្មភាព:',
    text_english: 'Activities:',
    category: 'contract_configure',
    description: 'Label for activities text'
  },
  {
    key: 'contract_configure_timeline_label',
    text_khmer: 'ពេលវេលាអនុវត្ត:',
    text_english: 'Implementation Timeline:',
    category: 'contract_configure',
    description: 'Label for timeline'
  },
  {
    key: 'contract_configure_back_button',
    text_khmer: 'ថយក្រោយ',
    text_english: 'Back',
    category: 'contract_configure',
    description: 'Back button text'
  },
  {
    key: 'contract_configure_next_button',
    text_khmer: 'បន្ទាប់',
    text_english: 'Next',
    category: 'contract_configure',
    description: 'Next button text'
  },
  {
    key: 'contract_configure_submit_button',
    text_khmer: 'ពិនិត្យ និងចុះហត្ថលេខា',
    text_english: 'Review and Sign',
    category: 'contract_configure',
    description: 'Final submit button text'
  },
  {
    key: 'contract_configure_success_message',
    text_khmer: 'រក្សាទុកការជ្រើសរើសរបស់អ្នកដោយជោគជ័យ',
    text_english: 'Your selections have been saved successfully',
    category: 'contract_configure',
    description: 'Success message after saving configuration'
  },
  {
    key: 'contract_configure_view_title',
    text_khmer: 'ការជ្រើសរើសសមិទ្ធកម្មរបស់អ្នក',
    text_english: 'Your Deliverable Selections',
    category: 'contract_configure',
    description: 'Title in view mode'
  },
  {
    key: 'contract_configure_view_subtitle',
    text_khmer: 'នេះគឺជាការជ្រើសរើសសមិទ្ធកម្មដែលអ្នកបានជ្រើសរើស',
    text_english: 'These are the deliverable selections you have made',
    category: 'contract_configure',
    description: 'Subtitle in view mode'
  },
  {
    key: 'contract_configure_request_change_button',
    text_khmer: 'ស្នើសុំផ្លាស់ប្តូរការជ្រើសរើស',
    text_english: 'Request Change to Selections',
    category: 'contract_configure',
    description: 'Request change button text'
  },
  {
    key: 'contract_configure_return_dashboard_button',
    text_khmer: 'ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង',
    text_english: 'Return to Dashboard',
    category: 'contract_configure',
    description: 'Return to dashboard button'
  },

  // Contract Submit Page
  {
    key: 'contract_submit_page_title',
    text_khmer: 'ចុះហត្ថលេខាលើកិច្ចសន្យា',
    text_english: 'Sign Contract',
    category: 'contract_submit',
    description: 'Main page title for signature submission'
  },
  {
    key: 'contract_submit_subtitle',
    text_khmer: 'អ្នកបានបំពេញការអាន និងការកំណត់រចនាសម្ព័ន្ធរួចរាល់ សូមចុះហត្ថលេខាដើម្បីបញ្ចប់',
    text_english: 'You have completed reading and configuration. Please sign to finish.',
    category: 'contract_submit',
    description: 'Subtitle on submit page'
  },
  {
    key: 'contract_submit_step_read',
    text_khmer: 'អានកិច្ចសន្យា',
    text_english: 'Read Contract',
    category: 'contract_submit',
    description: 'Step 1 label'
  },
  {
    key: 'contract_submit_step_configure',
    text_khmer: 'កំណត់រចនាសម្ព័ន្ធសមិទ្ធកម្ម',
    text_english: 'Configure Deliverables',
    category: 'contract_submit',
    description: 'Step 2 label'
  },
  {
    key: 'contract_submit_step_sign',
    text_khmer: 'ចុះហត្ថលេខា (ជំហានចុងក្រោយ)',
    text_english: 'Sign (Final Step)',
    category: 'contract_submit',
    description: 'Step 3 label'
  },
  {
    key: 'contract_submit_signature_prompt',
    text_khmer: 'សូមចុះហត្ថលេខារបស់អ្នក',
    text_english: 'Please provide your signature',
    category: 'contract_submit',
    description: 'Alert message for signature'
  },
  {
    key: 'contract_submit_signature_description',
    text_khmer: 'នេះគឺជាជំហានចុងក្រោយក្នុងការបញ្ចប់កិច្ចសន្យា',
    text_english: 'This is the final step to complete the contract',
    category: 'contract_submit',
    description: 'Description for signature section'
  },
  {
    key: 'contract_submit_click_to_sign',
    text_khmer: 'ចុចដើម្បីចុះហត្ថលេខា',
    text_english: 'Click to Sign',
    category: 'contract_submit',
    description: 'Button to open signature modal'
  },
  {
    key: 'contract_submit_signature_saved',
    text_khmer: 'ហត្ថលេខា: បានរក្សាទុក',
    text_english: 'Signature: Saved',
    category: 'contract_submit',
    description: 'Label when signature is saved'
  },
  {
    key: 'contract_submit_button',
    text_khmer: 'បញ្ជូនកិច្ចសន្យា',
    text_english: 'Submit Contract',
    category: 'contract_submit',
    description: 'Final submit button'
  },
  {
    key: 'contract_submit_success_message',
    text_khmer: 'អ្នកបានចុះហត្ថលេខាលើកិច្ចសន្យាដោយជោគជ័យ!',
    text_english: 'You have successfully signed the contract!',
    category: 'contract_submit',
    description: 'Success message after submission'
  },

  // Signature Modal
  {
    key: 'signature_modal_title',
    text_khmer: 'ចុះហត្ថលេខារបស់អ្នក',
    text_english: 'Your Signature',
    category: 'signature',
    description: 'Signature modal title'
  },
  {
    key: 'signature_draw_tab',
    text_khmer: 'គូរហត្ថលេខា',
    text_english: 'Draw Signature',
    category: 'signature',
    description: 'Draw signature tab label'
  },
  {
    key: 'signature_upload_tab',
    text_khmer: 'ផ្ទុកហត្ថលេខា',
    text_english: 'Upload Signature',
    category: 'signature',
    description: 'Upload signature tab label'
  },
  {
    key: 'signature_draw_prompt',
    text_khmer: 'សូមគូរហត្ថលេខារបស់អ្នកខាងក្រោម:',
    text_english: 'Please draw your signature below:',
    category: 'signature',
    description: 'Instruction for drawing signature'
  },
  {
    key: 'signature_upload_prompt',
    text_khmer: 'សូមជ្រើសរើសរូបភាពហត្ថលេខារបស់អ្នក:',
    text_english: 'Please select your signature image:',
    category: 'signature',
    description: 'Instruction for uploading signature'
  },
  {
    key: 'signature_clear_button',
    text_khmer: 'សម្អាត',
    text_english: 'Clear',
    category: 'signature',
    description: 'Clear signature button'
  },
  {
    key: 'signature_cancel_button',
    text_khmer: 'បោះបង់',
    text_english: 'Cancel',
    category: 'signature',
    description: 'Cancel button'
  },
  {
    key: 'signature_save_button',
    text_khmer: 'រក្សាទុក',
    text_english: 'Save',
    category: 'signature',
    description: 'Save signature button'
  },

  // Reconfiguration Request
  {
    key: 'reconfig_request_modal_title',
    text_khmer: 'ស្នើសុំផ្លាស់ប្តូរការជ្រើសរើសសមិទ្ធកម្ម',
    text_english: 'Request to Change Deliverable Selections',
    category: 'reconfiguration',
    description: 'Request change modal title'
  },
  {
    key: 'reconfig_request_alert_message',
    text_khmer: 'ការស្នើសុំផ្លាស់ប្តូរត្រូវការការអនុម័តពី SUPER_ADMIN',
    text_english: 'Change request requires SUPER_ADMIN approval',
    category: 'reconfiguration',
    description: 'Alert in request modal'
  },
  {
    key: 'reconfig_request_alert_description',
    text_khmer: 'សូមបញ្ជាក់ហេតុផលច្បាស់លាស់ថាហេតុអ្វីបានជាអ្នកត្រូវការផ្លាស់ប្តូរការជ្រើសរើសសមិទ្ធកម្មរបស់អ្នក',
    text_english: 'Please clearly explain why you need to change your deliverable selections',
    category: 'reconfiguration',
    description: 'Alert description'
  },
  {
    key: 'reconfig_request_reason_label',
    text_khmer: 'ហេតុផលនៃការស្នើសុំ:',
    text_english: 'Request Reason:',
    category: 'reconfiguration',
    description: 'Label for reason field'
  },
  {
    key: 'reconfig_request_pending_alert',
    text_khmer: 'សំណើផ្លាស់ប្តូររបស់អ្នកកំពុងរង់ចាំការពិនិត្យ',
    text_english: 'Your change request is pending review',
    category: 'reconfiguration',
    description: 'Pending request alert message'
  },

  // Common UI Elements
  {
    key: 'common_loading',
    text_khmer: 'កំពុងផ្ទុក...',
    text_english: 'Loading...',
    category: 'common',
    description: 'Loading text'
  },
  {
    key: 'common_submit',
    text_khmer: 'បញ្ជូន',
    text_english: 'Submit',
    category: 'common',
    description: 'Submit button'
  },
  {
    key: 'common_cancel',
    text_khmer: 'បោះបង់',
    text_english: 'Cancel',
    category: 'common',
    description: 'Cancel button'
  },
  {
    key: 'common_edit',
    text_khmer: 'កែប្រែ',
    text_english: 'Edit',
    category: 'common',
    description: 'Edit button'
  },
  {
    key: 'common_delete',
    text_khmer: 'លុប',
    text_english: 'Delete',
    category: 'common',
    description: 'Delete button'
  },
  {
    key: 'common_save',
    text_khmer: 'រក្សាទុក',
    text_english: 'Save',
    category: 'common',
    description: 'Save button'
  },
  {
    key: 'common_close',
    text_khmer: 'បិទ',
    text_english: 'Close',
    category: 'common',
    description: 'Close button'
  }
]

async function main() {
  console.log('🌱 Seeding content texts...')

  for (const content of contentTexts) {
    await prisma.content_texts.upsert({
      where: { key: content.key },
      update: content,
      create: content
    })
  }

  console.log(`✅ Seeded ${contentTexts.length} content texts`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
