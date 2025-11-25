# Complete Cascading Geographic Selection Implementation
# Implement cascading geographic selection following sa-training-for-plp pattern
## Overview
This document provides a complete reference for implementing cascading geographic selection across multiple levels:
- **Province** → **District** → **Commune** → **Village** + **School** (triggered by District)

Used in: Beneficiary Registration, Profile Edit, Training Management

---

## Architecture

### Data Flow Diagram
```
User selects Province
    ↓ (loadDistricts)
Districts loaded
    ↓
User selects District
    ↓ (loadCommunes + loadSchools)
Communes loaded
Schools loaded  ← KEY: Schools triggered by District, not separate step
    ↓
User selects Commune
    ↓ (loadVillages)
Villages loaded
    ↓
Form Ready to Submit
```

### Key Principle
**Schools are ALWAYS triggered by District selection, never as a separate cascade level**

---

## API Endpoints

### Geographic Data (plp-api.moeys.gov.kh)
```
GET https://plp-api.moeys.gov.kh/api/v1/locations/provinces
GET https://plp-api.moeys.gov.kh/api/v1/locations/districts?province_id={provinceId}
GET https://plp-api.moeys.gov.kh/api/v1/locations/communes?district_id={districtId}
GET https://plp-api.moeys.gov.kh/api/v1/locations/villages?commune_id={communeId}
```

### Schools Data (plp-api.moeys.gov.kh)
```
GET https://plp-api.moeys.gov.kh/api/v1/schools/district/{districtId}
```

### Response Format
All geographic endpoints return:
```json
[
  {
    "id": 1,
    "province_code": "01",
    "province_name_kh": "កែវ",
    "province_name_en": "Koh Kong"
  }
]
```

Schools endpoint returns:
```json
[
  {
    "schoolId": 1,
    "name": "សាលាមឌឌ",
    "code": "SCHOOL-001",
    "schoolType": "សាលារដ្ឋ",
    "status": "ACTIVE",
    "place": {
      "provinceId": 1,
      "province_name_kh": "កែវ",
      "districtId": 2,
      "district_name_kh": "ក្រុងក្រេង"
    }
  }
]
```

---

## GeoService Implementation

### Location: `src/services/geoService.ts`

```typescript
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
  province_code: number  // FK to Province.id
  created_at?: string
  updated_at?: string
}

export interface Commune {
  id: number
  commune_code: string
  commune_name_kh: string
  commune_name_en: string
  district_code: number  // FK to District.id
  province_code: number
  created_at?: string
  updated_at?: string
}

export interface Village {
  id: number
  village_code: string
  village_name_kh: string
  village_name_en: string
  commune_code: number  // FK to Commune.id
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
      console.log('GeoService: Fetching schools from:', url)
      const response = await this.fetchWithCache(url)
      console.log('GeoService: Schools response:', response)
      const result = Array.isArray(response) ? response : []
      console.log('GeoService: Schools result array:', result)
      return result
    } catch (error) {
      console.error('Error fetching schools by district:', error)
      return []
    }
  }

  // Helper methods to get by ID
  async getProvinceById(id: number): Promise<Province | undefined> {
    const provinces = await this.getProvinces()
    return provinces.find(p => p.id === id)
  }

  async getDistrictById(id: number, provinceId: number): Promise<District | undefined> {
    const districts = await this.getDistricts(provinceId)
    return districts.find(d => d.id === id)
  }

  async getCommuneById(id: number, districtId: number): Promise<Commune | undefined> {
    const communes = await this.getCommunes(districtId)
    return communes.find(c => c.id === id)
  }

  async getVillageById(id: number, communeId: number): Promise<Village | undefined> {
    const villages = await this.getVillages(communeId)
    return villages.find(v => v.id === id)
  }

  // Helper to find location IDs by names (cascading search)
  async findLocationByName(
    provinceName?: string,
    districtName?: string,
    communeName?: string,
    villageName?: string
  ) {
    const result = {
      provinceId: null as number | null,
      districtId: null as number | null,
      communeId: null as number | null,
      villageId: null as number | null,
    }

    if (provinceName) {
      const provinces = await this.getProvinces()
      const province = provinces.find(p =>
        p.province_name_kh === provinceName ||
        p.province_name_en === provinceName
      )
      if (province) {
        result.provinceId = province.id

        if (districtName) {
          const districts = await this.getDistricts(province.id)
          const district = districts.find(d =>
            d.district_name_kh === districtName ||
            d.district_name_en === districtName
          )
          if (district) {
            result.districtId = district.id

            if (communeName) {
              const communes = await this.getCommunes(district.id)
              const commune = communes.find(c =>
                c.commune_name_kh === communeName ||
                c.commune_name_en === communeName
              )
              if (commune) {
                result.communeId = commune.id

                if (villageName) {
                  const villages = await this.getVillages(commune.id)
                  const village = villages.find(v =>
                    v.village_name_kh === villageName ||
                    v.village_name_en === villageName
                  )
                  if (village) {
                    result.villageId = village.id
                  }
                }
              }
            }
          }
        }
      }
    }

    return result
  }
}

const geoServiceInstance = new GeoService()
export default geoServiceInstance
```

---

## React Component Implementation

### Location: `src/app/beneficiary/register/page.tsx`

#### State Setup
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Form, Select, Divider, Typography, message } from 'antd'
import geoService, { Province, District, Commune, Village, School } from '@/services/geoService'

const { Text } = Typography

export default function BeneficiaryRegisterPage() {
  const [form] = Form.useForm()

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [schools, setSchools] = useState<School[]>([])

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)
  const [loadingSchools, setLoadingSchools] = useState(false)

  // Selected IDs (for cascading)
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
  const [selectedCommuneId, setSelectedCommuneId] = useState<number | null>(null)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])
```

#### Load Functions
```typescript
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true)
      const data = await geoService.getProvinces()
      setProvinces(data)
    } catch (error) {
      console.error('Failed to load provinces:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកខេត្ត')
    } finally {
      setLoadingProvinces(false)
    }
  }

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true)
      // Clear all dependent data when province changes
      setDistricts([])
      setCommunes([])
      setVillages([])
      setSchools([])
      form.setFieldValue('districtId', null)
      form.setFieldValue('communeId', null)
      form.setFieldValue('villageId', null)
      form.setFieldValue('schoolId', null)

      const data = await geoService.getDistricts(provinceId)
      setDistricts(data)
    } catch (error) {
      console.error('Failed to load districts:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកស្រុក/ខណ្ឌ')
    } finally {
      setLoadingDistricts(false)
    }
  }

  const loadCommunes = async (districtId: number) => {
    try {
      setLoadingCommunes(true)
      // Clear dependent data
      setCommunes([])
      setVillages([])
      form.setFieldValue('communeId', null)
      form.setFieldValue('villageId', null)

      const data = await geoService.getCommunes(districtId)
      setCommunes(data)
    } catch (error) {
      console.error('Failed to load communes:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកឃុំ/សង្កាត់')
    } finally {
      setLoadingCommunes(false)
    }
  }

  const loadVillages = async (communeId: number) => {
    try {
      setLoadingVillages(true)
      setVillages([])
      form.setFieldValue('villageId', null)

      const data = await geoService.getVillages(communeId)
      setVillages(data)
    } catch (error) {
      console.error('Failed to load villages:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកភូមិ')
    } finally {
      setLoadingVillages(false)
    }
  }

  // ✅ KEY: Schools load from District selection, not separate level
  const loadSchools = async (districtId: number) => {
    try {
      setLoadingSchools(true)
      setSchools([])
      form.setFieldValue('schoolId', null)

      console.log('Loading schools for district ID:', districtId)
      const data = await geoService.getSchoolsByDistrict(districtId)
      console.log('Schools data received:', data)
      console.log('Schools data type:', typeof data, 'Is array:', Array.isArray(data))

      if (!Array.isArray(data)) {
        console.warn('Schools data is not an array:', data)
        setSchools([])
        message.warning('ទម្រង់ទិន្នន័យសាលារៀនមិនត្រឹមត្រូវ')
      } else {
        setSchools(data)
        console.log('Schools loaded successfully:', data.length, 'schools found')
      }
    } catch (error) {
      console.error('Failed to load schools:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកសាលា')
    } finally {
      setLoadingSchools(false)
    }
  }
```

#### Form Fields (with correct onChange handlers)
```typescript
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>

        {/* GEOGRAPHIC SECTION */}
        <Divider>🗺️ ព័ត៌មានភូមិសាស្ត្រ</Divider>

        {/* Province - Triggers Districts */}
        <Form.Item
          name="provinceId"
          label={<Text strong>ខេត្ត/រាជធានី</Text>}
          rules={[{ required: true, message: 'សូមជ្រើសរើសខេត្ត' }]}
        >
          <Select
            placeholder="ជ្រើសរើសខេត្ត"
            loading={loadingProvinces}
            showSearch
            onChange={(value) => {
              setSelectedProvinceId(value)
              loadDistricts(value)
            }}
            options={provinces.map(province => ({
              value: province.id,
              label: province.province_name_kh
            }))}
          />
        </Form.Item>

        {/* District - Triggers BOTH Communes AND Schools */}
        <Form.Item
          name="districtId"
          label={<Text strong>ស្រុក/ខណ្ឌ</Text>}
        >
          <Select
            placeholder="ជ្រើសរើសស្រុក/ខណ្ឌ"
            loading={loadingDistricts}
            disabled={!selectedProvinceId}
            showSearch
            allowClear
            onChange={(value) => {
              setSelectedDistrictId(value)
              if (value) {
                // ✅ CRITICAL: Call BOTH loadCommunes AND loadSchools
                loadCommunes(value)
                loadSchools(value)
              } else {
                // ✅ CRITICAL: Clear all dependent data
                setCommunes([])
                setSchools([])
                setVillages([])
                form.setFieldValue('communeId', null)
                form.setFieldValue('schoolId', null)
                form.setFieldValue('villageId', null)
              }
            }}
            options={districts.map(district => ({
              value: district.id,
              label: district.district_name_kh
            }))}
          />
        </Form.Item>

        {/* Commune - Triggers Villages */}
        <Form.Item
          name="communeId"
          label={<Text strong>ឃុំ/សង្កាត់</Text>}
        >
          <Select
            placeholder="ជ្រើសរើសឃុំ/សង្កាត់"
            loading={loadingCommunes}
            disabled={!selectedDistrictId}
            showSearch
            allowClear
            onChange={(value) => {
              setSelectedCommuneId(value)
              if (value) {
                loadVillages(value)
              } else {
                setVillages([])
                form.setFieldValue('villageId', null)
              }
            }}
            options={communes.map(commune => ({
              value: commune.id,
              label: commune.commune_name_kh
            }))}
          />
        </Form.Item>

        {/* Village - Final level */}
        <Form.Item
          name="villageId"
          label={<Text strong>ភូមិ</Text>}
        >
          <Select
            placeholder="ជ្រើសរើសភូមិ"
            loading={loadingVillages}
            disabled={!selectedCommuneId}
            showSearch
            allowClear
            options={villages.map(village => ({
              value: village.id,
              label: village.village_name_kh
            }))}
          />
        </Form.Item>

        {/* School - Triggered by District, NOT in cascade chain */}
        <Form.Item
          name="schoolId"
          label={<Text strong>សាលារៀន</Text>}
        >
          <Select
            placeholder="ជ្រើសរើणणសាលារៀន"
            loading={loadingSchools}
            disabled={!selectedDistrictId}
            showSearch
            allowClear
            notFoundContent={
              loadingSchools ? null : <Text>មិនមានសាលារៀន</Text>
            }
            options={schools.map(school => ({
              value: school.schoolId,
              label: school.name
            }))}
          />
        </Form.Item>

      </Form>
    </div>
  )
}
```

---

## Form Submission with Location Names

```typescript
  const handleSubmit = async (values: any) => {
    try {
      // Get selected location names from IDs
      let provinceName = ''
      let districtName = ''
      let communeName = ''
      let villageName = ''

      if (values.provinceId) {
        const province = provinces.find(p => p.id === values.provinceId)
        if (province) provinceName = province.province_name_kh
      }
      if (values.districtId) {
        const district = districts.find(d => d.id === values.districtId)
        if (district) districtName = district.district_name_kh
      }
      if (values.communeId) {
        const commune = communes.find(c => c.id === values.communeId)
        if (commune) communeName = commune.commune_name_kh
      }
      if (values.villageId) {
        const village = villages.find(v => v.id === values.villageId)
        if (village) villageName = village.village_name_kh
      }

      // Create payload
      const payload = {
        name: values.name,
        sex: values.sex,
        phone: values.phone,
        position: values.position,
        subject: values.subject,
        grade: values.grade,
        school: values.school,
        cluster: values.cluster,
        // Location names (not IDs)
        province_name: provinceName,
        district_name: districtName,
        commune_name: communeName,
        village_name: villageName,
      }

      // Send to API
      const response = await fetch('/api/beneficiary/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      message.success('ចុះឈ្មោះបានជោគជ័យ!')
      router.push('/beneficiary/dashboard')
    } catch (error) {
      console.error('Submit error:', error)
      message.error('មានបញ្ហាក្នុងការចុះឈ្មោះ')
    }
  }
```

---

## Common Issues & Solutions

### Issue 1: Schools Not Rendering After District Selection
**Symptom**: District selected, communes load fine, but schools dropdown empty

**Cause**: `loadSchools()` not called in district `onChange`

**Solution**:
```typescript
// ❌ WRONG
onChange={(value) => {
  setSelectedDistrictId(value)
  if (value) {
    loadCommunes(value)  // Only loading communes!
  }
}}

// ✅ CORRECT
onChange={(value) => {
  setSelectedDistrictId(value)
  if (value) {
    loadCommunes(value)
    loadSchools(value)   // Must call both!
  }
}}
```

### Issue 2: Villages Not Clearing When District Changes
**Symptom**: User selects District A (gets Villages A), then changes to District B, but Villages A still show

**Cause**: Villages not cleared in `loadDistricts`

**Solution**:
```typescript
// ✅ Always clear dependent data when parent changes
const loadDistricts = async (provinceId: number) => {
  setDistricts([])
  setCommunes([])
  setVillages([])    // ← Add this
  setSchools([])     // ← And this
  // ... load districts
}

// ✅ Always clear when clearing selection
onChange={(value) => {
  if (!value) {
    setCommunes([])
    setVillages([])
    setSchools([])
    form.setFieldValue('communeId', null)
    form.setFieldValue('villageId', null)
    form.setFieldValue('schoolId', null)
  }
}
```

### Issue 3: API Returns Object Instead of Array
**Symptom**: Schools array check fails, no schools render

**Cause**: API endpoint structure changed or returns wrapped data

**Solution**:
```typescript
// ✅ Validate response type
const loadSchools = async (districtId: number) => {
  try {
    const data = await geoService.getSchoolsByDistrict(districtId)

    if (!Array.isArray(data)) {
      console.warn('Schools data is not array:', data)
      // Check if data is wrapped in a property
      if (data?.data && Array.isArray(data.data)) {
        setSchools(data.data)
      } else {
        setSchools([])
      }
    } else {
      setSchools(data)
    }
  } catch (error) {
    console.error('Failed to load schools:', error)
  }
}
```

### Issue 4: Form Field Names Inconsistent with Payload
**Symptom**: Form values don't match API expectations

**Solution**: Use exact field names when submitting
```typescript
// ✅ Correct field name mapping
const payload = {
  province_name: provinceName,      // snake_case
  district_name: districtName,      // matches database
  commune_name: communeName,
  village_name: villageName,
}

// NOT:
// provinceName, districtName, communeName (camelCase) ❌
```

---

## Testing Checklist

### Functional Tests
- [ ] Provinces load on page load
- [ ] Selecting province loads districts
- [ ] Selecting district loads communes AND schools
- [ ] Communes dropdown shows options
- [ ] Schools dropdown shows options
- [ ] Selecting commune loads villages
- [ ] Villages dropdown shows options
- [ ] Clearing district clears all dependent fields (communes, villages, schools)
- [ ] Clearing commune clears villages only
- [ ] Form can submit with all required fields

### Edge Cases
- [ ] Select Province A → Districts load
- [ ] Change to Province B → Old districts cleared, new ones load
- [ ] Select District 1 → Schools load
- [ ] Change to District 2 (same province) → Old schools cleared, new ones load
- [ ] Select District → No schools in response → Shows "មិនមានសាលារៀន"
- [ ] API call fails → Shows error message

### Console Logging
When district selected, verify console shows:
```
Loading schools for district ID: 5
GeoService: Fetching schools from: https://plp-api.moeys.gov.kh/api/v1/schools/district/5
GeoService: Schools response: [...]
GeoService: Schools result array: Array(n)
Schools loaded successfully: 10 schools found
```

---

## Performance Optimization

### Caching
GeoService already implements caching:
```typescript
private cache = new Map<string, any>()

private async fetchWithCache(url: string) {
  if (this.cache.has(url)) {
    return this.cache.get(url)  // Return cached data
  }
  // ... fetch from API
  this.cache.set(url, data)  // Store in cache
}
```

### Best Practices
1. **Don't call load functions in render** - Use `useEffect`
2. **Use selection state** - Track `selectedProvinceId`, `selectedDistrictId`, etc.
3. **Disable dependent dropdowns** - `disabled={!selectedProvinceId}`
4. **Show loading state** - `loading={loadingDistricts}`
5. **Handle empty responses** - Show "មិនមាន..." message

---

## API Integration Notes

### Authentication
If API requires authentication, add headers:
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### CORS Issues
If experiencing CORS errors:
- Check if API allows requests from your domain
- May need proxy configuration in `next.config.js`
- In development, ensure Next.js proxy is configured

### Rate Limiting
API may rate limit requests. GeoService caching helps:
- First call: API call
- Second call with same parameter: Cached response
- No duplicate API calls for same district

---

## Database Storage Notes

When storing cascade data, always store NAMES not IDs:
```sql
-- ✅ CORRECT
INSERT INTO beneficiaries (province_name, district_name, commune_name, village_name)
VALUES ('កែវ', 'ក្រុងក្រេង', 'ឃុំក្រេង', 'ភូមិចាប់ស');

-- ❌ WRONG - IDs change, data becomes meaningless
INSERT INTO beneficiaries (province_id, district_id, commune_id)
VALUES (1, 2, 3);
```

**Why**: IDs can change in geographic data, but names are stable. Names allow data recovery if IDs are restructured.

---

## Related Files

- **Service**: `src/services/geoService.ts`
- **Register Form**: `src/app/beneficiary/register/page.tsx`
- **Edit Form**: `src/components/beneficiary/ProfileEditForm.tsx`
- **Types**: Check inline TypeScript interfaces in geoService.ts
- **API Base**: `https://plp-api.moeys.gov.kh`

---

## Version History

| Date | Change | Impact |
|------|--------|--------|
| 2025-11-19 | Added schools loading from district | Schools now render correctly |
| 2025-11-19 | Fixed clear logic for villages | Proper data cleanup on selection change |
| 2025-11-19 | Added comprehensive debugging | Better error diagnosis |

---

## Questions?

When implementing cascading selection:
1. Check console logs first
2. Verify API endpoints respond correctly
3. Ensure load functions called in correct onChange handlers
4. Confirm field names match between form and payload
5. Test with actual data to verify rendering

For Cambodia geographic data:
- Total Provinces: 25
- Districts: ~185
- Communes: ~1,650
- Villages: ~13,000+
- Schools: Variable by district


{
  "permissions": {
    "allow": [
      "Bash(PGPASSWORD='P@ssw0rd' psql:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c \"DELETE FROM reconfiguration_requests WHERE request_reason = ''sdfsdf''; SELECT ''Deleted test request'' as result;\")",
      "Bash(curl:*)",
      "Bash(npm run build:*)",
      "Bash(find:*)",
      "Bash(npx prisma migrate dev:*)",
      "Bash(npx prisma generate:*)",
      "Bash(PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'' ORDER BY table_name;\")",
      "Bash(PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c \"\nSELECT c.id, c.contract_number, c.contract_html FROM contracts WHERE id = 59 LIMIT 1;\n\")",
      "Bash(npx tsx:*)",
      "Bash(PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin -d plp_contract_agreement -c \"UPDATE content_texts SET text_khmer = ''កិច្ចព្រមព្រៀងរវាង នាយកដ្ឋានបឋមសិក្សា និងសាលារៀន'' WHERE key = ''contract_5_title''; SELECT key, text_khmer FROM content_texts WHERE key = ''contract_5_title'';\")"
    ],
    "deny": [],
    "ask": []
  }
}
