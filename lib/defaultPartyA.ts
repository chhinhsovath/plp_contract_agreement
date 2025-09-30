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
  // Dr. Kan Puth's actual signature
  signature: {
    // SVG representation mimicking Dr. Kan Puth's handwritten signature
    // This creates a flowing, cursive signature similar to the actual one
    data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDwhLS0gTWFpbiBzaWduYXR1cmUgc3Ryb2tlIHdpdGggZmxvd2luZyBjdXJzaXZlIHN0eWxlIC0tPgogIDxwYXRoIGQ9Ik0xNSA0NSBDMTQ1IDQ1LCAxNyAzMCwgMjIgMzUgQzI4IDQyLCAzNSA0MCwgNDAgMzAgQzQ1IDIwLCA1MCAzNSwgNTggMzggQzY1IDQyLCA3MCAzMCwgNzggMzUgQzg1IDQwLCA5MCAyNSwgOTggMzUgQzEwNSA0NSwgMTEwIDMwLCAxMTggMzggQzEyNSA0NSwgMTMwIDI1LCAxMzggNDAgQzE0NSA1MCwgMTUwIDM1LCAxNTggNDUgQzE2NSA1MiwgMTcwIDQwLCAxNzggNDUgQzE4NSA0OCwgMTkwIDQwLCAxOTggNDUgQzIwNSA0OCwgMjEwIDQyLCAyMTUgNDUiCiAgICAgICAgc3Ryb2tlPSIjMTIyYzVhIiBzdHJva2Utd2lkdGg9IjIuMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIwLjkiLz4KICAKICA8IS0tIFVuZGVybGluZSBmbG91cmlzaCAtLT4KICA8cGF0aCBkPSJNMjAgNTUgQzQwIDUyLCA2MCA1OCwgODAgNTUgQzEwMCA1MiwgMTIwIDU4LCAxNDAgNTUgQzE2MCA1MiwgMTgwIDU2LCAyMDAgNTUiCiAgICAgICAgc3Ryb2tlPSIjMTIyYzVhIiBzdHJva2Utd2lkdGg9IjEuOCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIwLjgiLz4KICAKICA8IS0tIENyb3NzaW5nIGxvb3AgLS0+CiAgPHBhdGggZD0iTTEwNSAzMCBDMTA1IDUwLCAxMTAgNTUsIDExNSA1MCBDMTIwIDQ1LCAxMjAgMzAsIDExNSAyOCIKICAgICAgICBzdHJva2U9IiMxMjJjNWEiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIG9wYWNpdHk9IjAuNyIvPgo8L3N2Zz4=',
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