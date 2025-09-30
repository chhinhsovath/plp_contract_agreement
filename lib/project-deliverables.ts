// Project deliverables and timeline data for each contract type

export interface Deliverable {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  progress: number
  status: 'planned' | 'in-progress' | 'completed' | 'delayed'
  responsible: string
  dependencies?: string[]
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  name: string
  date: string
  completed: boolean
  deliverables?: string[]
}

export interface ProjectPlan {
  contractType: number
  contractName: string
  projectDuration: string
  totalBudget?: number
  deliverables: Deliverable[]
}

// Comprehensive project plans for each contract type
export const PROJECT_PLANS: ProjectPlan[] = [
  {
    contractType: 1,
    contractName: 'កិច្ចព្រមព្រៀង PMU-PCU',
    projectDuration: '១២ ខែ',
    totalBudget: 500000,
    deliverables: [
      {
        id: 'pmu-1',
        name: 'ការរៀបចំផែនការប្រតិបត្តិប្រចាំឆ្នាំ',
        description: 'បង្កើតផែនការប្រតិបត្តិលម្អិតសម្រាប់គម្រោងថ្នាក់ជាតិ និងខេត្ត',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        progress: 100,
        status: 'completed',
        responsible: 'គណៈគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ',
        milestones: [
          {
            id: 'pmu-m1',
            name: 'ប្រជុំពិគ្រោះយោបល់ជាមួយភាគីពាក់ព័ន្ធ',
            date: '2024-01-10',
            completed: true
          },
          {
            id: 'pmu-m2',
            name: 'អនុម័តផែនការប្រតិបត្តិ',
            date: '2024-01-25',
            completed: true
          }
        ]
      },
      {
        id: 'pmu-2',
        name: 'ការបណ្តុះបណ្តាលគណៈគ្រប់គ្រងគម្រោងខេត្ត',
        description: 'វគ្គបណ្តុះបណ្តាលស្តីពីការគ្រប់គ្រងគម្រោង និងរបាយការណ៍',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        progress: 100,
        status: 'completed',
        responsible: 'ផ្នែកកសាងសមត្ថភាព PMU',
        milestones: [
          {
            id: 'pmu-m3',
            name: 'រៀបចំឯកសារបណ្តុះបណ្តាល',
            date: '2024-02-05',
            completed: true
          },
          {
            id: 'pmu-m4',
            name: 'អនុវត្តវគ្គបណ្តុះបណ្តាល',
            date: '2024-02-15',
            completed: true
          }
        ]
      },
      {
        id: 'pmu-3',
        name: 'ការតាមដាន និងវាយតម្លៃត្រីមាសទី១',
        description: 'ចុះតាមដាន និងវាយតម្លៃវឌ្ឍនភាពគម្រោងនៅខេត្តគោលដៅ',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        progress: 85,
        status: 'in-progress',
        responsible: 'ផ្នែក M&E',
        milestones: [
          {
            id: 'pmu-m5',
            name: 'ប្រមូលទិន្នន័យពីខេត្ត',
            date: '2024-03-15',
            completed: true
          },
          {
            id: 'pmu-m6',
            name: 'វិភាគ និងរៀបចំរបាយការណ៍',
            date: '2024-03-25',
            completed: false
          }
        ]
      },
      {
        id: 'pmu-4',
        name: 'ការផ្តល់ថវិកាដំណាក់កាលទី២',
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        progress: 0,
        status: 'planned',
        responsible: 'ផ្នែកហិរញ្ញវត្ថុ',
        dependencies: ['pmu-3']
      },
      {
        id: 'pmu-5',
        name: 'សិក្ខាសាលាពាក់កណ្តាលឆ្នាំ',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        progress: 0,
        status: 'planned',
        responsible: 'PMU និង PCU'
      },
      {
        id: 'pmu-6',
        name: 'របាយការណ៍វឌ្ឍនភាពប្រចាំឆមាស',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
        progress: 0,
        status: 'planned',
        responsible: 'ផ្នែក M&E'
      }
    ]
  },
  {
    contractType: 2,
    contractName: 'កិច្ចព្រមព្រៀង PCU-Project Manager',
    projectDuration: '១២ ខែ',
    totalBudget: 300000,
    deliverables: [
      {
        id: 'pcu-1',
        name: 'ការកំណត់តម្រូវការគម្រោងថ្នាក់មូលដ្ឋាន',
        description: 'វាយតម្លៃតម្រូវការ និងអាទិភាពរបស់សហគមន៍',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        progress: 100,
        status: 'completed',
        responsible: 'ប្រធានគម្រោង'
      },
      {
        id: 'pcu-2',
        name: 'ការជ្រើសរើសអ្នកទទួលផល',
        description: 'កំណត់ និងជ្រើសរើសសាលាគោលដៅ និងគ្រូបង្រៀន',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        progress: 90,
        status: 'in-progress',
        responsible: 'គណៈកម្មការជ្រើសរើស'
      },
      {
        id: 'pcu-3',
        name: 'ការអនុវត្តសកម្មភាពគម្រោង',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        progress: 45,
        status: 'in-progress',
        responsible: 'ក្រុមគម្រោង',
        milestones: [
          {
            id: 'pcu-m1',
            name: 'ចាប់ផ្តើមសកម្មភាពនៅសាលាគោលដៅ',
            date: '2024-03-15',
            completed: true
          },
          {
            id: 'pcu-m2',
            name: 'វាយតម្លៃពាក់កណ្តាលរយៈពេល',
            date: '2024-06-30',
            completed: false
          }
        ]
      },
      {
        id: 'pcu-4',
        name: 'ការតាមដានប្រចាំខែ',
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        progress: 25,
        status: 'in-progress',
        responsible: 'មន្ត្រី M&E'
      },
      {
        id: 'pcu-5',
        name: 'របាយការណ៍ត្រីមាស',
        startDate: '2024-03-31',
        endDate: '2024-12-31',
        progress: 25,
        status: 'in-progress',
        responsible: 'ប្រធានគម្រោង'
      }
    ]
  },
  {
    contractType: 3,
    contractName: 'កិច្ចព្រមព្រៀង Project Manager-Regional',
    projectDuration: '១២ ខែ',
    totalBudget: 200000,
    deliverables: [
      {
        id: 'pmr-1',
        name: 'ការរៀបចំក្រុមការងារតំបន់',
        description: 'បង្កើតក្រុមការងារ និងកំណត់តួនាទីទទួលខុសត្រូវ',
        startDate: '2024-01-10',
        endDate: '2024-01-31',
        progress: 100,
        status: 'completed',
        responsible: 'ប្រធានគម្រោង'
      },
      {
        id: 'pmr-2',
        name: 'ការសម្របសម្រួលជាមួយសាលារៀន',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        progress: 60,
        status: 'in-progress',
        responsible: 'មន្ត្រីតំបន់',
        milestones: [
          {
            id: 'pmr-m1',
            name: 'កិច្ចប្រជុំជាមួយនាយកសាលា',
            date: '2024-02-15',
            completed: true
          },
          {
            id: 'pmr-m2',
            name: 'ចុះអនុស្សរណៈយោគយល់',
            date: '2024-03-01',
            completed: true
          }
        ]
      },
      {
        id: 'pmr-3',
        name: 'ការគាំទ្របច្ចេកទេសដល់សាលា',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        progress: 40,
        status: 'in-progress',
        responsible: 'អ្នកឯកទេស'
      },
      {
        id: 'pmr-4',
        name: 'ការតាមដានវឌ្ឍនភាពសាលា',
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        progress: 35,
        status: 'in-progress',
        responsible: 'មន្ត្រីតាមដាន'
      },
      {
        id: 'pmr-5',
        name: 'របាយការណ៍វឌ្ឍនភាពតំបន់',
        startDate: '2024-03-31',
        endDate: '2024-12-31',
        progress: 25,
        status: 'in-progress',
        responsible: 'មន្ត្រីតំបន់'
      }
    ]
  },
  {
    contractType: 4,
    contractName: 'កិច្ចព្រមព្រៀង DoE-District Office',
    projectDuration: '១ ឆ្នាំសិក្សា',
    totalBudget: 150000,
    deliverables: [
      {
        id: 'doe-1',
        name: 'ការវាយតម្លៃតម្រូវការសាលារៀន',
        description: 'ស្ទង់មតិ និងវាយតម្លៃតម្រូវការរបស់សាលាក្នុងស្រុក',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        progress: 100,
        status: 'completed',
        responsible: 'ការិយាល័យអប់រំស្រុក'
      },
      {
        id: 'doe-2',
        name: 'ការផ្តល់សម្ភារៈសិក្សា',
        description: 'ចែកចាយសៀវភៅ និងសម្ភារៈសិក្សាដល់សាលា',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        progress: 95,
        status: 'in-progress',
        responsible: 'ផ្នែកផ្គត់ផ្គង់'
      },
      {
        id: 'doe-3',
        name: 'ការបណ្តុះបណ្តាលគ្រូបង្រៀន',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        progress: 50,
        status: 'in-progress',
        responsible: 'ផ្នែកបណ្តុះបណ្តាល',
        milestones: [
          {
            id: 'doe-m1',
            name: 'វគ្គបណ្តុះបណ្តាលគ្រូថ្នាក់ទី១-៣',
            date: '2024-04-15',
            completed: true
          },
          {
            id: 'doe-m2',
            name: 'វគ្គបណ្តុះបណ្តាលគ្រូថ្នាក់ទី៤-៦',
            date: '2024-06-15',
            completed: false
          }
        ]
      },
      {
        id: 'doe-4',
        name: 'ការអធិការកិច្ចសាលារៀន',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        progress: 30,
        status: 'in-progress',
        responsible: 'អធិការដ្ឋាន'
      },
      {
        id: 'doe-5',
        name: 'របាយការណ៍លទ្ធផលសិក្សា',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        progress: 0,
        status: 'planned',
        responsible: 'ការិយាល័យអប់រំស្រុក'
      }
    ]
  },
  {
    contractType: 5,
    contractName: 'កិច្ចព្រមព្រៀង DoE-School',
    projectDuration: '១ ឆ្នាំសិក្សា',
    totalBudget: 100000,
    deliverables: [
      {
        id: 'school-1',
        name: 'ការរៀបចំផែនការសាលារៀន',
        description: 'បង្កើតផែនការអភិវឌ្ឍន៍សាលារៀនប្រចាំឆ្នាំ',
        startDate: '2024-01-01',
        endDate: '2024-01-20',
        progress: 100,
        status: 'completed',
        responsible: 'នាយកសាលា'
      },
      {
        id: 'school-2',
        name: 'ការកែលម្អហេដ្ឋារចនាសម្ព័ន្ធ',
        description: 'ជួសជុល និងកែលម្អអគារសិក្សា បន្ទប់ទឹក និងប្រព័ន្ធទឹកស្អាត',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        progress: 70,
        status: 'in-progress',
        responsible: 'គណៈគ្រប់គ្រងសាលា'
      },
      {
        id: 'school-3',
        name: 'កម្មវិធីគាំទ្រសិស្សពូកែ',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        progress: 45,
        status: 'in-progress',
        responsible: 'គ្រូបង្រៀន',
        milestones: [
          {
            id: 'school-m1',
            name: 'កំណត់សិស្សគោលដៅ',
            date: '2024-03-15',
            completed: true
          },
          {
            id: 'school-m2',
            name: 'ថ្នាក់បំប៉នបន្ថែម',
            date: '2024-04-01',
            completed: true
          }
        ]
      },
      {
        id: 'school-4',
        name: 'កម្មវិធីអាហារូបករណ៍',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        progress: 60,
        status: 'in-progress',
        responsible: 'គណៈកម្មាធិការសាលា'
      },
      {
        id: 'school-5',
        name: 'ការវាយតម្លៃលទ្ធផលសិក្សា',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        progress: 20,
        status: 'in-progress',
        responsible: 'នាយកសាលា'
      },
      {
        id: 'school-6',
        name: 'របាយការណ៍ប្រចាំឆ្នាំ',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        progress: 0,
        status: 'planned',
        responsible: 'នាយកសាលា'
      }
    ]
  }
]

// Get project plan by contract type and user role
export function getProjectPlanByContract(contractType: number | null, userRole?: string): ProjectPlan[] {
  if (!contractType) {
    // Admin/Super Admin can see all
    return PROJECT_PLANS
  }

  // Filter by contract type
  return PROJECT_PLANS.filter(plan => plan.contractType === contractType)
}

// Calculate overall progress for a project
export function calculateProjectProgress(deliverables: Deliverable[]): number {
  if (deliverables.length === 0) return 0
  const totalProgress = deliverables.reduce((sum, d) => sum + d.progress, 0)
  return Math.round(totalProgress / deliverables.length)
}

// Get upcoming milestones
export function getUpcomingMilestones(plans: ProjectPlan[], days: number = 30): any[] {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + days)

  const milestones: any[] = []

  plans.forEach(plan => {
    plan.deliverables.forEach(deliverable => {
      if (deliverable.milestones) {
        deliverable.milestones.forEach(milestone => {
          const milestoneDate = new Date(milestone.date)
          if (milestoneDate >= today && milestoneDate <= futureDate && !milestone.completed) {
            milestones.push({
              ...milestone,
              deliverableName: deliverable.name,
              contractName: plan.contractName,
              contractType: plan.contractType
            })
          }
        })
      }
    })
  })

  return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get delayed deliverables
export function getDelayedDeliverables(plans: ProjectPlan[]): Deliverable[] {
  const today = new Date().toISOString().split('T')[0]
  const delayed: any[] = []

  plans.forEach(plan => {
    plan.deliverables.forEach(deliverable => {
      if (deliverable.endDate < today && deliverable.progress < 100) {
        delayed.push({
          ...deliverable,
          contractName: plan.contractName,
          contractType: plan.contractType
        })
      }
    })
  })

  return delayed
}