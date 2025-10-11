'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Step components
import Step1PartnerInfo from './steps/Step1PartnerInfo'
import Step2IndicatorSelection from './steps/Step2IndicatorSelection'
import Step3ActivitiesPlanning from './steps/Step3ActivitiesPlanning'
import Step4Deliverables from './steps/Step4Deliverables'
import Step5TermsConditions from './steps/Step5TermsConditions'
import Step6Signatures from './steps/Step6Signatures'

interface FormData {
  // Step 1: Partner Information
  partner_name_km: string
  partner_name_en: string
  partner_type: string
  province: string
  district_city: string
  contact_name: string
  contact_position: string
  contact_phone: string
  contact_email?: string
  total_schools: number
  total_students: number
  total_teachers: number

  // Step 2: Indicator Selection
  selected_indicators: Array<{
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
  }>

  // Step 3: Activities
  activities: Array<{
    milestone_index: number
    activity_name_km: string
    activity_name_en?: string
    activity_description: string
    responsible_person: string
    start_date: string
    end_date: string
    budget?: number
  }>

  // Step 4: Deliverables
  deliverables: Array<{
    milestone_index: number
    deliverable_name_km: string
    deliverable_name_en?: string
    deliverable_type: string
    due_date: string
    description: string
  }>

  // Step 5: Terms & Conditions
  contract_start_date: string
  contract_end_date: string
  reporting_frequency: string
  monitoring_visits: number
  agree_to_terms: boolean

  // Step 6: Signatures
  partner_representative_name: string
  partner_representative_position: string
  signature_date: string
  partner_signature: string
}

export default function NewPartnerAgreementPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    partner_name_km: '',
    partner_name_en: '',
    partner_type: '',
    province: '',
    district_city: '',
    contact_name: '',
    contact_position: '',
    contact_phone: '',
    total_schools: 0,
    total_students: 0,
    total_teachers: 0,
    selected_indicators: [],
    activities: [],
    deliverables: [],
    contract_start_date: '',
    contract_end_date: '',
    reporting_frequency: 'quarterly',
    monitoring_visits: 4,
    agree_to_terms: false,
    partner_representative_name: '',
    partner_representative_position: '',
    signature_date: new Date().toISOString().split('T')[0],
    partner_signature: ''
  })

  const steps = [
    { number: 1, title_km: 'ព័ត៌មានភាគីដៃគូ', title_en: 'Partner Information' },
    { number: 2, title_km: 'ជ្រើសរើសសូចនាករ', title_en: 'Select Indicators' },
    { number: 3, title_km: 'រៀបចំសកម្មភាព', title_en: 'Activities Planning' },
    { number: 4, title_km: 'កំណត់លទ្ធផល', title_en: 'Deliverables' },
    { number: 5, title_km: 'លក្ខខណ្ឌ', title_en: 'Terms & Conditions' },
    { number: 6, title_km: 'ហត្ថលេខា', title_en: 'Signatures' }
  ]

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Create contract first
      const contractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_type_id: formData.partner_type === 'school' ? 5 : 4,
          party_a_name: 'នាយកដ្ឋានបឋមសិក្សា',
          party_a_position: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
          party_b_name: formData.partner_name_km,
          party_b_position: formData.partner_representative_position,
          party_b_organization: formData.partner_name_en,
          start_date: formData.contract_start_date,
          end_date: formData.contract_end_date,
          location: `${formData.province}, ${formData.district_city}`,
          additional_data: {
            contact: {
              name: formData.contact_name,
              position: formData.contact_position,
              phone: formData.contact_phone,
              email: formData.contact_email
            },
            organization_details: {
              total_schools: formData.total_schools,
              total_students: formData.total_students,
              total_teachers: formData.total_teachers
            },
            reporting_frequency: formData.reporting_frequency,
            monitoring_visits: formData.monitoring_visits
          }
        })
      })

      const contractResult = await contractResponse.json()
      if (!contractResult.success) throw new Error(contractResult.message)

      const contract_id = contractResult.data.id

      // Add selected indicators
      for (const indicator of formData.selected_indicators) {
        await fetch(`/api/contracts/${contract_id}/indicators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            indicator_id: indicator.indicator_id,
            baseline_percentage: indicator.baseline_percentage,
            baseline_source: indicator.baseline_source,
            baseline_date: indicator.baseline_date,
            target_percentage: indicator.target_percentage,
            target_date: indicator.target_date,
            use_custom_target: indicator.use_custom_target,
            custom_target_justification: indicator.custom_target_justification,
            justification_km: indicator.justification_km,
            justification_en: indicator.justification_en
          })
        })
      }

      alert('កិច្ចព្រមព្រៀងត្រូវបានបង្កើតដោយជោគជ័យ! / Contract created successfully!')
      router.push(`/contract/${contract_id}`)
    } catch (error: any) {
      alert('កំហុស: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-khmer">
            កិច្ចព្រមព្រៀងសមិទ្ធកម្មភាគីដៃគូអប់រំ
          </h1>
          <p className="text-gray-600 mt-2">Education Partner Performance Agreement</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${currentStep === step.number ? 'bg-blue-600 text-white' :
                      currentStep > step.number ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {step.number}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-khmer font-medium">{step.title_km}</div>
                    <div className="text-xs text-gray-500">{step.title_en}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 mx-4 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {currentStep === 1 && (
            <Step1PartnerInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <Step2IndicatorSelection formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <Step3ActivitiesPlanning formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <Step4Deliverables formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <Step5TermsConditions formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 6 && (
            <Step6Signatures formData={formData} updateFormData={updateFormData} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            ← ថយក្រោយ / Previous
          </button>

          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              បន្ទាប់ / Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              ដាក់ស្នើ / Submit Agreement
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
