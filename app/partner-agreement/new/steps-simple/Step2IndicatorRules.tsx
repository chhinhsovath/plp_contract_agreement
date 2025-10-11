'use client'

interface IndicatorRule {
  indicator_id: number
  indicator_number: number
  indicator_name_km: string
  indicator_name_en: string
  selected_rule: 1 | 2 | 3 | null
  baseline_percentage: number
  target_percentage: number
  implementation_period: string
}

interface FormData {
  indicators: IndicatorRule[]
}

interface Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  onNext: () => void
  onPrevious: () => void
}

// 5 FIXED Indicators with 3 calculation rules each (from DOCX template)
const FIXED_INDICATORS = [
  {
    indicator_id: 1,
    indicator_number: 1,
    indicator_name_km: 'ភាគរយកុមារចុះឈ្មោះចូលរៀនថ្នាក់ទី១',
    indicator_name_en: 'Grade 1 enrollment rate',
    baseline_percentage: 93.7,
    target_percentage: 95,
    implementation_period: '2025-2026',
    rules: [
      { id: 1, text_km: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៩៣.៧% ត្រូវបង្កើន១.៣%', text_en: 'If baseline < 93.7%, increase by 1.3%' },
      { id: 2, text_km: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៩៣.៧% ត្រូវបង្កើនដល់ ៩៥%', text_en: 'If baseline = 93.7%, increase to 95%' },
      { id: 3, text_km: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩៥% ឬលើសត្រូវរក្សា', text_en: 'If baseline ≥ 95%, maintain level' }
    ]
  },
  {
    indicator_id: 2,
    indicator_number: 2,
    indicator_name_km: 'ភាគរយសាលារៀនមានផ្ទាំងព័ត៌មាន',
    indicator_name_en: 'Schools with information boards',
    baseline_percentage: 36,
    target_percentage: 46,
    implementation_period: '2025-2026',
    rules: [
      { id: 1, text_km: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៣៦% ត្រូវបង្កើន១០%', text_en: 'If baseline < 36%, increase by 10%' },
      { id: 2, text_km: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៣៦% ត្រូវបង្កើនដល់ ៤៦%', text_en: 'If baseline = 36%, increase to 46%' },
      { id: 3, text_km: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៤៦% ឬលើសត្រូវរក្សា', text_en: 'If baseline ≥ 46%, maintain level' }
    ]
  },
  {
    indicator_id: 3,
    indicator_number: 3,
    indicator_name_km: 'ភាគរយសាលារៀនមានគណៈកម្មការគ្រប់គ្រង',
    indicator_name_en: 'Schools with management committees',
    baseline_percentage: 30,
    target_percentage: 50,
    implementation_period: '2025-2026',
    rules: [
      { id: 1, text_km: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៣០% ត្រូវបង្កើន២០%', text_en: 'If baseline < 30%, increase by 20%' },
      { id: 2, text_km: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៣០% ត្រូវបង្កើនដល់ ៥០%', text_en: 'If baseline = 30%, increase to 50%' },
      { id: 3, text_km: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៥០% ឬលើសត្រូវរក្សា', text_en: 'If baseline ≥ 50%, maintain level' }
    ]
  },
  {
    indicator_id: 4,
    indicator_number: 4,
    indicator_name_km: 'ភាគរយសិស្សថ្នាក់ទី៣ទទួលពិន្ទុក្រោមតម្រូវការ (បន្ថយ)',
    indicator_name_en: 'Grade 3 students below baseline (REDUCTION)',
    baseline_percentage: 51,
    target_percentage: 46,
    implementation_period: '2025-2026',
    rules: [
      { id: 1, text_km: 'បើទិន្នន័យមូលដ្ឋាន ខ្ពស់ជាង ៥១% ត្រូវបន្ថយ៥%', text_en: 'If baseline > 51%, reduce by 5%' },
      { id: 2, text_km: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៥១% ត្រូវបន្ថយមក ៤៦%', text_en: 'If baseline = 51%, reduce to 46%' },
      { id: 3, text_km: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៤៦% ឬទាបជាងត្រូវរក្សា', text_en: 'If baseline ≤ 46%, maintain level' }
    ]
  },
  {
    indicator_id: 5,
    indicator_number: 5,
    indicator_name_km: 'ភាគរយសិស្សថ្នាក់ទី៣ទទួលពិន្ទុ A/B/C',
    indicator_name_en: 'Grade 3 students achieving A/B/C',
    baseline_percentage: 28,
    target_percentage: 32,
    implementation_period: '2025-2026',
    rules: [
      { id: 1, text_km: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ២៨% ត្រូវបង្កើន៤%', text_en: 'If baseline < 28%, increase by 4%' },
      { id: 2, text_km: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ២៨% ត្រូវបង្កើនដល់ ៣២%', text_en: 'If baseline = 28%, increase to 32%' },
      { id: 3, text_km: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៣២% ឬលើសត្រូវរក្សា', text_en: 'If baseline ≥ 32%, maintain level' }
    ]
  }
]

export default function Step2IndicatorRules({ formData, updateFormData, onNext, onPrevious }: Props) {
  // Initialize indicators if empty
  if (formData.indicators.length === 0) {
    const initialIndicators = FIXED_INDICATORS.map(ind => ({
      indicator_id: ind.indicator_id,
      indicator_number: ind.indicator_number,
      indicator_name_km: ind.indicator_name_km,
      indicator_name_en: ind.indicator_name_en,
      selected_rule: null,
      baseline_percentage: ind.baseline_percentage,
      target_percentage: ind.target_percentage,
      implementation_period: ind.implementation_period
    }))
    updateFormData({ indicators: initialIndicators })
  }

  const handleRuleSelect = (indicator_id: number, rule_number: 1 | 2 | 3) => {
    const updatedIndicators = formData.indicators.map(ind =>
      ind.indicator_id === indicator_id
        ? { ...ind, selected_rule: rule_number }
        : ind
    )
    updateFormData({ indicators: updatedIndicators })
  }

  const handleNext = () => {
    // Validate all indicators have selected rule
    const allSelected = formData.indicators.every(ind => ind.selected_rule !== null)
    if (!allSelected) {
      alert('សូមជ្រើសរើសសូចនាករសម្រាប់សមិទ្ធកម្មទាំង ៥ / Please select a calculation rule for all 5 indicators')
      return
    }
    onNext()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 font-khmer mb-2">
          សូចនាករគណនា / Calculation Rules
        </h2>
        <p className="text-sm text-gray-600">
          សម្រាប់សមិទ្ធកម្មនីមួយៗ សូមជ្រើសរើសសូចនាករគណនាមួយ (៣ ជម្រើស) / For each indicator, select ONE calculation rule (3 options)
        </p>
      </div>

      {/* Show all 5 fixed indicators */}
      {FIXED_INDICATORS.map((indicator, index) => {
        const currentSelection = formData.indicators.find(i => i.indicator_id === indicator.indicator_id)?.selected_rule

        return (
          <div key={indicator.indicator_id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="font-semibold text-lg text-gray-900 font-khmer mb-4">
              សមិទ្ធកម្មទី {indicator.indicator_number}: {indicator.indicator_name_km}
              <span className="block text-sm text-gray-600 font-normal mt-1">
                {indicator.indicator_name_en}
              </span>
            </h3>

            <div className="space-y-3">
              {indicator.rules.map((rule) => (
                <label
                  key={rule.id}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentSelection === rule.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`indicator_${indicator.indicator_id}`}
                    value={rule.id}
                    checked={currentSelection === rule.id}
                    onChange={() => handleRuleSelect(indicator.indicator_id, rule.id as 1 | 2 | 3)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-khmer text-gray-900">{rule.text_km}</div>
                    <div className="text-sm text-gray-600 mt-1">{rule.text_en}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )
      })}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-khmer"
        >
          ថយក្រោយ / Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-khmer"
        >
          បន្ទាប់ / Next
        </button>
      </div>
    </div>
  )
}
