/**
 * Default Party A Configuration
 * This represents the primary organization that creates contracts
 * Supports all contract types 1-5 with type-specific organization details
 */

// Type-specific Party A configurations
const partyAByType: any = {
  1: {
    // Agreement 1: PMU ↔ PCU
    organization: {
      name_khmer: 'គណៈកម្មាធិការគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ',
      name_english: 'National Project Management Unit (PMU)',
      abbreviation: 'PMU'
    },
    signatory: {
      name_khmer: 'រៀនលី',
      name_english: 'Ryan Lee',
      position_khmer: 'ប្រធាននាយកដ្ឋានគ្រប់គ្រងគម្រោង',
      position_english: 'Director of Project Management',
      title: 'លោក'
    }
  },
  2: {
    // Agreement 2: PCU Chief ↔ Project Manager
    organization: {
      name_khmer: 'គណៈកម្មាធិការគ្រប់គ្រងគម្រោងថ្នាក់ក្រោមជាតិ',
      name_english: 'Sub-national Project Management Unit (PCU)',
      abbreviation: 'PCU'
    },
    signatory: {
      name_khmer: 'សូគម',
      name_english: 'Sokum',
      position_khmer: 'ប្រធាននាយកដ្ឋាននាយកដ្ឋានគ្រប់គ្រង',
      position_english: 'Chief of Management Unit',
      title: 'លោក'
    }
  },
  3: {
    // Agreement 3: Project Manager ↔ Regional Officers
    organization: {
      name_khmer: 'គម្រោងលើកកម្ពស់កម្លាំងពលកម្មក្នុងតំបន់',
      name_english: 'Regional Project Office',
      abbreviation: 'RPO'
    },
    signatory: {
      name_khmer: 'វ៉ាន់រប័ន',
      name_english: 'Van Rabourn',
      position_khmer: 'ប្រធានគម្រោង',
      position_english: 'Project Manager',
      title: 'លោក'
    }
  },
  4: {
    // Agreement 4: Department ↔ District Office
    organization: {
      name_khmer: 'នាយកដ្ឋានបឋមសិក្សា',
      name_english: 'Primary Education Department',
      abbreviation: 'PED'
    },
    signatory: {
      name_khmer: 'កាន់ ពុទ្ធី',
      name_english: 'Kann Puthy',
      position_khmer: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
      position_english: 'Director of Primary Education',
      title: 'លោកបណ្ឌិត'
    }
  },
  5: {
    // Agreement 5: Department ↔ School
    organization: {
      name_khmer: 'នាយកដ្ឋានបឋមសិក្សា',
      name_english: 'Primary Education Department',
      abbreviation: 'PED'
    },
    signatory: {
      name_khmer: 'កាន់ ពុទ្ធី',
      name_english: 'Kann Puthy',
      position_khmer: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
      position_english: 'Director of Primary Education',
      title: 'លោកបណ្ឌិត'
    }
  }
}

// Default Party A (uses Type 4 as default for backward compatibility)
export const defaultPartyA = {
  // Organization Information
  organization: partyAByType[4].organization,

  // Default signatory (Dr. Kann Puthy for Types 4 & 5)
  signatory: partyAByType[4].signatory,

  // Contact Information
  contact: {
    phone: '+855 12 345 678',
    email: 'info@openplp.com',
    website: 'https://plp.moeyes.gov.kh',
    address_khmer: 'ភ្នំពេញ, កម្ពុជា',
    address_english: 'Phnom Penh, Cambodia'
  },

  // Default signature (actual image file)
  // Dr. Kann Puthy's actual signature from public/signatures/image.png
  signature: {
    // Public URL path for client-side access
    publicPath: '/signatures/image.png',
    type: 'image/png'
  }
}

// Helper function to convert signature image to base64
export async function getPartyASignatureBase64(): Promise<string> {
  // For server-side: read the file and convert to base64
  if (typeof window === 'undefined') {
    const fs = await import('fs')
    const path = await import('path')
    const signaturePath = path.join(process.cwd(), 'public', 'signatures', 'image.png')

    try {
      const imageBuffer = fs.readFileSync(signaturePath)
      const base64Image = imageBuffer.toString('base64')
      return `data:image/png;base64,${base64Image}`
    } catch (error) {
      console.error('Failed to read Party A signature:', error)
      return 'data:image/png;base64,PLACEHOLDER'
    }
  }

  // For client-side: return the public path (will be fetched by browser)
  return defaultPartyA.signature.publicPath
}

// Helper function to get Party A details for contracts
export function getDefaultPartyA() {
  return {
    party_a_name: `${defaultPartyA.signatory.title} ${defaultPartyA.signatory.name_khmer}`,
    party_a_position: defaultPartyA.signatory.position_khmer,
    party_a_organization: defaultPartyA.organization.name_khmer,
    party_a_signature: defaultPartyA.signature.publicPath
  }
}

// Get Party A info for a specific contract type
export function getPartyAInfoByType(contractType: number, language: 'km' | 'en' = 'km') {
  const typeConfig = partyAByType[contractType] || partyAByType[4]

  if (language === 'en') {
    return {
      name: `${typeConfig.signatory.title} ${typeConfig.signatory.name_english}`,
      position: typeConfig.signatory.position_english,
      organization: typeConfig.organization.name_english
    }
  }

  return {
    name: `${typeConfig.signatory.title} ${typeConfig.signatory.name_khmer}`,
    position: typeConfig.signatory.position_khmer,
    organization: typeConfig.organization.name_khmer
  }
}

// Get Party A info in specific language (default: Type 4 for backward compatibility)
export function getPartyAInfo(language: 'km' | 'en' = 'km') {
  return getPartyAInfoByType(4, language)
}