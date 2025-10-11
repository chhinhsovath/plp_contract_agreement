'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

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
  partner_name_km: string
  partner_name_en: string
  partner_type: string
  location: string
  contact_person_name: string
  contact_person_position: string
  contact_person_phone: string
  indicators: IndicatorRule[]
  total_budget: number
  bank_account_name: string
  bank_account_number: string
  party_a_signature: string
  party_b_signature: string
  signature_date: string
}

interface Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  onPrevious: () => void
  onSubmit: () => void
}

export default function Step4Signatures({ formData, updateFormData, onPrevious, onSubmit }: Props) {
  const partyASignRef = useRef<SignatureCanvas>(null)
  const partyBSignRef = useRef<SignatureCanvas>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearSignature = (party: 'A' | 'B') => {
    if (party === 'A') {
      partyASignRef.current?.clear()
      updateFormData({ party_a_signature: '' })
    } else {
      partyBSignRef.current?.clear()
      updateFormData({ party_b_signature: '' })
    }
  }

  const saveSignature = (party: 'A' | 'B') => {
    if (party === 'A' && partyASignRef.current) {
      const signatureData = partyASignRef.current.toDataURL()
      updateFormData({ party_a_signature: signatureData })
    } else if (party === 'B' && partyBSignRef.current) {
      const signatureData = partyBSignRef.current.toDataURL()
      updateFormData({ party_b_signature: signatureData })
    }
  }

  const handleSubmit = async () => {
    // Save signatures before validation
    if (partyASignRef.current && !formData.party_a_signature) {
      saveSignature('A')
    }
    if (partyBSignRef.current && !formData.party_b_signature) {
      saveSignature('B')
    }

    // Validation
    if (!formData.party_a_signature || partyASignRef.current?.isEmpty()) {
      alert('សូមចុះហត្ថលេខាភាគី A / Please sign for Party A')
      return
    }
    if (!formData.party_b_signature || partyBSignRef.current?.isEmpty()) {
      alert('សូមចុះហត្ថលេខាភាគី B / Please sign for Party B')
      return
    }

    setIsSubmitting(true)
    await onSubmit()
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 font-khmer">
        ពិនិត្យ និងចុះហត្ថលេខា / Review & Signatures
      </h2>

      {/* Review Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 font-khmer">សង្ខេបព័ត៌មាន / Summary</h3>

        {/* Partner Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 font-khmer">ភាគីដៃគូ:</span>
            <p className="font-semibold font-khmer">{formData.partner_name_km}</p>
          </div>
          <div>
            <span className="text-gray-600 font-khmer">ទីតាំង:</span>
            <p className="font-semibold font-khmer">{formData.location}</p>
          </div>
          <div>
            <span className="text-gray-600 font-khmer">អ្នកទំនាក់ទំនង:</span>
            <p className="font-semibold font-khmer">{formData.contact_person_name}</p>
          </div>
          <div>
            <span className="text-gray-600 font-khmer">ថវិកា:</span>
            <p className="font-semibold">${formData.total_budget?.toLocaleString()}</p>
          </div>
        </div>

        {/* Selected Indicators */}
        <div>
          <span className="text-gray-600 font-khmer">សូចនាករដែលបានជ្រើសរើស:</span>
          <ul className="mt-2 space-y-1 text-sm">
            {formData.indicators.map((ind) => (
              <li key={ind.indicator_id} className="font-khmer">
                • សមិទ្ធកម្មទី {ind.indicator_number}: {ind.indicator_name_km} -
                <span className="font-semibold"> សូចនាករទី {ind.selected_rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Signature Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          កាលបរិច្ឆេទចុះហត្ថលេខា / Signature Date
        </label>
        <input
          type="date"
          value={formData.signature_date}
          onChange={(e) => updateFormData({ signature_date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Party A Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ហត្ថលេខាភាគី A (នាយកដ្ឋានបឋមសិក្សា) / Party A Signature <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-gray-300 rounded-lg bg-white">
          <SignatureCanvas
            ref={partyASignRef}
            canvasProps={{
              className: 'w-full h-40 cursor-crosshair'
            }}
            onEnd={() => saveSignature('A')}
          />
        </div>
        <button
          onClick={() => clearSignature('A')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-khmer"
        >
          សម្អាត / Clear
        </button>
      </div>

      {/* Party B Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ហត្ថលេខាភាគី B ({formData.partner_name_km}) / Party B Signature <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-gray-300 rounded-lg bg-white">
          <SignatureCanvas
            ref={partyBSignRef}
            canvasProps={{
              className: 'w-full h-40 cursor-crosshair'
            }}
            onEnd={() => saveSignature('B')}
          />
        </div>
        <button
          onClick={() => clearSignature('B')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-khmer"
        >
          សម្អាត / Clear
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-khmer disabled:opacity-50"
        >
          ថយក្រោយ / Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-khmer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'កំពុងបង្កើត... / Creating...' : 'បង្កើតកិច្ចព្រមព្រៀង / Create Contract'}
        </button>
      </div>
    </div>
  )
}
