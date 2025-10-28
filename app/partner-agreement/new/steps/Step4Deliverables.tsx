'use client'

import { useState, useEffect } from 'react'

interface Deliverable {
  indicator_index: number
  deliverable_name_km: string
  deliverable_name_en?: string
  deliverable_type: string
  due_date: string
  description: string
}

interface Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step4Deliverables({ formData, updateFormData }: Props) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(formData.deliverables || [])
  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable | null>(null)

  useEffect(() => {
    updateFormData({ deliverables })
  }, [deliverables])

  const selectedIndicators = formData.selected_indicators || []

  const deliverableTypes = [
    { value: 'report', label_km: 'របាយការណ៍', label_en: 'Report' },
    { value: 'data', label_km: 'ទិន្នន័យ', label_en: 'Data' },
    { value: 'document', label_km: 'ឯកសារ', label_en: 'Document' },
    { value: 'photo_evidence', label_km: 'ភស្តុតាងរូបថត', label_en: 'Photo Evidence' }
  ]

  const handleAddDeliverable = () => {
    if (!currentDeliverable) return

    // Validation
    if (!currentDeliverable.deliverable_name_km || !currentDeliverable.deliverable_type ||
        !currentDeliverable.due_date || !currentDeliverable.description) {
      alert('សូមបំពេញព័ត៌មានទាំងអស់! / Please fill all required fields!')
      return
    }

    setDeliverables([...deliverables, currentDeliverable])
    setCurrentDeliverable(null)
  }

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index))
  }

  const getIndicatorName = (indicator_index: number) => {
    const indicator = selectedIndicators[indicator_index]
    if (!indicator) return ''

    const indicatorNames: any = {
      'IND-001': 'ចុះឈ្មោះសិស្សថ្នាក់ទី១',
      'IND-002': 'បណ្ណព័ត៌មានសាលារៀន',
      'IND-003': 'គណៈកម្មាធិការគ្រប់គ្រង',
      'IND-004': 'សិស្សក្រោមមូលដ្ឋានថយចុះ',
      'IND-005': 'សិស្សទទួលនិទ្ទេស A,B,C'
    }

    return indicatorNames[indicator.indicator_code] || indicator.indicator_code
  }

  const getDeliverablesForIndicator = (indicator_index: number) => {
    return deliverables.filter(d => d.indicator_index === indicator_index)
  }

  const getDeliverableTypeLabel = (type: string) => {
    const typeObj = deliverableTypes.find(t => t.value === type)
    return typeObj?.label_km || type
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-khmer mb-2">កំណត់លទ្ធផលដែលត្រូវប្រគល់</h2>
        <p className="text-gray-600">Define Deliverables (evidence for each indicator)</p>
      </div>

      {selectedIndicators.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">សូមជ្រើសរើសសូចនាករជាមុនសិន / Please select indicators first</p>
        </div>
      ) : (
        <>
          {/* Deliverables Summary by Indicator */}
          <div className="space-y-4">
            <h3 className="font-bold font-khmer text-lg">លទ្ធផលតាមសូចនាករ</h3>

            {selectedIndicators.map((indicator: any, index: number) => {
              const indicatorDeliverables = getDeliverablesForIndicator(index)

              return (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium font-khmer">
                      {index + 1}. {getIndicatorName(index)}
                    </h4>
                    <button
                      onClick={() => {
                        setCurrentDeliverable({
                          indicator_index: index,
                          deliverable_name_km: '',
                          deliverable_type: 'report',
                          due_date: '',
                          description: ''
                        })
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      + បន្ថែមលទ្ធផល
                    </button>
                  </div>

                  {indicatorDeliverables.length === 0 ? (
                    <p className="text-sm text-gray-500">មិនទាន់មានលទ្ធផល / No deliverables yet</p>
                  ) : (
                    <div className="space-y-2">
                      {indicatorDeliverables.map((deliverable, delIndex) => {
                        const globalIndex = deliverables.findIndex(d =>
                          d.indicator_index === index &&
                          d.deliverable_name_km === deliverable.deliverable_name_km
                        )

                        return (
                          <div key={delIndex} className="bg-white p-3 rounded border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium font-khmer">{deliverable.deliverable_name_km}</p>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    {getDeliverableTypeLabel(deliverable.deliverable_type)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  កាលបរិច្ឆេទប្រគល់: {deliverable.due_date}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveDeliverable(globalIndex)}
                                className="ml-3 text-red-600 hover:text-red-800 text-sm"
                              >
                                លុប
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Deliverable Form */}
          {currentDeliverable && (
            <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
              <h3 className="font-bold font-khmer text-xl mb-4">
                បន្ថែមលទ្ធផលសម្រាប់: {getIndicatorName(currentDeliverable.indicator_index)}
              </h3>

              <div className="space-y-4">
                {/* Deliverable Name KM */}
                <div>
                  <label className="block font-khmer font-medium mb-2">ឈ្មោះលទ្ធផល (ខ្មែរ) *</label>
                  <input
                    type="text"
                    value={currentDeliverable.deliverable_name_km}
                    onChange={(e) => setCurrentDeliverable({ ...currentDeliverable, deliverable_name_km: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg font-khmer"
                    placeholder="ឧទាហរណ៍: របាយការណ៍ប្រចាំត្រីមាសទី១"
                  />
                </div>

                {/* Deliverable Name EN */}
                <div>
                  <label className="block font-medium mb-2">Deliverable Name (English)</label>
                  <input
                    type="text"
                    value={currentDeliverable.deliverable_name_en || ''}
                    onChange={(e) => setCurrentDeliverable({ ...currentDeliverable, deliverable_name_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Q1 Progress Report"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deliverable Type */}
                  <div>
                    <label className="block font-khmer font-medium mb-2">ប្រភេទលទ្ធផល *</label>
                    <select
                      value={currentDeliverable.deliverable_type}
                      onChange={(e) => setCurrentDeliverable({ ...currentDeliverable, deliverable_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg font-khmer"
                    >
                      {deliverableTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label_km} / {type.label_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block font-khmer font-medium mb-2">កាលបរិច្ឆេទប្រគល់ *</label>
                    <input
                      type="date"
                      value={currentDeliverable.due_date}
                      onChange={(e) => setCurrentDeliverable({ ...currentDeliverable, due_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-khmer font-medium mb-2">ការពិពណ៌នា *</label>
                  <textarea
                    value={currentDeliverable.description}
                    onChange={(e) => setCurrentDeliverable({ ...currentDeliverable, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg font-khmer"
                    placeholder="ពន្យល់អំពីលទ្ធផលនេះ..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddDeliverable}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    បន្ថែម / Add Deliverable
                  </button>
                  <button
                    onClick={() => setCurrentDeliverable(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    បោះបង់ / Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-medium font-khmer">
              សរុប: {deliverables.length} លទ្ធផល
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total: {deliverables.length} deliverables across {selectedIndicators.length} indicators
            </p>
          </div>
        </>
      )}
    </div>
  )
}
