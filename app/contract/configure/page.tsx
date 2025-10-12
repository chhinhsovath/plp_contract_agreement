'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Radio, Steps, Typography, Space, Alert, Spin, message } from 'antd'
import { CheckCircleOutlined, RightOutlined, LeftOutlined, FileTextOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography

interface DeliverableOption {
  id: number
  option_number: number
  option_text_khmer: string
  option_text_english: string
  condition_type: string
  baseline_percentage: number | null
  target_percentage: number | null
}

interface Deliverable {
  id: number
  deliverable_number: number
  deliverable_title_khmer: string
  deliverable_title_english: string
  timeline: string
  activities_text: string | null
  options: DeliverableOption[]
}

interface Selection {
  deliverable_id: number
  selected_option_id: number
}

export default function ContractConfigurePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Selection[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Only Contract 4 & 5 PARTNER users can access this page
        if (userData.role !== UserRole.PARTNER || (userData.contract_type !== 4 && userData.contract_type !== 5)) {
          message.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ')
          router.push('/')
          return
        }

        // If already signed contract, redirect to dashboard
        if (userData.contract_signed) {
          router.push('/me-dashboard')
          return
        }

        setUser(userData)
        await fetchDeliverables(userData.contract_type)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/login')
    }
  }

  const fetchDeliverables = async (contractType: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contract-deliverables?contract_type=${contractType}`)
      if (response.ok) {
        const data = await response.json()
        setDeliverables(data.deliverables)

        // Initialize empty selections
        setSelections(data.deliverables.map((d: Deliverable) => ({
          deliverable_id: d.id,
          selected_option_id: 0 // 0 means not selected yet
        })))
      } else {
        message.error('មិនអាចទាញយកទិន្នន័យបាន')
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (deliverableId: number, optionId: number) => {
    setSelections(prev =>
      prev.map(s =>
        s.deliverable_id === deliverableId
          ? { ...s, selected_option_id: optionId }
          : s
      )
    )
  }

  const handleNext = () => {
    const currentSelection = selections[currentStep]
    if (!currentSelection || currentSelection.selected_option_id === 0) {
      message.warning('សូមជ្រើសរើសជម្រើសមួយ')
      return
    }

    if (currentStep < deliverables.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last step - go to review
      router.push('/contract/sign')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Check all selections are made
    const allSelected = selections.every(s => s.selected_option_id !== 0)
    if (!allSelected) {
      message.error('សូមជ្រើសរើសជម្រើសសម្រាប់សមិទ្ធកម្មទាំងអស់')
      return
    }

    setSubmitting(true)
    try {
      // Save selections to localStorage for the sign page to use
      localStorage.setItem('contract_selections', JSON.stringify(selections))

      message.success('រក្សាទុកការជ្រើសរើសរបស់អ្នកដោយជោគជ័យ')
      router.push('/contract/sign')
    } catch (error) {
      console.error('Failed to save selections:', error)
      message.error('មានបញ្ហាក្នុងការរក្សាទុក')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    )
  }

  const currentDeliverable = deliverables[currentStep]
  const currentSelection = selections[currentStep]

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-md">
          <Space direction="vertical" size="middle" className="w-full">
            <Title level={2} className="font-hanuman mb-0">
              <FileTextOutlined className="mr-3" />
              កំណត់រចនាសម្ព័ន្ធកិច្ចសន្យា
            </Title>
            <Text className="text-gray-600 font-hanuman text-base">
              សូមជ្រើសរើសជម្រើសមួយសម្រាប់សមិទ្ធកម្មនីមួយៗ ដោយផ្អែកលើទិន្នន័យមូលដ្ឋានរបស់អ្នក
            </Text>
          </Space>
        </Card>

        {/* Progress Steps */}
        <Card className="mb-8 shadow-md">
          <Steps
            current={currentStep}
            items={deliverables.map((d, index) => ({
              title: (
                <span className="font-hanuman text-sm">
                  សមិទ្ធកម្មទី {d.deliverable_number}
                </span>
              ),
              status:
                selections[index]?.selected_option_id !== 0 ? 'finish' :
                index === currentStep ? 'process' : 'wait',
              icon: selections[index]?.selected_option_id !== 0 ? <CheckCircleOutlined /> : undefined
            }))}
            responsive={false}
            size="default"
          />
        </Card>

        {/* Alert */}
        <Alert
          message={
            <span className="font-hanuman text-base">
              សូមអានជម្រើសទាំង ៣ យ៉ាងត្រឹមត្រូវ ហើយជ្រើសរើសជម្រើសដែលត្រូវនឹងស្ថានភាពសាលារៀនរបស់អ្នក
            </span>
          }
          type="info"
          showIcon
          className="mb-8 font-hanuman p-4"
        />

        {/* Current Deliverable */}
        {currentDeliverable && (
          <Card className="shadow-md mb-8">
            <Space direction="vertical" size="large" className="w-full">
              {/* Deliverable Title */}
              <div>
                <Title level={4} className="font-hanuman text-blue-700 mb-2">
                  សមិទ្ធកម្មទី {currentDeliverable.deliverable_number}
                </Title>
                <Paragraph className="font-hanuman text-lg mb-2">
                  {currentDeliverable.deliverable_title_khmer}
                </Paragraph>
                {currentDeliverable.activities_text && (
                  <Paragraph className="font-hanuman text-gray-600 text-sm bg-gray-50 p-3 rounded">
                    <strong>សកម្មភាព:</strong> {currentDeliverable.activities_text}
                  </Paragraph>
                )}
                <Text className="font-hanuman text-gray-500 text-sm">
                  <strong>ពេលវេលាអនុវត្ត:</strong> {currentDeliverable.timeline}
                </Text>
              </div>

              {/* Options */}
              <div>
                <Title level={5} className="font-hanuman mb-3">
                  សូមជ្រើសរើសជម្រើសមួយ:
                </Title>
                <Radio.Group
                  value={currentSelection?.selected_option_id || 0}
                  onChange={(e) => handleOptionSelect(currentDeliverable.id, e.target.value)}
                  className="w-full"
                >
                  <Space direction="vertical" size="middle" className="w-full">
                    {currentDeliverable.options.map((option) => (
                      <Card
                        key={option.id}
                        hoverable
                        className={`cursor-pointer transition-all ${
                          currentSelection?.selected_option_id === option.id
                            ? 'border-blue-500 border-2 shadow-md bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleOptionSelect(currentDeliverable.id, option.id)}
                      >
                        <Radio value={option.id} className="w-full">
                          <Space direction="vertical" size="small" className="w-full ml-2">
                            <Text strong className="font-hanuman text-base">
                              ជម្រើសទី {option.option_number}
                            </Text>
                            <Paragraph className="font-hanuman mb-0 text-gray-700">
                              {option.option_text_khmer}
                            </Paragraph>
                            {option.baseline_percentage !== null && option.target_percentage !== null && (
                              <Text className="text-sm text-gray-500 font-hanuman">
                                គោលដៅ: {option.baseline_percentage}% → {option.target_percentage}%
                              </Text>
                            )}
                          </Space>
                        </Radio>
                      </Card>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            </Space>
          </Card>
        )}

        {/* Navigation Buttons - Optimized for Tablet/Desktop */}
        <Card className="shadow-md">
          <div className="flex justify-between items-center p-4">
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="large"
              className="px-8 py-6 h-auto text-base"
            >
              <span className="font-hanuman">ថយក្រោយ</span>
            </Button>

            <Text className="font-hanuman text-gray-500 text-lg font-medium">
              {currentStep + 1} / {deliverables.length}
            </Text>

            {currentStep < deliverables.length - 1 ? (
              <Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                onClick={handleNext}
                size="large"
                className="px-8 py-6 h-auto text-base"
              >
                <span className="font-hanuman">បន្ទាប់</span>
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                size="large"
                className="px-8 py-6 h-auto text-base"
              >
                <span className="font-hanuman">ពិនិត្យ និងចុះហត្ថលេខា</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
