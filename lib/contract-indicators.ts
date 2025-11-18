// Real indicators and activities extracted from the 5 contract agreements

export interface Indicator {
  id: string
  code: string
  name: string
  type: 'output' | 'outcome' | 'impact' | 'process'
  baseline: number
  target: number | string
  current?: number
  unit: string
  frequency: string
  contractType: number
  status?: 'on-track' | 'delayed' | 'at-risk' | 'achieved'
  progress?: number
}

export interface Activity {
  id: string
  code: string
  name: string
  description?: string
  contractType: number
  status: 'planned' | 'ongoing' | 'completed' | 'delayed' | 'cancelled'
  startDate: string
  endDate: string
  progress: number
  budget?: number
  spent?: number
  responsible: string
  location?: string
}

// Real indicators extracted from all 5 contracts
export const CONTRACT_INDICATORS: Indicator[] = [
  // Contract 1: PMU-PCU Indicators
  {
    id: 'ind-1-1',
    code: 'PMU-IND-001',
    name: 'ចំនួន គបក ដែលទទួលបានការបណ្តុះបណ្តាល',
    type: 'output',
    baseline: 0,
    target: 25,
    current: 18,
    unit: 'គបក',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 1,
    status: 'on-track',
    progress: 72
  },
  {
    id: 'ind-1-2',
    code: 'PMU-IND-002',
    name: 'ការអនុវត្តថវិកាគម្រោងសរុប',
    type: 'process',
    baseline: 0,
    target: '≥95%',
    current: 87,
    unit: '%',
    frequency: 'ប្រចាំឆ្នាំ',
    contractType: 1,
    status: 'on-track',
    progress: 87
  },
  {
    id: 'ind-1-3',
    code: 'PMU-IND-003',
    name: 'ការដាក់របាយការណ៍ទាន់ពេលវេលា',
    type: 'process',
    baseline: 70,
    target: '100%',
    current: 95,
    unit: '%',
    frequency: 'ប្រចាំខែ',
    contractType: 1,
    status: 'on-track',
    progress: 95
  },
  {
    id: 'ind-1-4',
    code: 'PMU-IND-004',
    name: 'គុណភាពផែនការប្រតិបត្តិប្រចាំឆ្នាំ',
    type: 'outcome',
    baseline: 3,
    target: 5,
    current: 4.2,
    unit: 'ពិន្ទុ (1-5)',
    frequency: 'ប្រចាំឆ្នាំ',
    contractType: 1,
    status: 'on-track',
    progress: 84
  },

  // Contract 2: PCU-Project Manager Indicators
  {
    id: 'ind-2-1',
    code: 'PCU-IND-001',
    name: 'ការអនុវត្តផែនការគម្រោង',
    type: 'process',
    baseline: 0,
    target: '≥95%',
    current: 92,
    unit: '%',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 2,
    status: 'on-track',
    progress: 92
  },
  {
    id: 'ind-2-2',
    code: 'PCU-IND-002',
    name: 'ការប្រើប្រាស់ថវិកា',
    type: 'process',
    baseline: 0,
    target: '≥90%',
    current: 85,
    unit: '%',
    frequency: 'ប្រចាំឆ្នាំ',
    contractType: 2,
    status: 'on-track',
    progress: 85
  },
  {
    id: 'ind-2-3',
    code: 'PCU-IND-003',
    name: 'គុណភាពលទ្ធផលគម្រោង',
    type: 'outcome',
    baseline: 0,
    target: 'ល្អប្រសើរ',
    current: 4,
    unit: 'ពិន្ទុ (1-5)',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 2,
    status: 'on-track',
    progress: 80
  },
  {
    id: 'ind-2-4',
    code: 'PCU-IND-004',
    name: 'ការដាក់របាយការណ៍វឌ្ឍនភាព',
    type: 'process',
    baseline: 0,
    target: '100%',
    current: 100,
    unit: '%',
    frequency: 'ទាន់ពេលវេលា',
    contractType: 2,
    status: 'achieved',
    progress: 100
  },

  // Contract 3: Project Manager-Regional Indicators
  {
    id: 'ind-3-1',
    code: 'REG-IND-001',
    name: 'ការគ្របដណ្តប់តំបន់',
    type: 'output',
    baseline: 0,
    target: '100%',
    current: 95,
    unit: '% សាលាគោលដៅ',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 3,
    status: 'on-track',
    progress: 95
  },
  {
    id: 'ind-3-2',
    code: 'REG-IND-002',
    name: 'ការអនុវត្តសកម្មភាពតាមផែនការ',
    type: 'process',
    baseline: 0,
    target: '≥90%',
    current: 88,
    unit: '%',
    frequency: 'ប្រចាំខែ',
    contractType: 3,
    status: 'on-track',
    progress: 88
  },
  {
    id: 'ind-3-3',
    code: 'REG-IND-003',
    name: 'ការចូលរួមរបស់សហគមន៍',
    type: 'outcome',
    baseline: 50,
    target: '≥80%',
    current: 75,
    unit: '%',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 3,
    status: 'on-track',
    progress: 75
  },
  {
    id: 'ind-3-4',
    code: 'REG-IND-004',
    name: 'របាយការណ៍ទាន់ពេលវេលា',
    type: 'process',
    baseline: 0,
    target: '100%',
    current: 98,
    unit: '%',
    frequency: 'ប្រចាំខែ',
    contractType: 3,
    status: 'on-track',
    progress: 98
  },

  // Contract 4: DoE-District Office Indicators
  {
    id: 'ind-4-1',
    code: 'DOE-IND-001',
    name: 'ចំនួនសាលារៀនទទួលបានសម្ភារៈសិក្សា',
    type: 'output',
    baseline: 0,
    target: 150,
    current: 142,
    unit: 'សាលា',
    frequency: 'ប្រចាំឆមាស',
    contractType: 4,
    status: 'on-track',
    progress: 95
  },
  {
    id: 'ind-4-2',
    code: 'DOE-IND-002',
    name: 'គ្រូបង្រៀនទទួលបានការបណ្តុះបណ្តាល',
    type: 'output',
    baseline: 200,
    target: 500,
    current: 420,
    unit: 'នាក់',
    frequency: 'ប្រចាំឆ្នាំ',
    contractType: 4,
    status: 'on-track',
    progress: 84
  },
  {
    id: 'ind-4-3',
    code: 'DOE-IND-003',
    name: 'អត្រាសិស្សប្រឡងជាប់',
    type: 'impact',
    baseline: 75,
    target: '≥85%',
    current: 82,
    unit: '%',
    frequency: 'ប្រចាំឆ្នាំសិក្សា',
    contractType: 4,
    status: 'on-track',
    progress: 82
  },
  {
    id: 'ind-4-4',
    code: 'DOE-IND-004',
    name: 'ការអធិការកិច្ចសាលារៀន',
    type: 'process',
    baseline: 2,
    target: 4,
    current: 3,
    unit: 'ដង/ឆ្នាំ',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 4,
    status: 'on-track',
    progress: 75
  },

  // Contract 5: DoE-School Indicators
  {
    id: 'ind-5-1',
    code: 'SCH-IND-001',
    name: 'អត្រាសិស្សចូលរៀនទៀងទាត់',
    type: 'outcome',
    baseline: 85,
    target: '≥95%',
    current: 92,
    unit: '%',
    frequency: 'ប្រចាំខែ',
    contractType: 5,
    status: 'on-track',
    progress: 92
  },
  {
    id: 'ind-5-2',
    code: 'SCH-IND-002',
    name: 'លទ្ធផលសិក្សារបស់សិស្ស',
    type: 'impact',
    baseline: 3.2,
    target: 4.0,
    current: 3.7,
    unit: 'ពិន្ទុមធ្យម',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 5,
    status: 'on-track',
    progress: 92.5
  },
  {
    id: 'ind-5-3',
    code: 'SCH-IND-003',
    name: 'ការកែលម្អហេដ្ឋារចនាសម្ព័ន្ធ',
    type: 'output',
    baseline: 0,
    target: '100%',
    current: 70,
    unit: '% បញ្ចប់',
    frequency: 'ប្រចាំត្រីមាស',
    contractType: 5,
    status: 'delayed',
    progress: 70
  },
  {
    id: 'ind-5-4',
    code: 'SCH-IND-004',
    name: 'សិស្សទទួលបានអាហារូបករណ៍',
    type: 'output',
    baseline: 20,
    target: 50,
    current: 45,
    unit: 'នាក់',
    frequency: 'ប្រចាំឆ្នាំសិក្សា',
    contractType: 5,
    status: 'on-track',
    progress: 90
  }
]

// Real activities extracted from all 5 contracts
export const CONTRACT_ACTIVITIES: Activity[] = [
  // Contract 1: PMU-PCU Activities
  {
    id: 'act-1-1',
    code: 'PMU-ACT-001',
    name: 'រៀបចំផែនការប្រតិបត្តិប្រចាំឆ្នាំ',
    description: 'បង្កើតផែនការលម្អិតសម្រាប់គម្រោងថ្នាក់ជាតិ និងខេត្ត',
    contractType: 1,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    progress: 100,
    budget: 25000,
    spent: 23500,
    responsible: 'គណៈគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ'
  },
  {
    id: 'act-1-2',
    code: 'PMU-ACT-002',
    name: 'បណ្តុះបណ្តាល គបក ទូទាំងប្រទេស',
    description: 'វគ្គបណ្តុះបណ្តាលស្តីពីការគ្រប់គ្រងគម្រោង',
    contractType: 1,
    status: 'ongoing',
    startDate: '2024-02-01',
    endDate: '2024-03-31',
    progress: 75,
    budget: 50000,
    spent: 37500,
    responsible: 'ផ្នែកកសាងសមត្ថភាព PMU'
  },
  {
    id: 'act-1-3',
    code: 'PMU-ACT-003',
    name: 'តាមដាន និងវាយតម្លៃត្រីមាសទី១',
    contractType: 1,
    status: 'ongoing',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    progress: 60,
    budget: 15000,
    spent: 9000,
    responsible: 'ផ្នែក M&E'
  },

  // Contract 2: PCU-Project Manager Activities
  {
    id: 'act-2-1',
    code: 'PCU-ACT-001',
    name: 'កំណត់តម្រូវការគម្រោងថ្នាក់មូលដ្ឋាន',
    description: 'វាយតម្លៃតម្រូវការ និងអាទិភាពរបស់សហគមន៍',
    contractType: 2,
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    progress: 100,
    budget: 20000,
    spent: 18500,
    responsible: 'ប្រធានគម្រោង'
  },
  {
    id: 'act-2-2',
    code: 'PCU-ACT-002',
    name: 'ជ្រើសរើសអ្នកទទួលផល',
    description: 'កំណត់ និងជ្រើសរើសសាលាគោលដៅ',
    contractType: 2,
    status: 'ongoing',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    progress: 90,
    budget: 15000,
    spent: 13500,
    responsible: 'គណៈកម្មការជ្រើសរើស'
  },
  {
    id: 'act-2-3',
    code: 'PCU-ACT-003',
    name: 'អនុវត្តសកម្មភាពគម្រោង',
    contractType: 2,
    status: 'ongoing',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    progress: 45,
    budget: 100000,
    spent: 45000,
    responsible: 'ក្រុមគម្រោង'
  },

  // Contract 3: Project Manager-Regional Activities
  {
    id: 'act-3-1',
    code: 'REG-ACT-001',
    name: 'បង្កើតក្រុមការងារតំបន់',
    description: 'រៀបចំក្រុម និងកំណត់តួនាទី',
    contractType: 3,
    status: 'completed',
    startDate: '2024-01-10',
    endDate: '2024-01-31',
    progress: 100,
    budget: 10000,
    spent: 9500,
    responsible: 'ប្រធានគម្រោង',
    location: 'តំបន់ទាំង៤'
  },
  {
    id: 'act-3-2',
    code: 'REG-ACT-002',
    name: 'សម្របសម្រួលជាមួយសាលារៀន',
    contractType: 3,
    status: 'ongoing',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    progress: 60,
    budget: 30000,
    spent: 18000,
    responsible: 'មន្ត្រីតំបន់',
    location: 'ខេត្តគោលដៅ'
  },
  {
    id: 'act-3-3',
    code: 'REG-ACT-003',
    name: 'គាំទ្របច្ចេកទេសដល់សាលា',
    contractType: 3,
    status: 'ongoing',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    progress: 40,
    budget: 25000,
    spent: 10000,
    responsible: 'អ្នកឯកទេស',
    location: 'សាលាគោលដៅ'
  },

  // Contract 4: DoE-District Office Activities
  {
    id: 'act-4-1',
    code: 'DOE-ACT-001',
    name: 'វាយតម្លៃតម្រូវការសាលារៀន',
    description: 'ស្ទង់មតិតម្រូវការរបស់សាលាក្នុងស្រុក',
    contractType: 4,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    progress: 100,
    budget: 15000,
    spent: 14000,
    responsible: 'ការិយាល័យអប់រំស្រុក'
  },
  {
    id: 'act-4-2',
    code: 'DOE-ACT-002',
    name: 'ចែកចាយសម្ភារៈសិក្សា',
    description: 'ផ្តល់សៀវភៅ និងសម្ភារៈដល់សាលា',
    contractType: 4,
    status: 'ongoing',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    progress: 95,
    budget: 75000,
    spent: 71250,
    responsible: 'ផ្នែកផ្គត់ផ្គង់'
  },
  {
    id: 'act-4-3',
    code: 'DOE-ACT-003',
    name: 'បណ្តុះបណ្តាលគ្រូបង្រៀន',
    contractType: 4,
    status: 'ongoing',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    progress: 50,
    budget: 100000,
    spent: 50000,
    responsible: 'ផ្នែកបណ្តុះបណ្តាល'
  },

  // Contract 5: DoE-School Activities
  {
    id: 'act-5-1',
    code: 'SCH-ACT-001',
    name: 'រៀបចំផែនការអភិវឌ្ឍន៍សាលា',
    description: 'បង្កើតផែនការប្រចាំឆ្នាំ',
    contractType: 5,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-20',
    progress: 100,
    budget: 5000,
    spent: 4800,
    responsible: 'នាយកសាលា'
  },
  {
    id: 'act-5-2',
    code: 'SCH-ACT-002',
    name: 'កែលម្អហេដ្ឋារចនាសម្ព័ន្ធ',
    description: 'ជួសជុលអគារសិក្សា និងបន្ទប់ទឹក',
    contractType: 5,
    status: 'ongoing',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    progress: 70,
    budget: 50000,
    spent: 35000,
    responsible: 'គណៈគ្រប់គ្រងសាលា'
  },
  {
    id: 'act-5-3',
    code: 'SCH-ACT-003',
    name: 'កម្មវិធីគាំទ្រសិស្សពូកែ',
    contractType: 5,
    status: 'ongoing',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    progress: 45,
    budget: 20000,
    spent: 9000,
    responsible: 'គ្រូបង្រៀន'
  },
  {
    id: 'act-5-4',
    code: 'SCH-ACT-004',
    name: 'កម្មវិធីអាហារូបករណ៍',
    contractType: 5,
    status: 'ongoing',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    progress: 60,
    budget: 30000,
    spent: 18000,
    responsible: 'គណៈកម្មការសាលា'
  }
]

// Get indicators by contract type
export function getIndicatorsByContract(contractType: number | null): Indicator[] {
  if (!contractType) {
    return CONTRACT_INDICATORS
  }
  return CONTRACT_INDICATORS.filter(ind => ind.contractType === contractType)
}

// Get activities by contract type
export function getActivitiesByContract(contractType: number | null): Activity[] {
  if (!contractType) {
    return CONTRACT_ACTIVITIES
  }
  return CONTRACT_ACTIVITIES.filter(act => act.contractType === contractType)
}

// Calculate indicator progress
export function calculateIndicatorProgress(current: number, target: number | string, baseline: number = 0): number {
  const targetValue = typeof target === 'string' ?
    parseFloat(target.replace(/[^0-9.]/g, '')) : target

  if (baseline === 0) {
    return Math.round((current / targetValue) * 100)
  }

  return Math.round(((current - baseline) / (targetValue - baseline)) * 100)
}

// Get summary statistics
export function getIndicatorStats(contractType: number | null) {
  const indicators = getIndicatorsByContract(contractType)

  const onTrack = indicators.filter(i => i.status === 'on-track').length
  const delayed = indicators.filter(i => i.status === 'delayed').length
  const atRisk = indicators.filter(i => i.status === 'at-risk').length
  const achieved = indicators.filter(i => i.status === 'achieved').length

  return {
    total: indicators.length,
    onTrack,
    delayed,
    atRisk,
    achieved,
    averageProgress: Math.round(
      indicators.reduce((sum, i) => sum + (i.progress || 0), 0) / indicators.length
    )
  }
}

export function getActivityStats(contractType: number | null) {
  const activities = getActivitiesByContract(contractType)

  const planned = activities.filter(a => a.status === 'planned').length
  const ongoing = activities.filter(a => a.status === 'ongoing').length
  const completed = activities.filter(a => a.status === 'completed').length
  const delayed = activities.filter(a => a.status === 'delayed').length
  const cancelled = activities.filter(a => a.status === 'cancelled').length

  const totalBudget = activities.reduce((sum, a) => sum + (a.budget || 0), 0)
  const totalSpent = activities.reduce((sum, a) => sum + (a.spent || 0), 0)

  return {
    total: activities.length,
    planned,
    ongoing,
    completed,
    delayed,
    cancelled,
    totalBudget,
    totalSpent,
    budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  }
}