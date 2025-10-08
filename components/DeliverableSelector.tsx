'use client'

import React, { useEffect, useState } from 'react'
import { Radio, Space, Alert, Spin, Typography, Table, Divider } from 'antd'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface DeliverableOption {
  id: number
  option_number: number
  option_text_khmer: string
  option_text_english?: string
  condition_type: string
  baseline_percentage?: number
  target_percentage?: number
}

interface Deliverable {
  id: number
  deliverable_number: number
  deliverable_title_khmer: string
  deliverable_title_english?: string
  timeline: string
  activities_text?: string
  options: DeliverableOption[]
}

interface DeliverableSelectorProps {
  contractType: number // 4 or 5
  onChange: (selections: { deliverableId: number; selectedOptionId: number }[]) => void
  value?: { deliverableId: number; selectedOptionId: number }[]
}

const DeliverableSelector: React.FC<DeliverableSelectorProps> = ({ contractType, onChange, value }) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selections, setSelections] = useState<Map<number, number>>(new Map())

  // Initialize selections from value prop
  useEffect(() => {
    if (value && value.length > 0) {
      const newSelections = new Map<number, number>()
      value.forEach(sel => {
        newSelections.set(sel.deliverableId, sel.selectedOptionId)
      })
      setSelections(newSelections)
    }
  }, [value])

  // Fetch deliverables and options
  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/deliverables?contractType=${contractType}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to fetch deliverables')
        }

        setDeliverables(data.data.deliverables)
      } catch (err: any) {
        console.error('Error fetching deliverables:', err)
        setError(err.message || 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
      } finally {
        setLoading(false)
      }
    }

    if (contractType === 4 || contractType === 5) {
      fetchDeliverables()
    }
  }, [contractType])

  const handleOptionChange = (deliverableId: number, optionId: number) => {
    const newSelections = new Map(selections)
    newSelections.set(deliverableId, optionId)
    setSelections(newSelections)

    // Convert to array format
    const selectionsArray = Array.from(newSelections.entries()).map(([delId, optId]) => ({
      deliverableId: delId,
      selectedOptionId: optId
    }))

    onChange(selectionsArray)
  }

  const isAllSelected = () => {
    return deliverables.length > 0 && selections.size === deliverables.length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <Text className="ml-4 font-hanuman">កំពុងទាញយកទិន្នន័យសមិទ្ធកម្ម...</Text>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="កំហុស"
        description={error}
        type="error"
        showIcon
        className="font-hanuman"
      />
    )
  }

  if (deliverables.length === 0) {
    return (
      <Alert
        message="មិនមានទិន្នន័យ"
        description="រកមិនឃើញសមិទ្ធកម្មសម្រាប់ប្រភេទកិច្ចព្រមព្រៀងនេះទេ"
        type="warning"
        showIcon
        className="font-hanuman"
      />
    )
  }

  return (
    <div className="space-y-6">
      <Alert
        message={
          <span className="font-hanuman">
            សូមជ្រើសរើសសូចនាករមួយសម្រាប់សមិទ្ធកម្មនីមួយៗ (ទាំងអស់ {deliverables.length} សមិទ្ធកម្ម)
          </span>
        }
        description={
          isAllSelected() ? (
            <span className="font-hanuman text-green-600">
              <CheckCircleOutlined /> អ្នកបានជ្រើសរើសគ្រប់សមិទ្ធកម្មរួចរាល់ហើយ
            </span>
          ) : (
            <span className="font-hanuman">
              បានជ្រើសរើស: {selections.size}/{deliverables.length}
            </span>
          )
        }
        type={isAllSelected() ? 'success' : 'info'}
        showIcon
        className="mb-6"
      />

      {deliverables.map((deliverable, index) => (
        <div key={deliverable.id} className="border rounded-lg p-6 bg-white shadow-sm">
          {/* Deliverable Title */}
          <div className="mb-4">
            <Title level={5} className="font-hanuman text-blue-700 mb-2">
              {deliverable.deliverable_number}. {deliverable.deliverable_title_khmer}
            </Title>
            {deliverable.deliverable_title_english && (
              <Text type="secondary" className="text-sm italic">
                {deliverable.deliverable_title_english}
              </Text>
            )}
            <div className="mt-2">
              <Text strong className="font-hanuman">ពេលវេលាអនុវត្ត: </Text>
              <Text className="font-hanuman text-purple-600">{deliverable.timeline}</Text>
            </div>
          </div>

          {/* Activities (for Agreement Type 5) */}
          {deliverable.activities_text && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <Text strong className="font-hanuman text-blue-800">សកម្មភាពនាយកសាលាអនុវត្ត:</Text>
              <div className="mt-2 font-hanuman text-sm whitespace-pre-line text-gray-700">
                {deliverable.activities_text}
              </div>
            </div>
          )}

          <Divider className="my-4" />

          {/* Options with Radio Buttons */}
          <div>
            <Text strong className="font-hanuman text-gray-700">
              សូចនាករ (ជ្រើសរើសមួយ):
            </Text>
            <Radio.Group
              onChange={(e) => handleOptionChange(deliverable.id, e.target.value)}
              value={selections.get(deliverable.id)}
              className="w-full mt-3"
            >
              <Space direction="vertical" className="w-full">
                {deliverable.options.map((option) => (
                  <div
                    key={option.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${selections.get(deliverable.id) === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                      }
                    `}
                  >
                    <Radio value={option.id} className="w-full">
                      <div className="ml-2">
                        <Text className="font-hanuman font-medium">
                          ជម្រើសទី {option.option_number}: {option.option_text_khmer}
                        </Text>
                        {option.option_text_english && (
                          <div className="mt-1">
                            <Text type="secondary" className="text-sm italic">
                              {option.option_text_english}
                            </Text>
                          </div>
                        )}
                        {option.baseline_percentage !== null && option.target_percentage !== null && (
                          <div className="mt-2 text-xs text-gray-500 font-hanuman">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">
                              មូលដ្ឋាន: {option.baseline_percentage}%
                            </span>
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded">
                              គោលដៅ: {option.target_percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </Radio>
                  </div>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {/* Selection Status */}
          {selections.has(deliverable.id) && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <Text className="font-hanuman text-green-700">
                <CheckCircleOutlined /> បានជ្រើសរើស: ជម្រើសទី{' '}
                {deliverable.options.find(opt => opt.id === selections.get(deliverable.id))?.option_number}
              </Text>
            </div>
          )}
        </div>
      ))}

      {/* Final Validation Message */}
      {!isAllSelected() && (
        <Alert
          message="សូមជ្រើសរើសសូចនាករមួយសម្រាប់សមិទ្ធកម្មនីមួយៗ"
          description={`អ្នកត្រូវជ្រើសរើសសូចនាករសម្រាប់សមិទ្ធកម្មទាំងអស់ (${selections.size}/${deliverables.length})`}
          type="warning"
          showIcon
          className="font-hanuman"
        />
      )}
    </div>
  )
}

export default DeliverableSelector
