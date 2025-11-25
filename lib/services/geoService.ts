export interface Province {
  id: number
  province_code: string
  province_name_kh: string
  province_name_en: string
  created_at?: string
  updated_at?: string
}

export interface District {
  id: number
  district_code: string
  district_name_kh: string
  district_name_en: string
  province_code: number
  created_at?: string
  updated_at?: string
}

export interface Commune {
  id: number
  commune_code: string
  commune_name_kh: string
  commune_name_en: string
  district_code: number
  province_code: number
  created_at?: string
  updated_at?: string
}

export interface Village {
  id: number
  village_code: string
  village_name_kh: string
  village_name_en: string
  commune_code: number
  district_code: number
  province_code: number
  created_at?: string
  updated_at?: string
}

export interface School {
  schoolId: number
  name: string
  code: string
  profile: string | null
  schoolType: string
  projectTypeId: number
  projectType?: {
    id: number
    name: string
    description: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  status: string
  place: {
    id: number
    provinceId: number
    province_name_kh: string
    province_name_en: string
    districtId: number
    district_name_kh: string
    district_name_en: string
    communeId: number | null
    commune_name_kh: string | null
  }
  createdAt?: string
  updatedAt?: string
}

const GEO_API_BASE = 'https://plp-api.moeys.gov.kh/api/v1/locations'
const SCHOOLS_API_BASE = 'https://plp-api.moeys.gov.kh/api/v1/schools'

class GeoService {
  private cache = new Map<string, any>()

  private async fetchWithCache(url: string) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      const data = await response.json()
      this.cache.set(url, data)
      return data
    } catch (error) {
      console.error('GeoService fetch error:', error)
      throw error
    }
  }

  // PROVINCES
  async getProvinces(): Promise<Province[]> {
    const response = await this.fetchWithCache(`${GEO_API_BASE}/provinces`)
    return Array.isArray(response) ? response : []
  }

  // DISTRICTS (triggered by Province selection)
  async getDistricts(provinceId: number): Promise<District[]> {
    const response = await this.fetchWithCache(
      `${GEO_API_BASE}/districts?province_id=${provinceId}`
    )
    return Array.isArray(response) ? response : []
  }

  // COMMUNES (triggered by District selection)
  async getCommunes(districtId: number): Promise<Commune[]> {
    const response = await this.fetchWithCache(
      `${GEO_API_BASE}/communes?district_id=${districtId}`
    )
    return Array.isArray(response) ? response : []
  }

  // VILLAGES (triggered by Commune selection)
  async getVillages(communeId: number): Promise<Village[]> {
    const response = await this.fetchWithCache(
      `${GEO_API_BASE}/villages?commune_id=${communeId}`
    )
    return Array.isArray(response) ? response : []
  }

  // SCHOOLS (triggered by District selection - NOT a separate level)
  async getSchoolsByDistrict(districtId: number): Promise<School[]> {
    try {
      const url = `${SCHOOLS_API_BASE}/district/${districtId}`
      const response = await this.fetchWithCache(url)
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching schools by district:', error)
      return []
    }
  }
}

const geoServiceInstance = new GeoService()
export default geoServiceInstance
