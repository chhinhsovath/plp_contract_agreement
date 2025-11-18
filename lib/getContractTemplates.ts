import { prisma } from './prisma'

interface ContractTemplate {
  id: number
  title: string
  partyA: string
  partyASignatory: string
  partyAPosition: string
  partyASignature: string | null
  partyB: string
  responsibilities: string[]
  content: string
}

// Helper to get content text from database
async function getContent(key: string, fallback: string = ''): Promise<string> {
  try {
    const content = await prisma.content_texts.findUnique({
      where: { key, is_active: true }
    })
    return content?.text_khmer || fallback
  } catch (error) {
    console.error(`Failed to fetch content for key: ${key}`, error)
    return fallback
  }
}

// Get contract template from CMS database
export async function getContractTemplate(contractType: number, partyAInfo: any): Promise<ContractTemplate | null> {
  try {
    const templates: Record<number, () => Promise<ContractTemplate>> = {
      1: async () => ({
        id: 1,
        title: await getContent('contract_1_title', 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង គបស និង គបក'),
        partyA: partyAInfo.party_a_organization,
        partyASignatory: partyAInfo.party_a_name,
        partyAPosition: partyAInfo.party_a_position,
        partyASignature: partyAInfo.party_a_signature,
        partyB: await getContent('contract_1_party_b', 'គណៈកម្មការគ្រប់គ្រងគម្រោងថ្នាក់ក្រោមជាតិ (គបក)'),
        responsibilities: [
          await getContent('contract_1_responsibility_1', 'ផ្តល់ការណែនាំគោលនយោបាយ និងយុទ្ធសាស្ត្រ'),
          await getContent('contract_1_responsibility_2', 'អនុម័តផែនការការងារ និងថវិកាប្រចាំឆ្នាំ'),
          await getContent('contract_1_responsibility_3', 'តាមដាន និងវាយតម្លៃការអនុវត្តគម្រោង'),
          await getContent('contract_1_responsibility_4', 'សម្របសម្រួលជាមួយភាគីពាក់ព័ន្ធ'),
          await getContent('contract_1_responsibility_5', 'ធានាការអនុវត្តតាមបទដ្ឋានគតិយុត្តិ')
        ],
        content: `
          <p>${await getContent('contract_1_content_intro')}</p>
          <h5>${await getContent('contract_1_conditions_title')}</h5>
          <ul>
            <li>${await getContent('contract_1_condition_duration')}</li>
            <li>${await getContent('contract_1_condition_budget')}</li>
            <li>${await getContent('contract_1_condition_evaluation')}</li>
          </ul>
        `
      }),
      2: async () => ({
        id: 2,
        title: await getContent('contract_2_title', 'កិច្ចព្រមព្រៀងរវាង គបក និងអ្នកគ្រប់គ្រងគម្រោង'),
        partyA: partyAInfo.party_a_organization,
        partyASignatory: partyAInfo.party_a_name,
        partyAPosition: partyAInfo.party_a_position,
        partyASignature: partyAInfo.party_a_signature,
        partyB: await getContent('contract_2_party_b', 'អ្នកគ្រប់គ្រងគម្រោង'),
        responsibilities: [
          await getContent('contract_2_responsibility_1', 'អនុវត្តផែនការការងារតាមការណែនាំ'),
          await getContent('contract_2_responsibility_2', 'គ្រប់គ្រងថវិកា និងធនធានគម្រោង'),
          await getContent('contract_2_responsibility_3', 'រាយការណ៍វឌ្ឍនភាពប្រចាំខែ'),
          await getContent('contract_2_responsibility_4', 'សហការជាមួយអង្គភាពអនុវត្ត'),
          await getContent('contract_2_responsibility_5', 'រក្សាឯកសារ និងទិន្នន័យគម្រោង')
        ],
        content: `
          <p>${await getContent('contract_2_content_intro')}</p>
          <h5>${await getContent('contract_2_indicators_title')}</h5>
          <ul>
            <li>${await getContent('contract_2_indicator_plan')}</li>
            <li>${await getContent('contract_2_indicator_budget')}</li>
            <li>${await getContent('contract_2_indicator_reporting')}</li>
          </ul>
        `
      }),
      3: async () => ({
        id: 3,
        title: await getContent('contract_3_title', 'កិច្ចព្រមព្រៀងរវាងអ្នកគ្រប់គ្រងគម្រោង និងតំបន់'),
        partyA: partyAInfo.party_a_organization,
        partyASignatory: partyAInfo.party_a_name,
        partyAPosition: partyAInfo.party_a_position,
        partyASignature: partyAInfo.party_a_signature,
        partyB: await getContent('contract_3_party_b', 'អ្នកសម្របសម្រួលតំបន់'),
        responsibilities: [
          await getContent('contract_3_responsibility_1', 'សម្របសម្រួលការអនុវត្តកម្មវិធីនៅតំបន់'),
          await getContent('contract_3_responsibility_2', 'គាំទ្របច្ចេកទេសដល់សាលារៀន'),
          await getContent('contract_3_responsibility_3', 'តាមដានវឌ្ឍនភាពប្រចាំសប្តាហ៍'),
          await getContent('contract_3_responsibility_4', 'រៀបចំកិច្ចប្រជុំសម្របសម្រួល'),
          await getContent('contract_3_responsibility_5', 'ធ្វើរបាយការណ៍ប្រចាំខែ')
        ],
        content: `
          <p>${await getContent('contract_3_content_intro')}</p>
          <h5>${await getContent('contract_3_coverage_title')}</h5>
          <ul>
            <li>${await getContent('contract_3_coverage_provinces')}</li>
            <li>${await getContent('contract_3_coverage_schools')}</li>
            <li>${await getContent('contract_3_coverage_students')}</li>
          </ul>
        `
      }),
      4: async () => ({
        id: 4,
        title: await getContent('contract_4_title', 'កិច្ចព្រមព្រៀងរនាយកដ្ឋានបឋមសិក្សា និងការិយាល័យអប់រំស្រុក'),
        partyA: partyAInfo.party_a_organization,
        partyASignatory: partyAInfo.party_a_name,
        partyAPosition: partyAInfo.party_a_position,
        partyASignature: partyAInfo.party_a_signature,
        partyB: await getContent('contract_4_party_b', 'ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក'),
        responsibilities: [
          await getContent('contract_4_responsibility_1', 'អនុវត្តគោលនយោបាយអប់រំថ្នាក់ជាតិ'),
          await getContent('contract_4_responsibility_2', 'គ្រប់គ្រងគ្រូបង្រៀន និងសាលារៀន'),
          await getContent('contract_4_responsibility_3', 'ចែកចាយសម្ភារៈសិក្សា'),
          await getContent('contract_4_responsibility_4', 'ធ្វើអធិការកិច្ចសាលារៀន'),
          await getContent('contract_4_responsibility_5', 'រាយការណ៍លទ្ធផលសិក្សា')
        ],
        content: `
          <p>${await getContent('contract_4_content_intro')}</p>
          <h5>${await getContent('contract_4_goals_title')}</h5>
          <ul>
            <li>${await getContent('contract_4_goal_schools')}</li>
            <li>${await getContent('contract_4_goal_teachers')}</li>
            <li>${await getContent('contract_4_goal_pass_rate')}</li>
          </ul>
        `
      }),
      5: async () => ({
        id: 5,
        title: await getContent('contract_5_title', 'កិច្ចព្រមព្រៀងរវាងមន្ទីរអប់រំ និងសាលារៀន'),
        partyA: partyAInfo.party_a_organization,
        partyASignatory: partyAInfo.party_a_name,
        partyAPosition: partyAInfo.party_a_position,
        partyASignature: partyAInfo.party_a_signature,
        partyB: await getContent('contract_5_party_b', 'សាលាបឋមសិក្សា'),
        responsibilities: [
          await getContent('contract_5_responsibility_1', 'ធានាគុណភាពអប់រំ'),
          await getContent('contract_5_responsibility_2', 'គ្រប់គ្រងធនធានមនុស្ស'),
          await getContent('contract_5_responsibility_3', 'ថែរក្សាហេដ្ឋារចនាសម្ព័ន្ធ'),
          await getContent('contract_5_responsibility_4', 'អនុវត្តកម្មវិធីសិក្សា'),
          await getContent('contract_5_responsibility_5', 'វាយតម្លៃលទ្ធផលសិស្ស')
        ],
        content: `
          <p>${await getContent('contract_5_content_intro')}</p>
          <h5>${await getContent('contract_5_criteria_title')}</h5>
          <ul>
            <li>${await getContent('contract_5_criterion_attendance')}</li>
            <li>${await getContent('contract_5_criterion_performance')}</li>
            <li>${await getContent('contract_5_criterion_infrastructure')}</li>
          </ul>
        `
      })
    }

    const templateBuilder = templates[contractType]
    return templateBuilder ? await templateBuilder() : null
  } catch (error) {
    console.error('Error loading contract template:', error)
    return null
  }
}

// Get all contract templates (for listing)
export async function getAllContractTemplates(partyAInfo: any): Promise<ContractTemplate[]> {
  const templates: ContractTemplate[] = []

  for (let i = 1; i <= 5; i++) {
    const template = await getContractTemplate(i, partyAInfo)
    if (template) {
      templates.push(template)
    }
  }

  return templates
}
