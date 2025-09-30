# Frontend API Integration Guide

This guide provides comprehensive documentation for frontend developers to integrate with the Geographic API for full CRUD operations on Cambodian administrative divisions.

## Base URL

```
Production: https://agreements.openplp.com
```

## API Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "data": [...], // Array of objects or single object
  "count": number // Total count of items returned
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Authentication

**✅ NO AUTHENTICATION REQUIRED** - All geographic APIs are publicly accessible.

## Entity Schemas

### Province
```typescript
interface Province {
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
```

### District
```typescript
interface District {
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
```

### Commune
```typescript
interface Commune {
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
```

### Village
```typescript
interface Village {
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
```

### School
```typescript
interface School {
  school_id: number
  name: string
  code: string
  status: string
  profile: string
}
```

## API Endpoints

## 1. Provinces API

### GET /api/provinces
Get all provinces with statistics.

```javascript
// Fetch all provinces
const response = await fetch('/api/provinces')
const { success, data, count } = await response.json()

// Example response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "province_name_kh": "បន្ទាយមានជ័យ",
      "province_name_en": "Banteay Meanchey",
      "province_code": 1,
      "_count": {
        "districts": 9,
        "communes": 64,
        "villages": 624
      }
    }
  ],
  "count": 25
}
```

### POST /api/provinces
Create a new province.

```javascript
const createProvince = async (provinceData) => {
  const response = await fetch('/api/provinces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      province_name_kh: 'ខេត្តថ្មី',
      province_name_en: 'New Province',
      province_code: 26
    })
  })
  return await response.json()
}
```

### PUT /api/provinces/[id]
Update an existing province.

```javascript
const updateProvince = async (id, updates) => {
  const response = await fetch(`/api/provinces/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  })
  return await response.json()
}
```

### DELETE /api/provinces/[id]
Delete a province.

```javascript
const deleteProvince = async (id) => {
  const response = await fetch(`/api/provinces/${id}`, {
    method: 'DELETE'
  })
  return await response.json()
}
```

## 2. Districts API

### GET /api/districts
Get districts with optional province filtering.

```javascript
// Get all districts
const response = await fetch('/api/districts')

// Get districts by province
const response = await fetch('/api/districts?province_code=1')

const { success, data, count } = await response.json()
```

### POST /api/districts
Create a new district.

```javascript
const createDistrict = async (districtData) => {
  const response = await fetch('/api/districts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      district_name_kh: 'ស្រុកថ្មី',
      district_name_en: 'New District',
      district_code: 1001,
      province_code: 1
    })
  })
  return await response.json()
}
```

### PUT /api/districts/[id]
Update an existing district.

### DELETE /api/districts/[id]
Delete a district.

## 3. Communes API

### GET /api/communes
Get communes with optional filtering.

```javascript
// Get all communes
const response = await fetch('/api/communes')

// Filter by district
const response = await fetch('/api/communes?district_code=101')

// Filter by both district and province
const response = await fetch('/api/communes?district_code=101&province_id=1')
```

### POST /api/communes
Create a new commune.

```javascript
const createCommune = async (communeData) => {
  const response = await fetch('/api/communes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      commune_name_kh: 'ឃុំថ្មី',
      commune_name_en: 'New Commune',
      commune_code: 10101,
      district_code: 101,
      province_id: 1
    })
  })
  return await response.json()
}
```

## 4. Villages API

### GET /api/villages
Get villages with filtering and pagination.

```javascript
// Get all villages
const response = await fetch('/api/villages')

// With pagination
const response = await fetch('/api/villages?limit=50&offset=0')

// Filter by commune
const response = await fetch('/api/villages?commune_code=1010101')

// Multiple filters
const response = await fetch('/api/villages?commune_code=1010101&district_code=101&province_id=1&limit=20&offset=40')
```

### POST /api/villages
Create a new village.

```javascript
const createVillage = async (villageData) => {
  const response = await fetch('/api/villages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      village_name_kh: 'ភូមិថ្មី',
      village_name_en: 'New Village',
      village_code: 123456, // Optional
      commune_code: 1010101,
      district_code: 101, // Optional
      province_id: 1 // Optional
    })
  })
  return await response.json()
}
```

## 5. Schools API

### GET /api/schools
Get schools with search and filtering.

```javascript
// Get all schools
const response = await fetch('/api/schools')

// With pagination
const response = await fetch('/api/schools?limit=50&offset=0')

// Filter by status
const response = await fetch('/api/schools?status=active')

// Search by name or code
const response = await fetch('/api/schools?search=primary')

// Combined filters
const response = await fetch('/api/schools?status=active&search=primary&limit=20')
```

## Complete Frontend Integration Examples

### React/TypeScript Example

```typescript
import { useState, useEffect } from 'react'

interface Province {
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

// API Service Class
class GeographicAPI {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  // Generic HTTP methods
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // Province methods
  async getProvinces(): Promise<Province[]> {
    const { data } = await this.request('/api/provinces')
    return data
  }

  async createProvince(province: Omit<Province, 'id' | '_count'>) {
    return await this.request('/api/provinces', {
      method: 'POST',
      body: JSON.stringify(province),
    })
  }

  async updateProvince(id: number, updates: Partial<Province>) {
    return await this.request(`/api/provinces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteProvince(id: number) {
    return await this.request(`/api/provinces/${id}`, {
      method: 'DELETE',
    })
  }

  // District methods
  async getDistricts(provinceCode?: number) {
    const query = provinceCode ? `?province_code=${provinceCode}` : ''
    const { data } = await this.request(`/api/districts${query}`)
    return data
  }

  // Add similar methods for communes, villages, schools...
}

// React Component Example
export const ProvinceManager = () => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(true)
  const api = new GeographicAPI()

  useEffect(() => {
    loadProvinces()
  }, [])

  const loadProvinces = async () => {
    try {
      const data = await api.getProvinces()
      setProvinces(data)
    } catch (error) {
      console.error('Error loading provinces:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (newProvince: Omit<Province, 'id'>) => {
    try {
      await api.createProvince(newProvince)
      await loadProvinces() // Refresh list
    } catch (error) {
      console.error('Error creating province:', error)
    }
  }

  const handleUpdate = async (id: number, updates: Partial<Province>) => {
    try {
      await api.updateProvince(id, updates)
      await loadProvinces() // Refresh list
    } catch (error) {
      console.error('Error updating province:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProvince(id)
      await loadProvinces() // Refresh list
    } catch (error) {
      console.error('Error deleting province:', error)
    }
  }

  if (loading) return <div>Loading provinces...</div>

  return (
    <div>
      <h2>Provinces</h2>
      {provinces.map(province => (
        <div key={province.id}>
          <h3>{province.province_name_en} / {province.province_name_kh}</h3>
          <p>Code: {province.province_code}</p>
          {province._count && (
            <p>
              Districts: {province._count.districts},
              Communes: {province._count.communes},
              Villages: {province._count.villages}
            </p>
          )}
          <button onClick={() => handleDelete(province.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

### Vue.js Example

```vue
<template>
  <div>
    <h2>Geographic Manager</h2>

    <!-- Province Selector -->
    <select v-model="selectedProvince" @change="loadDistricts">
      <option value="">Select Province</option>
      <option v-for="province in provinces" :key="province.id" :value="province.province_code">
        {{ province.province_name_en }}
      </option>
    </select>

    <!-- District Selector -->
    <select v-model="selectedDistrict" @change="loadCommunes" :disabled="!selectedProvince">
      <option value="">Select District</option>
      <option v-for="district in districts" :key="district.id" :value="district.district_code">
        {{ district.district_name_en }}
      </option>
    </select>

    <!-- Commune Selector -->
    <select v-model="selectedCommune" @change="loadVillages" :disabled="!selectedDistrict">
      <option value="">Select Commune</option>
      <option v-for="commune in communes" :key="commune.id" :value="commune.commune_code">
        {{ commune.commune_name_en }}
      </option>
    </select>

    <!-- Villages List -->
    <div v-if="villages.length > 0">
      <h3>Villages</h3>
      <ul>
        <li v-for="village in villages" :key="village.id">
          {{ village.village_name_en }} / {{ village.village_name_kh }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      provinces: [],
      districts: [],
      communes: [],
      villages: [],
      selectedProvince: '',
      selectedDistrict: '',
      selectedCommune: ''
    }
  },

  async mounted() {
    await this.loadProvinces()
  },

  methods: {
    async loadProvinces() {
      try {
        const response = await fetch('/api/provinces')
        const { data } = await response.json()
        this.provinces = data
      } catch (error) {
        console.error('Error loading provinces:', error)
      }
    },

    async loadDistricts() {
      if (!this.selectedProvince) return

      try {
        const response = await fetch(`/api/districts?province_code=${this.selectedProvince}`)
        const { data } = await response.json()
        this.districts = data
        this.communes = []
        this.villages = []
        this.selectedDistrict = ''
        this.selectedCommune = ''
      } catch (error) {
        console.error('Error loading districts:', error)
      }
    },

    async loadCommunes() {
      if (!this.selectedDistrict) return

      try {
        const response = await fetch(`/api/communes?district_code=${this.selectedDistrict}`)
        const { data } = await response.json()
        this.communes = data
        this.villages = []
        this.selectedCommune = ''
      } catch (error) {
        console.error('Error loading communes:', error)
      }
    },

    async loadVillages() {
      if (!this.selectedCommune) return

      try {
        const response = await fetch(`/api/villages?commune_code=${this.selectedCommune}`)
        const { data } = await response.json()
        this.villages = data
      } catch (error) {
        console.error('Error loading villages:', error)
      }
    }
  }
}
</script>
```

### JavaScript/Vanilla Example

```javascript
// Geographic API Client
class GeographicAPIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // CRUD operations for all entities
  async get(entity, params = {}) {
    const query = new URLSearchParams(params).toString()
    const url = `/api/${entity}${query ? `?${query}` : ''}`
    const { data } = await this.request(url)
    return data
  }

  async create(entity, data) {
    return await this.request(`/api/${entity}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(entity, id, data) {
    return await this.request(`/api/${entity}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(entity, id) {
    return await this.request(`/api/${entity}/${id}`, {
      method: 'DELETE',
    })
  }
}

// Usage Example
const api = new GeographicAPIClient()

// Get all provinces
const provinces = await api.get('provinces')

// Get districts by province
const districts = await api.get('districts', { province_code: 1 })

// Create new village
const newVillage = await api.create('villages', {
  village_name_kh: 'ភូមិថ្មី',
  village_name_en: 'New Village',
  commune_code: 1010101
})

// Update province
const updatedProvince = await api.update('provinces', 1, {
  province_name_en: 'Updated Province Name'
})

// Delete district
const result = await api.delete('districts', 123)
```

## Error Handling

Always implement proper error handling:

```javascript
const handleAPICall = async () => {
  try {
    const response = await fetch('/api/provinces')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.data
  } catch (error) {
    console.error('API call failed:', error)
    // Handle error appropriately in your app
    throw error
  }
}
```

## Rate Limiting & Best Practices

1. **Batch Operations**: When possible, implement client-side caching to reduce API calls
2. **Pagination**: Use limit/offset parameters for large datasets (villages, schools)
3. **Search Debouncing**: Debounce search inputs to avoid excessive API calls
4. **Error Handling**: Always handle both network and API errors
5. **Loading States**: Implement loading indicators for better UX

## Testing

Test your integration with tools like:

```bash
# Using curl
curl -X GET "https://geoapi.openplp.com/api/provinces"

curl -X POST "https://geoapi.openplp.com/api/provinces" \
  -H "Content-Type: application/json" \
  -d '{"province_name_kh": "ខេត្តថ្មី", "province_name_en": "New Province", "province_code": 26}'

# Using httpie
http GET localhost:3000/api/districts province_code==1

http POST localhost:3000/api/villages \
  village_name_kh="ភូមិថ្មី" \
  village_name_en="New Village" \
  commune_code:=1010101
```

This comprehensive guide should enable any frontend developer to fully integrate with your Geographic API for complete CRUD operations.