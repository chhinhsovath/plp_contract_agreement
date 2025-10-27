/**
 * Default Party A Configuration
 * This represents the primary organization that creates contracts
 */

export const defaultPartyA = {
  // Organization Information
  organization: {
    name_khmer: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
    name_english: 'Primary Education Department',
    abbreviation: 'PED'
  },

  // Default signatory
  signatory: {
    name_khmer: 'កាន់ ពុទ្ធី',
    name_english: 'Kann Puthy',
    position_khmer: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
    position_english: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
    title: 'លោកបណ្ឌិត'
  },

  // Contact Information
  contact: {
    phone: '+855 12 345 678',
    email: 'info@openplp.com',
    website: 'https://plp.moeyes.gov.kh',
    address_khmer: 'ភ្នំពេញ, កម្ពុជា',
    address_english: 'Phnom Penh, Cambodia'
  },

  // Default signature (actual image file)
  // Dr. Kan Puth's actual signature from public/signatures/image.png
  signature: {
    // Path to the actual signature image in public directory
    data: '/signatures/image.png',
    type: 'image/png'
  }
}

// Helper function to get Party A details for contracts
export function getDefaultPartyA() {
  return {
    party_a_name: `${defaultPartyA.signatory.title} ${defaultPartyA.signatory.name_khmer}`,
    party_a_position: defaultPartyA.signatory.position_khmer,
    party_a_organization: defaultPartyA.organization.name_khmer,
    party_a_signature: defaultPartyA.signature.data
  }
}

// Get Party A info in specific language
export function getPartyAInfo(language: 'km' | 'en' = 'km') {
  if (language === 'en') {
    return {
      name: `${defaultPartyA.signatory.title} ${defaultPartyA.signatory.name_english}`,
      position: defaultPartyA.signatory.position_english,
      organization: defaultPartyA.organization.name_english
    }
  }

  return {
    name: `${defaultPartyA.signatory.title} ${defaultPartyA.signatory.name_khmer}`,
    position: defaultPartyA.signatory.position_khmer,
    organization: defaultPartyA.organization.name_khmer
  }
}