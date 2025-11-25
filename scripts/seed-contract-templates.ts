import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const contractTemplateContent = [
  // Contract Type 1: PMU-PCU
  { key: 'contract_1_title', text_khmer: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង គបស និង គបក', text_english: 'Achievement Agreement between PMU and PCU', category: 'contract_templates', description: 'Contract 1 title' },
  { key: 'contract_1_party_b', text_khmer: 'គណៈកម្មការគ្រប់គ្រងគម្រោងថ្នាក់ក្រោមជាតិ (គបក)', text_english: 'Provincial Committee for Project Management (PCU)', category: 'contract_templates', description: 'Contract 1 Party B' },
  { key: 'contract_1_responsibility_1', text_khmer: 'ផ្តល់ការណែនាំគោលនយោបាយ និងយុទ្ធសាស្ត្រ', text_english: 'Provide policy and strategy guidance', category: 'contract_templates', description: 'Contract 1 responsibility 1' },
  { key: 'contract_1_responsibility_2', text_khmer: 'អនុម័តផែនការការងារ និងថវិកាប្រចាំឆ្នាំ', text_english: 'Approve annual work plan and budget', category: 'contract_templates', description: 'Contract 1 responsibility 2' },
  { key: 'contract_1_responsibility_3', text_khmer: 'តាមដាន និងវាយតម្លៃការអនុវត្តគម្រោង', text_english: 'Monitor and evaluate project implementation', category: 'contract_templates', description: 'Contract 1 responsibility 3' },
  { key: 'contract_1_responsibility_4', text_khmer: 'សម្របសម្រួលជាមួយភាគីពាក់ព័ន្ធ', text_english: 'Coordinate with stakeholders', category: 'contract_templates', description: 'Contract 1 responsibility 4' },
  { key: 'contract_1_responsibility_5', text_khmer: 'ធានាការអនុវត្តតាមបទដ្ឋានគតិយុត្តិ', text_english: 'Ensure implementation according to quality standards', category: 'contract_templates', description: 'Contract 1 responsibility 5' },
  { key: 'contract_1_content_intro', text_khmer: 'កិច្ចព្រមព្រៀងនេះមានគោលបំណងកំណត់ការទទួលខុសត្រូវ និងកាតព្វកិច្ចរបស់គណៈកម្មការគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ និងថ្នាក់ក្រោមជាតិ។', text_english: 'This agreement defines responsibilities of national and provincial committees.', category: 'contract_templates', description: 'Contract 1 intro paragraph' },
  { key: 'contract_1_conditions_title', text_khmer: 'លក្ខខណ្ឌទូទៅ:', text_english: 'General Conditions:', category: 'contract_templates', description: 'Contract 1 conditions title' },
  { key: 'contract_1_condition_duration', text_khmer: 'រយៈពេលកិច្ចព្រមព្រៀង: ១ឆ្នាំ', text_english: 'Agreement duration: 1 year', category: 'contract_templates', description: 'Contract 1 duration' },
  { key: 'contract_1_condition_budget', text_khmer: 'ថវិកាសរុប: តាមការអនុម័តប្រចាំឆ្នាំ', text_english: 'Total budget: As approved annually', category: 'contract_templates', description: 'Contract 1 budget' },
  { key: 'contract_1_condition_evaluation', text_khmer: 'ការវាយតម្លៃ: ប្រចាំត្រីមាស', text_english: 'Evaluation: Quarterly', category: 'contract_templates', description: 'Contract 1 evaluation' },

  // Contract Type 2: PCU-Project Manager
  { key: 'contract_2_title', text_khmer: 'កិច្ចព្រមព្រៀងរវាង គបក និងអ្នកគ្រប់គ្រងគម្រោង', text_english: 'Agreement between PCU and Project Manager', category: 'contract_templates', description: 'Contract 2 title' },
  { key: 'contract_2_party_b', text_khmer: 'អ្នកគ្រប់គ្រងគម្រោង', text_english: 'Project Manager', category: 'contract_templates', description: 'Contract 2 Party B' },
  { key: 'contract_2_responsibility_1', text_khmer: 'អនុវត្តផែនការការងារតាមការណែនាំ', text_english: 'Implement work plan as guided', category: 'contract_templates', description: 'Contract 2 responsibility 1' },
  { key: 'contract_2_responsibility_2', text_khmer: 'គ្រប់គ្រងថវិកា និងធនធានគម្រោង', text_english: 'Manage project budget and resources', category: 'contract_templates', description: 'Contract 2 responsibility 2' },
  { key: 'contract_2_responsibility_3', text_khmer: 'រាយការណ៍វឌ្ឍនភាពប្រចាំខែ', text_english: 'Monthly progress reporting', category: 'contract_templates', description: 'Contract 2 responsibility 3' },
  { key: 'contract_2_responsibility_4', text_khmer: 'សហការជាមួយអង្គភាពអនុវត្ត', text_english: 'Collaborate with implementing units', category: 'contract_templates', description: 'Contract 2 responsibility 4' },
  { key: 'contract_2_responsibility_5', text_khmer: 'រក្សាឯកសារ និងទិន្នន័យគម្រោង', text_english: 'Maintain project documents and data', category: 'contract_templates', description: 'Contract 2 responsibility 5' },
  { key: 'contract_2_content_intro', text_khmer: 'កិច្ចព្រមព្រៀងនេះកំណត់ភារកិច្ចរបស់អ្នកគ្រប់គ្រងគម្រោងក្នុងការអនុវត្តកម្មវិធី។', text_english: 'This agreement defines project manager duties.', category: 'contract_templates', description: 'Contract 2 intro' },
  { key: 'contract_2_indicators_title', text_khmer: 'សូចនាករសមិទ្ធកម្ម:', text_english: 'Achievement Indicators:', category: 'contract_templates', description: 'Contract 2 indicators title' },
  { key: 'contract_2_indicator_plan', text_khmer: 'ការអនុវត្តផែនការ: ≥95%', text_english: 'Plan implementation: ≥95%', category: 'contract_templates', description: 'Contract 2 plan indicator' },
  { key: 'contract_2_indicator_budget', text_khmer: 'ការប្រើប្រាស់ថវិកា: ≥90%', text_english: 'Budget utilization: ≥90%', category: 'contract_templates', description: 'Contract 2 budget indicator' },
  { key: 'contract_2_indicator_reporting', text_khmer: 'របាយការណ៍ទាន់ពេល: 100%', text_english: 'Timely reporting: 100%', category: 'contract_templates', description: 'Contract 2 reporting indicator' },

  // Contract Type 3: Project Manager-Regional
  { key: 'contract_3_title', text_khmer: 'កិច្ចព្រមព្រៀងរវាងអ្នកគ្រប់គ្រងគម្រោង និងតំបន់', text_english: 'Agreement between Project Manager and Regional Coordinator', category: 'contract_templates', description: 'Contract 3 title' },
  { key: 'contract_3_party_b', text_khmer: 'អ្នកសម្របសម្រួលតំបន់', text_english: 'Regional Coordinator', category: 'contract_templates', description: 'Contract 3 Party B' },
  { key: 'contract_3_responsibility_1', text_khmer: 'សម្របសម្រួលការអនុវត្តកម្មវិធីនៅតំបន់', text_english: 'Coordinate program implementation in region', category: 'contract_templates', description: 'Contract 3 responsibility 1' },
  { key: 'contract_3_responsibility_2', text_khmer: 'គាំទ្របច្ចេកទេសដល់សាលារៀន', text_english: 'Provide technical support to schools', category: 'contract_templates', description: 'Contract 3 responsibility 2' },
  { key: 'contract_3_responsibility_3', text_khmer: 'តាមដានវឌ្ឍនភាពប្រចាំសប្តាហ៍', text_english: 'Weekly progress monitoring', category: 'contract_templates', description: 'Contract 3 responsibility 3' },
  { key: 'contract_3_responsibility_4', text_khmer: 'រៀបចំកិច្ចប្រជុំសម្របសម្រួល', text_english: 'Organize coordination meetings', category: 'contract_templates', description: 'Contract 3 responsibility 4' },
  { key: 'contract_3_responsibility_5', text_khmer: 'ធ្វើរបាយការណ៍ប្រចាំខែ', text_english: 'Monthly reporting', category: 'contract_templates', description: 'Contract 3 responsibility 5' },
  { key: 'contract_3_content_intro', text_khmer: 'កិច្ចព្រមព្រៀងសម្របសម្រួលតំបន់សម្រាប់ការអនុវត្តកម្មវិធីអប់រំ។', text_english: 'Regional coordination agreement for education program.', category: 'contract_templates', description: 'Contract 3 intro' },
  { key: 'contract_3_coverage_title', text_khmer: 'តំបន់គ្របដណ្តប់:', text_english: 'Coverage Area:', category: 'contract_templates', description: 'Contract 3 coverage title' },
  { key: 'contract_3_coverage_provinces', text_khmer: 'ចំនួនខេត្ត: តាមការកំណត់', text_english: 'Number of provinces: As designated', category: 'contract_templates', description: 'Contract 3 provinces' },
  { key: 'contract_3_coverage_schools', text_khmer: 'ចំនួនសាលា: តាមបញ្ជី', text_english: 'Number of schools: As listed', category: 'contract_templates', description: 'Contract 3 schools' },
  { key: 'contract_3_coverage_students', text_khmer: 'គោលដៅសិស្ស: តាមផែនការ', text_english: 'Student target: As planned', category: 'contract_templates', description: 'Contract 3 students' },

  // Contract Type 4: Provincial-District
  { key: 'contract_4_title', text_khmer: 'កិច្ចព្រមព្រៀងរវាង នាយកដ្ឋានបឋមសិក្សា និងការិយាល័យអប់រំស្រុក', text_english: 'Agreement between Provincial and District Education Office', category: 'contract_templates', description: 'Contract 4 title' },
  { key: 'contract_4_party_b', text_khmer: 'ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក', text_english: 'District Office of Education, Youth and Sports', category: 'contract_templates', description: 'Contract 4 Party B' },
  { key: 'contract_4_responsibility_1', text_khmer: 'អនុវត្តគោលនយោបាយអប់រំថ្នាក់ជាតិ', text_english: 'Implement national education policy', category: 'contract_templates', description: 'Contract 4 responsibility 1' },
  { key: 'contract_4_responsibility_2', text_khmer: 'គ្រប់គ្រងគ្រូបង្រៀន និងសាលារៀន', text_english: 'Manage teachers and schools', category: 'contract_templates', description: 'Contract 4 responsibility 2' },
  { key: 'contract_4_responsibility_3', text_khmer: 'ចែកចាយសម្ភារៈសិក្សា', text_english: 'Distribute learning materials', category: 'contract_templates', description: 'Contract 4 responsibility 3' },
  { key: 'contract_4_responsibility_4', text_khmer: 'ធ្វើអធិការកិច្ចសាលារៀន', text_english: 'Conduct school inspections', category: 'contract_templates', description: 'Contract 4 responsibility 4' },
  { key: 'contract_4_responsibility_5', text_khmer: 'រាយការណ៍លទ្ធផលសិក្សា', text_english: 'Report learning outcomes', category: 'contract_templates', description: 'Contract 4 responsibility 5' },
  { key: 'contract_4_content_intro', text_khmer: 'កិច្ចព្រមព្រៀងគ្រប់គ្រងការអប់រំថ្នាក់ស្រុក។', text_english: 'District education management agreement.', category: 'contract_templates', description: 'Contract 4 intro' },
  { key: 'contract_4_goals_title', text_khmer: 'គោលដៅសំខាន់:', text_english: 'Key Goals:', category: 'contract_templates', description: 'Contract 4 goals title' },
  { key: 'contract_4_goal_schools', text_khmer: 'សាលារៀនទទួលសម្ភារៈ: 150 សាលា', text_english: 'Schools receiving materials: 150 schools', category: 'contract_templates', description: 'Contract 4 schools goal' },
  { key: 'contract_4_goal_teachers', text_khmer: 'គ្រូទទួលបណ្តុះបណ្តាល: 500 នាក់', text_english: 'Teachers trained: 500 people', category: 'contract_templates', description: 'Contract 4 teachers goal' },
  { key: 'contract_4_goal_pass_rate', text_khmer: 'អត្រាប្រឡងជាប់: ≥85%', text_english: 'Pass rate: ≥85%', category: 'contract_templates', description: 'Contract 4 pass rate' },

  // Contract Type 5: Provincial-School
  { key: 'contract_5_title', text_khmer: 'កិច្ចព្រមព្រៀងរវាង នាយកដ្ឋានបឋមសិក្សា និងសាលារៀន', text_english: 'Agreement between Provincial Education and School', category: 'contract_templates', description: 'Contract 5 title' },
  { key: 'contract_5_party_b', text_khmer: 'សាលាបឋមសិក្សា', text_english: 'Primary School', category: 'contract_templates', description: 'Contract 5 Party B' },
  { key: 'contract_5_responsibility_1', text_khmer: 'ធានាគុណភាពអប់រំ', text_english: 'Ensure education quality', category: 'contract_templates', description: 'Contract 5 responsibility 1' },
  { key: 'contract_5_responsibility_2', text_khmer: 'គ្រប់គ្រងធនធានមនុស្ស', text_english: 'Manage human resources', category: 'contract_templates', description: 'Contract 5 responsibility 2' },
  { key: 'contract_5_responsibility_3', text_khmer: 'ថែរក្សាហេដ្ឋារចនាសម្ព័ន្ធ', text_english: 'Maintain infrastructure', category: 'contract_templates', description: 'Contract 5 responsibility 3' },
  { key: 'contract_5_responsibility_4', text_khmer: 'អនុវត្តកម្មវិធីសិក្សា', text_english: 'Implement curriculum', category: 'contract_templates', description: 'Contract 5 responsibility 4' },
  { key: 'contract_5_responsibility_5', text_khmer: 'វាយតម្លៃលទ្ធផលសិស្ស', text_english: 'Evaluate student outcomes', category: 'contract_templates', description: 'Contract 5 responsibility 5' },
  { key: 'contract_5_content_intro', text_khmer: 'កិច្ចព្រមព្រៀងគ្រប់គ្រងសាលារៀន។', text_english: 'School management agreement.', category: 'contract_templates', description: 'Contract 5 intro' },
  { key: 'contract_5_criteria_title', text_khmer: 'លក្ខណៈវិនិច្ឆ័យ:', text_english: 'Criteria:', category: 'contract_templates', description: 'Contract 5 criteria title' },
  { key: 'contract_5_criterion_attendance', text_khmer: 'អត្រាចូលរៀនទៀងទាត់: ≥95%', text_english: 'Regular attendance: ≥95%', category: 'contract_templates', description: 'Contract 5 attendance' },
  { key: 'contract_5_criterion_performance', text_khmer: 'លទ្ធផលសិក្សា: ≥4.0/5.0', text_english: 'Learning outcomes: ≥4.0/5.0', category: 'contract_templates', description: 'Contract 5 performance' },
  { key: 'contract_5_criterion_infrastructure', text_khmer: 'ហេដ្ឋារចនាសម្ព័ន្ធ: 100%', text_english: 'Infrastructure: 100%', category: 'contract_templates', description: 'Contract 5 infrastructure' }
]

async function main() {
  console.log('🌱 Seeding contract template content...')

  let created = 0
  let updated = 0

  for (const content of contractTemplateContent) {
    const result = await prisma.content_texts.upsert({
      where: { key: content.key },
      update: content,
      create: content
    })

    // Check if newly created by comparing timestamps
    const isNew = result.created_at.getTime() === result.updated_at.getTime()
    if (isNew) {
      created++
    } else {
      updated++
    }
  }

  console.log(`✅ Created ${created} new contract template texts`)
  console.log(`✅ Updated ${updated} existing texts`)
  console.log(`✅ Total: ${contractTemplateContent.length} contract template texts`)

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
