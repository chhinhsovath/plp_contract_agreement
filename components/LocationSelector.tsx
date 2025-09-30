'use client'

import React, { useState, useEffect } from 'react'
import { Select, Spin } from 'antd'
import { fetchProvinces, fetchDistricts, fetchCommunes, fetchVillages } from '@/lib/geoApi'
import type { Province, District, Commune, Village } from '@/lib/geoApi'

const { Option } = Select

interface LocationSelectorProps {
  onLocationChange?: (location: {
    province?: Province
    district?: District
    commune?: Commune
    village?: Village
  }) => void
  defaultValues?: {
    provinceCode?: number
    districtCode?: number
    communeCode?: number
    villageCode?: number
  }
  required?: {
    province?: boolean
    district?: boolean
    commune?: boolean
    village?: boolean
  }
}

export default function LocationSelector({
  onLocationChange,
  defaultValues,
  required = { province: true, district: true, commune: false, village: false }
}: LocationSelectorProps) {
  // State for selected values
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null)
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null)

  // State for dropdown options
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [villages, setVillages] = useState<Village[]>([])

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    const data = await fetchProvinces()
    setProvinces(data)
    setLoadingProvinces(false)
  }

  // Handle province change
  const handleProvinceChange = async (value: number) => {
    const province = provinces.find(p => p.province_code === value)
    if (province) {
      setSelectedProvince(province)
      setSelectedDistrict(null)
      setSelectedCommune(null)
      setSelectedVillage(null)

      // Reset dependent dropdowns
      setDistricts([])
      setCommunes([])
      setVillages([])

      // Load districts for this province
      setLoadingDistricts(true)
      const districtData = await fetchDistricts(value)
      setDistricts(districtData)
      setLoadingDistricts(false)

      // Notify parent
      if (onLocationChange) {
        onLocationChange({ province })
      }
    }
  }

  // Handle district change
  const handleDistrictChange = async (value: number) => {
    const district = districts.find(d => d.district_code === value)
    if (district) {
      setSelectedDistrict(district)
      setSelectedCommune(null)
      setSelectedVillage(null)

      // Reset dependent dropdowns
      setCommunes([])
      setVillages([])

      // Load communes for this district
      setLoadingCommunes(true)
      const communeData = await fetchCommunes(value)
      setCommunes(communeData)
      setLoadingCommunes(false)

      // Notify parent
      if (onLocationChange) {
        onLocationChange({
          province: selectedProvince!,
          district
        })
      }
    }
  }

  // Handle commune change
  const handleCommuneChange = async (value: number) => {
    const commune = communes.find(c => c.commune_code === value)
    if (commune) {
      setSelectedCommune(commune)
      setSelectedVillage(null)

      // Reset dependent dropdown
      setVillages([])

      // Load villages for this commune
      setLoadingVillages(true)
      const villageData = await fetchVillages(value)
      setVillages(villageData)
      setLoadingVillages(false)

      // Notify parent
      if (onLocationChange) {
        onLocationChange({
          province: selectedProvince!,
          district: selectedDistrict!,
          commune
        })
      }
    }
  }

  // Handle village change
  const handleVillageChange = (value: number) => {
    const village = villages.find(v => v.id === value)
    if (village) {
      setSelectedVillage(village)

      // Notify parent with complete location
      if (onLocationChange) {
        onLocationChange({
          province: selectedProvince!,
          district: selectedDistrict!,
          commune: selectedCommune!,
          village
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Province Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-hanuman">
          ខេត្ត/រាជធានី {required.province && <span className="text-red-500">*</span>}
        </label>
        <Select
          showSearch
          placeholder="ជ្រើសរើសខេត្ត/រាជធានី"
          className="w-full"
          loading={loadingProvinces}
          value={selectedProvince?.province_code}
          onChange={handleProvinceChange}
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={loadingProvinces ? <Spin size="small" /> : null}
        >
          {provinces.map((province) => (
            <Option key={province.province_code} value={province.province_code}>
              {province.province_name_kh} ({province.province_name_en})
            </Option>
          ))}
        </Select>
      </div>

      {/* District Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-hanuman">
          ស្រុក/ខណ្ឌ {required.district && <span className="text-red-500">*</span>}
        </label>
        <Select
          showSearch
          placeholder="ជ្រើសរើសស្រុក/ខណ្ឌ"
          className="w-full"
          loading={loadingDistricts}
          disabled={!selectedProvince}
          value={selectedDistrict?.district_code}
          onChange={handleDistrictChange}
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={loadingDistricts ? <Spin size="small" /> : null}
        >
          {districts.map((district) => (
            <Option key={district.district_code} value={district.district_code}>
              {district.district_name_kh} ({district.district_name_en})
            </Option>
          ))}
        </Select>
      </div>

      {/* Commune Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-hanuman">
          ឃុំ/សង្កាត់ {required.commune && <span className="text-red-500">*</span>}
        </label>
        <Select
          showSearch
          placeholder="ជ្រើសរើសឃុំ/សង្កាត់"
          className="w-full"
          loading={loadingCommunes}
          disabled={!selectedDistrict}
          value={selectedCommune?.commune_code}
          onChange={handleCommuneChange}
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={loadingCommunes ? <Spin size="small" /> : null}
        >
          {communes.map((commune) => (
            <Option key={commune.commune_code} value={commune.commune_code}>
              {commune.commune_name_kh} ({commune.commune_name_en})
            </Option>
          ))}
        </Select>
      </div>

      {/* Village Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-hanuman">
          ភូមិ {required.village && <span className="text-red-500">*</span>}
        </label>
        <Select
          showSearch
          placeholder="ជ្រើសរើសភូមិ"
          className="w-full"
          loading={loadingVillages}
          disabled={!selectedCommune}
          value={selectedVillage?.id}
          onChange={handleVillageChange}
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={loadingVillages ? <Spin size="small" /> : null}
        >
          {villages.map((village) => (
            <Option key={village.id} value={village.id}>
              {village.village_name_kh} ({village.village_name_en})
            </Option>
          ))}
        </Select>
      </div>
    </div>
  )
}