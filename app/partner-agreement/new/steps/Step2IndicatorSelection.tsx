'use client'

import { useState, useEffect } from 'react'

interface Indicator {
  id: number
  indicator_code: string
  indicator_number: number
  indicator_name_km: string
  indicator_name_en: string
  target_percentage: number
  baseline_percentage: number
  is_reduction_target: boolean
  implementation_start: string
  implementation_end: string
  calculation_rules: any[]
  description_km: string
  description_en: string
}

interface IndicatorFormData {
  indicator_id: number
  indicator_code: string
  justification_km?: string
  justification_en?: string
  baseline_percentage: number
  baseline_source: string
  baseline_date: string
  target_percentage: number
  target_date: string
  use_custom_target: boolean
  custom_target_justification?: string
}

interface Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step2IndicatorSelection({ formData, updateFormData }: Props) {
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [selectedIndicators, setSelectedIndicators] = useState<IndicatorFormData[]>(
    formData.selected_indicators || []
  )
  const [loading, setLoading] = useState(true)
  const [currentIndicator, setCurrentIndicator] = useState<IndicatorFormData | null>(null)
  const [calculatedTarget, setCalculatedTarget] = useState<number | null>(null)
  const [calculationExplanation, setCalculationExplanation] = useState<string>('')

  useEffect(() => {
    fetchIndicators()
  }, [])

  useEffect(() => {
    updateFormData({ selected_indicators: selectedIndicators })
  }, [selectedIndicators])

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/indicators')
      const result = await response.json()
      if (result.success) {
        setIndicators(result.data)
      }
    } catch (error) {
      console.error('Error fetching indicators:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTarget = async (indicator_id: number, baseline: number) => {
    try {
      const indicator = indicators.find(ind => ind.id === indicator_id)
      if (!indicator) return

      const response = await fetch('/api/indicators/calculate-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicator_code: indicator.indicator_code,
          partner_baseline: baseline
        })
      })

      const result = await response.json()
      if (result.success) {
        setCalculatedTarget(result.data.calculated_target)
        setCalculationExplanation(result.data.explanation_km)
        return result.data.calculated_target
      }
    } catch (error) {
      console.error('Error calculating target:', error)
    }
    return null
  }

  const handleIndicatorSelect = (indicator: Indicator) => {
    // Check if already selected (UNIQUE CONSTRAINT)
    const alreadySelected = selectedIndicators.some(si => si.indicator_id === indicator.id)
    if (alreadySelected) {
      alert('សូចនាករនេះត្រូវបានជ្រើសរើសរួចហើយ! / This indicator is already selected!')
      return
    }

    // Check maximum 5 indicators
    if (selectedIndicators.length >= 5) {
      alert('អ្នកអាចជ្រើសរើសបានតែ ៥ សូចនាករប៉ុណ្ណោះ! / You can only select up to 5 indicators!')
      return
    }

    // Initialize new indicator form
    setCurrentIndicator({
      indicator_id: indicator.id,
      indicator_code: indicator.indicator_code,
      baseline_percentage: indicator.baseline_percentage,
      baseline_source: '',
      baseline_date: new Date().toISOString().split('T')[0],
      target_percentage: indicator.target_percentage,
      target_date: '',
      use_custom_target: false
    })
  }

  const handleBaselineChange = async (baseline: number) => {
    if (!currentIndicator) return

    const target = await calculateTarget(currentIndicator.indicator_id, baseline)
    setCurrentIndicator({
      ...currentIndicator,
      baseline_percentage: baseline,
      target_percentage: target || currentIndicator.target_percentage
    })
  }

  const handleSaveIndicator = () => {
    if (!currentIndicator) return

    // Validation
    if (!currentIndicator.baseline_source || !currentIndicator.target_date) {
      alert('សូមបំពេញព័ត៌មានទាំងអស់! / Please fill all required fields!')
      return
    }

    setSelectedIndicators([...selectedIndicators, currentIndicator])
    setCurrentIndicator(null)
    setCalculatedTarget(null)
    setCalculationExplanation('')
  }

  const handleRemoveIndicator = (indicator_code: string) => {
    setSelectedIndicators(selectedIndicators.filter(si => si.indicator_code !== indicator_code))
  }

  const getIndicatorDisplay = (indicator_code: string) => {
    const indicator = indicators.find(ind => ind.indicator_code === indicator_code)
    return indicator ? indicator.indicator_name_km : indicator_code
  }

  if (loading) {
    return <div className="text-center py-8">Loading indicators...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-khmer mb-2">ជ្រើសរើសសូចនាករសមិទ្ធកម្ម</h2>
        <p className="text-gray-600">Select Performance Indicators (1-5 indicators, each unique)</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800 font-khmer">
            ⚠️ សំខាន់: សូចនាករមួយអាចជ្រើសរើសបានតែម្តងប៉ុណ្ណោះ!
          </p>
          <p className="text-xs text-blue-600">IMPORTANT: Each indicator can only be selected ONCE</p>
        </div>
      </div>

      {/* Selected Indicators Summary */}
      {selectedIndicators.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold font-khmer text-green-800 mb-3">
            សូចនាករដែលបានជ្រើសរើស ({selectedIndicators.length}/5)
          </h3>
          <div className="space-y-2">
            {selectedIndicators.map((si, index) => (
              <div key={si.indicator_code} className="flex items-center justify-between bg-white p-3 rounded">
                <div className="flex-1">
                  <p className="font-medium font-khmer">{index + 1}. {getIndicatorDisplay(si.indicator_code)}</p>
                  <p className="text-sm text-gray-600">
                    មូលដ្ឋាន: {si.baseline_percentage}% → គោលដៅ: {si.target_percentage}%
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveIndicator(si.indicator_code)}
                  className="ml-4 text-red-600 hover:text-red-800 font-medium"
                >
                  លុបចោល
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicator Selection */}
      {!currentIndicator && (
        <div>
          <h3 className="font-bold font-khmer mb-4">ជ្រើសរើសសូចនាករថ្មី</h3>
          <div className="grid gap-4">
            {indicators.map((indicator) => {
              const isSelected = selectedIndicators.some(si => si.indicator_id === indicator.id)
              return (
                <div
                  key={indicator.id}
                  className={`border rounded-lg p-4 ${isSelected ? 'bg-gray-100 border-gray-400' : 'border-gray-200 hover:border-blue-400 cursor-pointer'}`}
                  onClick={() => !isSelected && handleIndicatorSelect(indicator)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold font-khmer text-lg">
                        {indicator.indicator_number}. {indicator.indicator_name_km}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{indicator.indicator_name_en}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-gray-700">មូលដ្ឋាន: {indicator.baseline_percentage}%</span>
                        <span className="text-blue-700 font-medium">គោលដៅ: {indicator.target_percentage}%</span>
                        <span className="text-gray-500">
                          {indicator.implementation_start} - {indicator.implementation_end}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        ✓ បានជ្រើសរើស
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Indicator Form Modal */}
      {currentIndicator && (
        <div className="border border-blue-300 rounded-lg p-6 bg-blue-50">
          <h3 className="font-bold font-khmer text-xl mb-4">
            បំពេញព័ត៌មានសូចនាករ: {getIndicatorDisplay(currentIndicator.indicator_code)}
          </h3>

          <div className="space-y-4">
            {/* Baseline Input */}
            <div>
              <label className="block font-khmer font-medium mb-2">
                ទិន្នន័យមូលដ្ឋានរបស់អ្នក (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={currentIndicator.baseline_percentage}
                onChange={(e) => handleBaselineChange(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Baseline Source */}
            <div>
              <label className="block font-khmer font-medium mb-2">
                ប្រភពទិន្នន័យមូលដ្ឋាន *
              </label>
              <input
                type="text"
                value={currentIndicator.baseline_source}
                onChange={(e) => setCurrentIndicator({ ...currentIndicator, baseline_source: e.target.value })}
                placeholder="ឧទាហរណ៍: របាយការណ៍ឆ្នាំ 2024-2025"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Calculated Target */}
            {calculatedTarget !== null && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <p className="font-bold text-green-800 font-khmer">គោលដៅស្វ័យប្រវត្តិ: {calculatedTarget}%</p>
                <p className="text-sm text-green-700 mt-1">{calculationExplanation}</p>
              </div>
            )}

            {/* Target Date */}
            <div>
              <label className="block font-khmer font-medium mb-2">
                កាលបរិច្ឆេទគោលដៅ *
              </label>
              <input
                type="date"
                value={currentIndicator.target_date}
                onChange={(e) => setCurrentIndicator({ ...currentIndicator, target_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Justification */}
            <div>
              <label className="block font-khmer font-medium mb-2">
                មូលហេតុនៃការជ្រើសរើស
              </label>
              <textarea
                value={currentIndicator.justification_km || ''}
                onChange={(e) => setCurrentIndicator({ ...currentIndicator, justification_km: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg font-khmer"
                placeholder="ពន្យល់ហេតុផលដែលអ្នកជ្រើសរើសសូចនាករនេះ..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveIndicator}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                រក្សាទុក / Save
              </button>
              <button
                onClick={() => {
                  setCurrentIndicator(null)
                  setCalculatedTarget(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                បោះបង់ / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning if no indicators selected */}
      {selectedIndicators.length === 0 && !currentIndicator && (
        <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-khmer">
            ⚠️ សូមជ្រើសរើសយ៉ាងហោចណាស់ ១ សូចនាករ
          </p>
          <p className="text-sm text-yellow-600">Please select at least 1 indicator</p>
        </div>
      )}
    </div>
  )
}
