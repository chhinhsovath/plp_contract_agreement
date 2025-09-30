/**
 * Geographic API Service
 * Provides functions to fetch Cambodian administrative divisions
 * from the OpenPLP Geographic API
 */

const GEO_API_BASE = 'https://geoapi.openplp.com/api'

export interface Province {
  id: number
  province_name_kh: string
  province_name_en: string
  province_code: number
  _count?: {
    districts: number
    communes: number
    villages: number
  }
}

export interface District {
  id: number
  district_name_kh: string
  district_name_en: string
  district_code: number
  province_code: number
  province?: {
    province_name_en: string
    province_name_kh: string
  }
  _count?: {
    communes: number
    villages: number
  }
}

export interface Commune {
  id: number
  commune_name_kh: string
  commune_name_en: string
  commune_code: number
  district_code: number
  province_id: number
  district?: {
    district_name_en: string
    district_name_kh: string
  }
  province?: {
    province_name_en: string
    province_name_kh: string
  }
  _count?: {
    villages: number
  }
}

export interface Village {
  id: number
  village_name_kh: string
  village_name_en: string
  village_code: number | null
  commune_code: number
  district_code?: number
  province_id?: number
  commune?: {
    commune_name_en: string
    commune_name_kh: string
  }
  district?: {
    district_name_en: string
    district_name_kh: string
  }
  province?: {
    province_name_en: string
    province_name_kh: string
  }
}

// Fetch all provinces
export async function fetchProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(`${GEO_API_BASE}/provinces`)
    const result = await response.json()
    if (result.success) {
      return result.data
    }
    console.error('Failed to fetch provinces:', result.error)
    return []
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return []
  }
}

// Fetch districts by province code
export async function fetchDistricts(provinceCode?: number): Promise<District[]> {
  try {
    const url = provinceCode
      ? `${GEO_API_BASE}/districts?province_code=${provinceCode}`
      : `${GEO_API_BASE}/districts`

    const response = await fetch(url)
    const result = await response.json()
    if (result.success) {
      return result.data
    }
    console.error('Failed to fetch districts:', result.error)
    return []
  } catch (error) {
    console.error('Error fetching districts:', error)
    return []
  }
}

// Fetch communes by district code
export async function fetchCommunes(districtCode?: number): Promise<Commune[]> {
  try {
    const url = districtCode
      ? `${GEO_API_BASE}/communes?district_code=${districtCode}`
      : `${GEO_API_BASE}/communes`

    const response = await fetch(url)
    const result = await response.json()
    if (result.success) {
      return result.data
    }
    console.error('Failed to fetch communes:', result.error)
    return []
  } catch (error) {
    console.error('Error fetching communes:', error)
    return []
  }
}

// Fetch villages by commune code
export async function fetchVillages(communeCode?: number): Promise<Village[]> {
  try {
    const url = communeCode
      ? `${GEO_API_BASE}/villages?commune_code=${communeCode}`
      : `${GEO_API_BASE}/villages`

    const response = await fetch(url)
    const result = await response.json()
    if (result.success) {
      return result.data
    }
    console.error('Failed to fetch villages:', result.error)
    return []
  } catch (error) {
    console.error('Error fetching villages:', error)
    return []
  }
}

// Helper function to get full location name
export function getLocationFullName(location: any, language: 'kh' | 'en' = 'kh'): string {
  const names = []

  if (location.village) {
    names.push(language === 'kh' ? location.village.village_name_kh : location.village.village_name_en)
  }
  if (location.commune) {
    names.push(language === 'kh' ? location.commune.commune_name_kh : location.commune.commune_name_en)
  }
  if (location.district) {
    names.push(language === 'kh' ? location.district.district_name_kh : location.district.district_name_en)
  }
  if (location.province) {
    names.push(language === 'kh' ? location.province.province_name_kh : location.province.province_name_en)
  }

  return names.join(', ')
}