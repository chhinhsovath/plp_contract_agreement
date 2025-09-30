/**
 * Default Party A Configuration
 * This represents the primary organization that creates contracts
 */

export const defaultPartyA = {
  // Organization Information
  organization: {
    name_khmer: 'ប្រជាជនមាយកដាំនបបវ្បស្សនា',
    name_english: 'People Led Platform',
    abbreviation: 'PLP'
  },

  // Default signatory
  signatory: {
    name_khmer: 'លោកបណ្ឌិត កាន ពុទ្ធ',
    name_english: 'Dr. Kan Puth',
    position_khmer: 'ប្រធានមាយកដាំនបបវ្បស្សនា',
    position_english: 'President of People Led Platform',
    title: 'លោកបណ្ឌិត / Dr.'
  },

  // Contact Information
  contact: {
    phone: '+855 12 345 678',
    email: 'info@openplp.com',
    website: 'https://openplp.com',
    address_khmer: 'ភ្នំពេញ, កម្ពុជា',
    address_english: 'Phnom Penh, Cambodia'
  },

  // Default signature (base64 encoded)
  // Dr. Kan Puth's signature
  signature: {
    // This is a placeholder base64 representation of the signature
    // In production, replace this with the actual base64-encoded signature image
    data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0yMCA0MCBRNDAgMjAsIDYwIDM1IFQ5MCAzMCBRMTEwIDI1LCAxMzAgNDAgVDE2MCAzNSBRMTcwIDMwLCAxODAgNDAiIAogICAgICAgIHN0cm9rZT0iIzAwMDgzZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTEwIDUwIFEzMCA0MCwgNTAgNTUgVDgwIDUwIFExMDAgNDUsIDEyMCA2MCIgCiAgICAgICAgc3Ryb2tlPSIjMDAwODNmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPC9zdmc+',
    type: 'image/svg+xml'
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