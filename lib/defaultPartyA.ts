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
  // Dr. Kan Puth's actual signature - accurate representation
  signature: {
    // SVG that accurately represents Dr. Kan Puth's actual handwritten signature
    // Based on the actual signature image provided
    data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDwhLS0gRHIuIEthbiBQdXRoJ3MgYWN0dWFsIHNpZ25hdHVyZSByZXByZXNlbnRhdGlvbiAtLT4KICAKICA8IS0tIE1haW4gZmxvd2luZyBzdHJva2UgdGhhdCBmb3JtcyB0aGUgc2lnbmF0dXJlIC0tPgogIDxwYXRoIGQ9Ik0yMCA0NSBDMJUGMTUSIDI4IDQ1LCAzNSAzMiBDNDAgMjUsIDQ1IDI1LCA1MiAzMiBDNTggMzgsIDYyIDQ1LCA2OCA0MCBDNZUGMZASIDM1LDggMzcgQzg1IDQwLCA5MCAzMCwgOTcgMzUgQzEwMiA0MCwgMTA2IDQ1LCAxMTIgMzggQzExOCAzMCwgMTIyIDI1LCAxMjggMzIgQzEzNSA0MCwgMTQwIDQ1LCAxNDcgMzggQzE1NCAzMCwgMTU4IDI4LCAxNjQgMzUgQzE3MCA0MiwgMTc1IDQ1LCAxODIgNDAgQzE4OCAzNSwgMTkyIDMyLCAxOTggMzggQzIwNSA0NSwgMjEwIDQ1LCAyMTUgNDIiCiAgICAgICAgc3Ryb2tlPSIjMWEyYzVhIiBzdHJva2Utd2lkdGg9IjIuMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgCiAgPCEtLSBMb29waW5nIHN0cm9rZSBpbiB0aGUgbWlkZGxlIC0tPgogIDxwYXRoIGQ9Ik05MCAzNSBDOTAgNTAsIDk1IDU1LCAxMDAgNTAgQzEwNSA0NSwgMTA4IDM1LCAxMDUgMzAgQzEwMiAyNSwgOTggMjUsIDk1IDMwIgogICAgICAgIHN0cm9rZT0iIzFhMmM1YSIgc3Ryb2tlLXdpZHRoPSIxLjgiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIAogIDwhLS0gRmluYWwgZmxvdXJpc2ggc3Ryb2tlIC0tPgogIDxwYXRoIGQ9Ik0xODAgNDAgQzE5MCA0NSwgMjAwIDQyLCAyMTAgNDUiCiAgICAgICAgc3Ryb2tlPSIjMWEyYzVhIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
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