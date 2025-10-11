'use client'

import { useState, useEffect } from 'react'

interface Activity {
  indicator_index: number
  activity_name_km: string
  activity_name_en?: string
  activity_description: string
  responsible_person: string
  start_date: string
  end_date: string
  budget?: number
}

interface Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step3ActivitiesPlanning({ formData, updateFormData }: Props) {
  const [activities, setActivities] = useState<Activity[]>(formData.activities || [])
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)
  const [selectedIndicatorIndex, setSelectedIndicatorIndex] = useState<number>(0)

  useEffect(() => {
    updateFormData({ activities })
  }, [activities])

  const selectedIndicators = formData.selected_indicators || []

  const handleAddActivity = () => {
    if (!currentActivity) return

    // Validation
    if (!currentActivity.activity_name_km || !currentActivity.responsible_person ||
        !currentActivity.start_date || !currentActivity.end_date) {
      alert('សូមបំពេញព័ត៌មានទាំងអស់! / Please fill all required fields!')
      return
    }

    if (new Date(currentActivity.end_date) < new Date(currentActivity.start_date)) {
      alert('កាលបរិច្ឆេទបញ្ចប់ត្រូវតែលើសកាលបរិច្ឆេទចាប់ផ្តើម! / End date must be after start date!')
      return
    }

    setActivities([...activities, currentActivity])
    setCurrentActivity(null)
  }

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const getIndicatorName = (indicator_index: number) => {
    const indicator = selectedIndicators[indicator_index]
    if (!indicator) return ''

    // Get indicator display from the indicator_code
    const indicatorNames: any = {
      'IND-001': 'ចុះឈ្មោះសិស្សថ្នាក់ទី១',
      'IND-002': 'បណ្ណព័ត៌មានសាលារៀន',
      'IND-003': 'គណៈកម្មការគ្រប់គ្រង',
      'IND-004': 'សិស្សក្រោមមូលដ្ឋានថយចុះ',
      'IND-005': 'សិស្សទទួលនិទ្ទេស A,B,C'
    }

    return indicatorNames[indicator.indicator_code] || indicator.indicator_code
  }

  const getActivitiesForIndicator = (indicator_index: number) => {
    return activities.filter(a => a.indicator_index === indicator_index)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-khmer mb-2">រៀបចំផែនការសកម្មភាព</h2>
        <p className="text-gray-600">Activities Planning (for each selected indicator)</p>
      </div>

      {selectedIndicators.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">សូមជ្រើសរើសសូចនាករជាមុនសិន / Please select indicators first</p>
        </div>
      ) : (
        <>
          {/* Activities Summary by Indicator */}
          <div className="space-y-4">
            <h3 className="font-bold font-khmer text-lg">សកម្មភាពតាមសូចនាករ</h3>

            {selectedIndicators.map((indicator: any, index: number) => {
              const indicatorActivities = getActivitiesForIndicator(index)

              return (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium font-khmer">
                      {index + 1}. {getIndicatorName(index)}
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedIndicatorIndex(index)
                        setCurrentActivity({
                          indicator_index: index,
                          activity_name_km: '',
                          activity_description: '',
                          responsible_person: '',
                          start_date: '',
                          end_date: '',
                          budget: undefined
                        })
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      + បន្ថែមសកម្មភាព
                    </button>
                  </div>

                  {indicatorActivities.length === 0 ? (
                    <p className="text-sm text-gray-500">មិនទាន់មានសកម្មភាព / No activities yet</p>
                  ) : (
                    <div className="space-y-2">
                      {indicatorActivities.map((activity, actIndex) => {
                        const globalIndex = activities.findIndex(a =>
                          a.indicator_index === index &&
                          a.activity_name_km === activity.activity_name_km
                        )

                        return (
                          <div key={actIndex} className="bg-white p-3 rounded border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium font-khmer">{activity.activity_name_km}</p>
                                <p className="text-sm text-gray-600 mt-1">{activity.activity_description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                  <span>អ្នកទទួលខុសត្រូវ: {activity.responsible_person}</span>
                                  <span>{activity.start_date} - {activity.end_date}</span>
                                  {activity.budget && <span>${activity.budget}</span>}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveActivity(globalIndex)}
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

          {/* Activity Form */}
          {currentActivity && (
            <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
              <h3 className="font-bold font-khmer text-xl mb-4">
                បន្ថែមសកម្មភាពសម្រាប់: {getIndicatorName(currentActivity.indicator_index)}
              </h3>

              <div className="space-y-4">
                {/* Activity Name KM */}
                <div>
                  <label className="block font-khmer font-medium mb-2">ឈ្មោះសកម្មភាព (ខ្មែរ) *</label>
                  <input
                    type="text"
                    value={currentActivity.activity_name_km}
                    onChange={(e) => setCurrentActivity({ ...currentActivity, activity_name_km: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg font-khmer"
                    placeholder="ឧទាហរណ៍: ធ្វើយុទ្ធនាការប្រមូលកុមារចូលរៀន"
                  />
                </div>

                {/* Activity Name EN */}
                <div>
                  <label className="block font-medium mb-2">Activity Name (English)</label>
                  <input
                    type="text"
                    value={currentActivity.activity_name_en || ''}
                    onChange={(e) => setCurrentActivity({ ...currentActivity, activity_name_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Conduct enrollment campaign"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-khmer font-medium mb-2">ការពិពណ៌នាសកម្មភាព *</label>
                  <textarea
                    value={currentActivity.activity_description}
                    onChange={(e) => setCurrentActivity({ ...currentActivity, activity_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg font-khmer"
                    placeholder="ពន្យល់អំពីសកម្មភាពនេះ..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Responsible Person */}
                  <div>
                    <label className="block font-khmer font-medium mb-2">អ្នកទទួលខុសត្រូវ *</label>
                    <input
                      type="text"
                      value={currentActivity.responsible_person}
                      onChange={(e) => setCurrentActivity({ ...currentActivity, responsible_person: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg font-khmer"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block font-khmer font-medium mb-2">ថវិកា (USD)</label>
                    <input
                      type="number"
                      value={currentActivity.budget || ''}
                      onChange={(e) => setCurrentActivity({ ...currentActivity, budget: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                      step="100"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block font-khmer font-medium mb-2">កាលបរិច្ឆេទចាប់ផ្តើម *</label>
                    <input
                      type="date"
                      value={currentActivity.start_date}
                      onChange={(e) => setCurrentActivity({ ...currentActivity, start_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block font-khmer font-medium mb-2">កាលបរិច្ឆេទបញ្ចប់ *</label>
                    <input
                      type="date"
                      value={currentActivity.end_date}
                      onChange={(e) => setCurrentActivity({ ...currentActivity, end_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddActivity}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    បន្ថែម / Add Activity
                  </button>
                  <button
                    onClick={() => setCurrentActivity(null)}
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
              សរុប: {activities.length} សកម្មភាព
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total: {activities.length} activities across {selectedIndicators.length} indicators
            </p>
          </div>
        </>
      )}
    </div>
  )
}
