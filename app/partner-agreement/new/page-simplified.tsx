'use client'

import { useState } from 'react'
import Step1PartnerInfo from './steps-simple/Step1PartnerInfo'
import Step2IndicatorRules from './steps-simple/Step2IndicatorRules'
import Step3BudgetBank from './steps-simple/Step3BudgetBank'
import Step4Signatures from './steps-simple/Step4Signatures'

interface IndicatorRule {
  indicator_id: number
  indicator_number: number
  indicator_name_km: string
  indicator_name_en: string
  selected_rule: 1 | 2 | 3 | null // Which of the 3 calculation rules
  baseline_percentage: number
  target_percentage: number
  implementation_period: string
}

interface FormData {
  // Step 1: Partner Info
  partner_name_km: string
  partner_name_en: string
  partner_type: string
  location: string
  contact_person_name: string
  contact_person_position: string
  contact_person_phone: string

  // Step 2: 5 Fixed Indicators with selected rules
  indicators: IndicatorRule[]

  // Step 3: Budget & Bank
  total_budget: number
  bank_account_name: string
  bank_account_number: string

  // Step 4: Signatures
  party_a_signature: string
  party_b_signature: string
  signature_date: string
}

export default function SimplifiedPartnerAgreementForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    partner_name_km: '',
    partner_name_en: '',
    partner_type: 'education_office',
    location: '',
    contact_person_name: '',
    contact_person_position: '',
    contact_person_phone: '',
    indicators: [],
    total_budget: 0,
    bank_account_name: '',
    bank_account_number: '',
    party_a_signature: '',
    party_b_signature: '',
    signature_date: new Date().toISOString().split('T')[0]
  })

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    try {
      // Create contract
      const contractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_type_id: 4, // Agreement Type 4
          party_a_name: 'នាយកដ្ឋានបឋមសិក្សា',
          party_a_position: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
          party_b_name: formData.partner_name_km,
          party_b_position: formData.contact_person_position,
          location: formData.location,
          start_date: '2025-10-01',
          end_date: '2026-06-30',
          status: 'draft'
        })
      })

      const contractData = await contractResponse.json()

      if (!contractData.success) {
        throw new Error(contractData.message || 'Failed to create contract')
      }

      const contract_id = contractData.data.id

      // Add all 5 indicators with their selected rules
      for (const indicator of formData.indicators) {
        await fetch(`/api/contracts/${contract_id}/indicators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            indicator_id: indicator.indicator_id,
            baseline_percentage: indicator.baseline_percentage,
            target_percentage: indicator.target_percentage,
            baseline_date: '2024-09-30',
            target_date: '2026-03-31',
            selected_rule: indicator.selected_rule
          })
        })
      }

      // Success
      alert('កិច្ចព្រមព្រៀងត្រូវបានបង្កើតដោយជោគជ័យ! / Contract created successfully!')
      window.location.href = '/contracts'

    } catch (error: any) {
      console.error('Error creating contract:', error)
      alert('បរាជ័យក្នុងការបង្កើតកិច្ចព្រមព្រៀង / Failed to create contract: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-khmer">
            កិច្ចព្រមព្រៀងសមិទ្ធកម្ម
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Performance Agreement - Agreement Type 4 (Education Office)
          </p>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-between">
            {[
              { num: 1, label: 'ព័ត៌មានភាគី / Partner Info' },
              { num: 2, label: 'សូចនាករ / Indicators' },
              { num: 3, label: 'ថវិកា / Budget' },
              { num: 4, label: 'ហត្ថលេខា / Signatures' }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center ${index > 0 ? 'ml-2' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === step.num
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.num
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-8 md:w-16 h-1 mx-2 ${
                    currentStep > step.num ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 && (
            <Step1PartnerInfo
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <Step2IndicatorRules
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <Step3BudgetBank
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <Step4Signatures
              formData={formData}
              updateFormData={updateFormData}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
