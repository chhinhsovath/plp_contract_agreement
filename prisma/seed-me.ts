import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedMEData() {
  console.log('🌱 Seeding M&E data...')

  // Clear existing data
  await prisma.me_training_attendance.deleteMany()
  await prisma.me_data_collection.deleteMany()
  await prisma.me_beneficiaries.deleteMany()
  await prisma.me_milestones.deleteMany()
  await prisma.me_activities.deleteMany()
  await prisma.me_indicators.deleteMany()

  // Seed Indicators
  const indicators = [
    // Contract 1: PMU-PCU Indicators
    {
      indicator_code: 'PMU-IND-001',
      indicator_name_khmer: 'ចំនួន គបក ដែលទទួលបានការបណ្តុះបណ្តាល',
      indicator_name_english: 'Number of PCUs trained',
      indicator_type: 'output',
      measurement_unit: 'គបក',
      baseline_value: 0,
      target_value: 25,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 1,
      description: 'តាមដានចំនួន គបក ដែលបានទទួលការបណ្តុះបណ្តាល'
    },
    {
      indicator_code: 'PMU-IND-002',
      indicator_name_khmer: 'ការអនុវត្តថវិកាគម្រោងសរុប',
      indicator_name_english: 'Total project budget implementation',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 95,
      frequency: 'ប្រចាំឆ្នាំ',
      contract_type: 1,
      description: 'ភាគរយនៃការអនុវត្តថវិកាគម្រោង'
    },
    {
      indicator_code: 'PMU-IND-003',
      indicator_name_khmer: 'ការដាក់របាយការណ៍ទាន់ពេលវេលា',
      indicator_name_english: 'Timely report submission',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 70,
      target_value: 100,
      frequency: 'ប្រចាំខែ',
      contract_type: 1
    },
    {
      indicator_code: 'PMU-IND-004',
      indicator_name_khmer: 'គុណភាពផែនការប្រតិបត្តិប្រចាំឆ្នាំ',
      indicator_name_english: 'Annual operational plan quality',
      indicator_type: 'outcome',
      measurement_unit: 'score',
      baseline_value: 3,
      target_value: 5,
      frequency: 'ប្រចាំឆ្នាំ',
      contract_type: 1
    },

    // Contract 2: PCU-Project Manager Indicators
    {
      indicator_code: 'PCU-IND-001',
      indicator_name_khmer: 'ការអនុវត្តផែនការគម្រោង',
      indicator_name_english: 'Project plan implementation',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 95,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 2
    },
    {
      indicator_code: 'PCU-IND-002',
      indicator_name_khmer: 'ការប្រើប្រាស់ថវិកា',
      indicator_name_english: 'Budget utilization',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 90,
      frequency: 'ប្រចាំឆ្នាំ',
      contract_type: 2
    },
    {
      indicator_code: 'PCU-IND-003',
      indicator_name_khmer: 'គុណភាពលទ្ធផលគម្រោង',
      indicator_name_english: 'Project outcome quality',
      indicator_type: 'outcome',
      measurement_unit: 'score',
      baseline_value: 0,
      target_value: 5,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 2
    },
    {
      indicator_code: 'PCU-IND-004',
      indicator_name_khmer: 'ការដាក់របាយការណ៍វឌ្ឍនភាព',
      indicator_name_english: 'Progress report submission',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 100,
      frequency: 'ទាន់ពេលវេលា',
      contract_type: 2
    },

    // Contract 3: Project Manager-Regional Indicators
    {
      indicator_code: 'REG-IND-001',
      indicator_name_khmer: 'ការគ្របដណ្តប់តំបន់',
      indicator_name_english: 'Regional coverage',
      indicator_type: 'output',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 100,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 3
    },
    {
      indicator_code: 'REG-IND-002',
      indicator_name_khmer: 'ការអនុវត្តសកម្មភាពតាមផែនការ',
      indicator_name_english: 'Activity implementation per plan',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 90,
      frequency: 'ប្រចាំខែ',
      contract_type: 3
    },
    {
      indicator_code: 'REG-IND-003',
      indicator_name_khmer: 'ការចូលរួមរបស់សហគមន៍',
      indicator_name_english: 'Community participation',
      indicator_type: 'outcome',
      measurement_unit: 'percentage',
      baseline_value: 50,
      target_value: 80,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 3
    },
    {
      indicator_code: 'REG-IND-004',
      indicator_name_khmer: 'របាយការណ៍ទាន់ពេលវេលា',
      indicator_name_english: 'Timely reporting',
      indicator_type: 'process',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 100,
      frequency: 'ប្រចាំខែ',
      contract_type: 3
    },

    // Contract 4: DoE-District Office Indicators
    {
      indicator_code: 'DOE-IND-001',
      indicator_name_khmer: 'ចំនួនសាលារៀនទទួលបានសម្ភារៈសិក្សា',
      indicator_name_english: 'Schools receiving educational materials',
      indicator_type: 'output',
      measurement_unit: 'number',
      baseline_value: 0,
      target_value: 150,
      frequency: 'ប្រចាំឆមាស',
      contract_type: 4
    },
    {
      indicator_code: 'DOE-IND-002',
      indicator_name_khmer: 'គ្រូបង្រៀនទទួលបានការបណ្តុះបណ្តាល',
      indicator_name_english: 'Teachers trained',
      indicator_type: 'output',
      measurement_unit: 'number',
      baseline_value: 200,
      target_value: 500,
      frequency: 'ប្រចាំឆ្នាំ',
      contract_type: 4
    },
    {
      indicator_code: 'DOE-IND-003',
      indicator_name_khmer: 'អត្រាសិស្សប្រឡងជាប់',
      indicator_name_english: 'Student pass rate',
      indicator_type: 'impact',
      measurement_unit: 'percentage',
      baseline_value: 75,
      target_value: 85,
      frequency: 'ប្រចាំឆ្នាំសិក្សា',
      contract_type: 4
    },
    {
      indicator_code: 'DOE-IND-004',
      indicator_name_khmer: 'ការអធិការកិច្ចសាលារៀន',
      indicator_name_english: 'School inspections',
      indicator_type: 'process',
      measurement_unit: 'number',
      baseline_value: 2,
      target_value: 4,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 4
    },

    // Contract 5: DoE-School Indicators
    {
      indicator_code: 'SCH-IND-001',
      indicator_name_khmer: 'អត្រាសិស្សចូលរៀនទៀងទាត់',
      indicator_name_english: 'Student attendance rate',
      indicator_type: 'outcome',
      measurement_unit: 'percentage',
      baseline_value: 85,
      target_value: 95,
      frequency: 'ប្រចាំខែ',
      contract_type: 5
    },
    {
      indicator_code: 'SCH-IND-002',
      indicator_name_khmer: 'លទ្ធផលសិក្សារបស់សិស្ស',
      indicator_name_english: 'Student academic performance',
      indicator_type: 'impact',
      measurement_unit: 'score',
      baseline_value: 3.2,
      target_value: 4.0,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 5
    },
    {
      indicator_code: 'SCH-IND-003',
      indicator_name_khmer: 'ការកែលម្អហេដ្ឋារចនាសម្ព័ន្ធ',
      indicator_name_english: 'Infrastructure improvement',
      indicator_type: 'output',
      measurement_unit: 'percentage',
      baseline_value: 0,
      target_value: 100,
      frequency: 'ប្រចាំត្រីមាស',
      contract_type: 5
    },
    {
      indicator_code: 'SCH-IND-004',
      indicator_name_khmer: 'សិស្សទទួលបានអាហារូបករណ៍',
      indicator_name_english: 'Students receiving scholarships',
      indicator_type: 'output',
      measurement_unit: 'number',
      baseline_value: 20,
      target_value: 50,
      frequency: 'ប្រចាំឆ្នាំសិក្សា',
      contract_type: 5
    }
  ]

  const createdIndicators = await prisma.me_indicators.createMany({
    data: indicators
  })
  console.log(`✅ Created ${createdIndicators.count} indicators`)

  // Get created indicators for foreign key references
  const indicatorsList = await prisma.me_indicators.findMany()
  const indicatorMap = new Map(indicatorsList.map(i => [i.indicator_code, i.id]))

  // Seed Activities
  const activities = [
    // Contract 1: PMU-PCU Activities
    {
      activity_code: 'PMU-ACT-001',
      activity_name_khmer: 'រៀបចំផែនការប្រតិបត្តិប្រចាំឆ្នាំ',
      activity_name_english: 'Annual operational planning',
      indicator_id: indicatorMap.get('PMU-IND-004')!,
      planned_start: new Date('2024-01-01'),
      planned_end: new Date('2024-01-31'),
      actual_start: new Date('2024-01-01'),
      actual_end: new Date('2024-01-31'),
      status: 'completed',
      budget_allocated: 25000,
      budget_spent: 23500,
      responsible_person: 'គណៈគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ',
      location: 'ភ្នំពេញ'
    },
    {
      activity_code: 'PMU-ACT-002',
      activity_name_khmer: 'បណ្តុះបណ្តាល គបក ទូទាំងប្រទេស',
      activity_name_english: 'PCU training nationwide',
      indicator_id: indicatorMap.get('PMU-IND-001')!,
      planned_start: new Date('2024-02-01'),
      planned_end: new Date('2024-03-31'),
      actual_start: new Date('2024-02-01'),
      status: 'ongoing',
      budget_allocated: 50000,
      budget_spent: 37500,
      responsible_person: 'ផ្នែកកសាងសមត្ថភាព PMU',
      location: 'ខេត្តគោលដៅ'
    },
    {
      activity_code: 'PMU-ACT-003',
      activity_name_khmer: 'តាមដាន និងវាយតម្លៃត្រីមាសទី១',
      activity_name_english: 'Q1 monitoring and evaluation',
      indicator_id: indicatorMap.get('PMU-IND-003')!,
      planned_start: new Date('2024-03-01'),
      planned_end: new Date('2024-03-31'),
      actual_start: new Date('2024-03-01'),
      status: 'ongoing',
      budget_allocated: 15000,
      budget_spent: 9000,
      responsible_person: 'ផ្នែក M&E',
      location: 'ខេត្តគោលដៅ'
    },

    // Contract 2: PCU-Project Manager Activities
    {
      activity_code: 'PCU-ACT-001',
      activity_name_khmer: 'កំណត់តម្រូវការគម្រោងថ្នាក់មូលដ្ឋាន',
      activity_name_english: 'Community needs assessment',
      indicator_id: indicatorMap.get('PCU-IND-001')!,
      planned_start: new Date('2024-01-15'),
      planned_end: new Date('2024-02-15'),
      actual_start: new Date('2024-01-15'),
      actual_end: new Date('2024-02-15'),
      status: 'completed',
      budget_allocated: 20000,
      budget_spent: 18500,
      responsible_person: 'ប្រធានគម្រោង'
    },
    {
      activity_code: 'PCU-ACT-002',
      activity_name_khmer: 'ជ្រើសរើសអ្នកទទួលផល',
      activity_name_english: 'Beneficiary selection',
      indicator_id: indicatorMap.get('PCU-IND-001')!,
      planned_start: new Date('2024-02-01'),
      planned_end: new Date('2024-02-28'),
      actual_start: new Date('2024-02-01'),
      status: 'ongoing',
      budget_allocated: 15000,
      budget_spent: 13500,
      responsible_person: 'គណៈកម្មការជ្រើសរើស'
    },

    // Contract 3: Regional Activities
    {
      activity_code: 'REG-ACT-001',
      activity_name_khmer: 'បង្កើតក្រុមការងារតំបន់',
      activity_name_english: 'Regional team formation',
      indicator_id: indicatorMap.get('REG-IND-001')!,
      planned_start: new Date('2024-01-10'),
      planned_end: new Date('2024-01-31'),
      actual_start: new Date('2024-01-10'),
      actual_end: new Date('2024-01-31'),
      status: 'completed',
      budget_allocated: 10000,
      budget_spent: 9500,
      responsible_person: 'ប្រធានគម្រោង',
      location: 'តំបន់ទាំង៤'
    },

    // Contract 4: District Activities
    {
      activity_code: 'DOE-ACT-001',
      activity_name_khmer: 'វាយតម្លៃតម្រូវការសាលារៀន',
      activity_name_english: 'School needs assessment',
      indicator_id: indicatorMap.get('DOE-IND-001')!,
      planned_start: new Date('2024-01-01'),
      planned_end: new Date('2024-01-31'),
      actual_start: new Date('2024-01-01'),
      actual_end: new Date('2024-01-31'),
      status: 'completed',
      budget_allocated: 15000,
      budget_spent: 14000,
      responsible_person: 'ការិយាល័យអប់រំស្រុក'
    },
    {
      activity_code: 'DOE-ACT-002',
      activity_name_khmer: 'ចែកចាយសម្ភារៈសិក្សា',
      activity_name_english: 'Educational material distribution',
      indicator_id: indicatorMap.get('DOE-IND-001')!,
      planned_start: new Date('2024-02-01'),
      planned_end: new Date('2024-02-28'),
      actual_start: new Date('2024-02-01'),
      status: 'ongoing',
      budget_allocated: 75000,
      budget_spent: 71250,
      responsible_person: 'ផ្នែកផ្គត់ផ្គង់'
    },

    // Contract 5: School Activities
    {
      activity_code: 'SCH-ACT-001',
      activity_name_khmer: 'រៀបចំផែនការអភិវឌ្ឍន៍សាលា',
      activity_name_english: 'School development planning',
      indicator_id: indicatorMap.get('SCH-IND-001')!,
      planned_start: new Date('2024-01-01'),
      planned_end: new Date('2024-01-20'),
      actual_start: new Date('2024-01-01'),
      actual_end: new Date('2024-01-20'),
      status: 'completed',
      budget_allocated: 5000,
      budget_spent: 4800,
      responsible_person: 'នាយកសាលា'
    },
    {
      activity_code: 'SCH-ACT-002',
      activity_name_khmer: 'កែលម្អហេដ្ឋារចនាសម្ព័ន្ធ',
      activity_name_english: 'Infrastructure improvement',
      indicator_id: indicatorMap.get('SCH-IND-003')!,
      planned_start: new Date('2024-02-01'),
      planned_end: new Date('2024-04-30'),
      actual_start: new Date('2024-02-01'),
      status: 'ongoing',
      budget_allocated: 50000,
      budget_spent: 35000,
      responsible_person: 'គណៈគ្រប់គ្រងសាលា'
    }
  ]

  const createdActivities = await prisma.me_activities.createMany({
    data: activities
  })
  console.log(`✅ Created ${createdActivities.count} activities`)

  // Add some sample data collection records
  const dataCollections = []
  for (const indicator of indicatorsList) {
    // Add current data point
    dataCollections.push({
      indicator_id: indicator.id,
      collection_date: new Date(),
      value_numeric: (indicator.baseline_value || 0) + Math.random() * (indicator.target_value - (indicator.baseline_value || 0)),
      data_source: 'system',
      collector_name: 'System Auto',
      verification_status: 'verified',
      verified_by: 'System',
      verified_date: new Date()
    })
  }

  const createdDataCollections = await prisma.me_data_collection.createMany({
    data: dataCollections
  })
  console.log(`✅ Created ${createdDataCollections.count} data collection records`)

  console.log('🎉 M&E data seeding completed!')
}

seedMEData()
  .catch((e) => {
    console.error('Error seeding M&E data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })