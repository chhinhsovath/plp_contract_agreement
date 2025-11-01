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

        // Only PARTNER users can access this page for all contract types
        if (userData.role !== UserRole.PARTNER) {
          message.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័របង្កើតកិច្ចព្រមព្រៀង')
          router.push('/')
          return
        }

        // Support all contract types 1-5
        if (!userData.contract_type || userData.contract_type < 1 || userData.contract_type > 5) {
          message.error('ប្រភេទកិច្ចព្រមព្រៀងមិនត្រឹមត្រូវ')
          router.push('/')
          return
        }

        // Check if user already signed the contract
        if (userData.contract_signed) {
          message.info('អ្នកបានចុះហត្ថលេខាលើកិច្ចសន្យារួចហើយ')
          router.push('/me-dashboard')
          return
        }

        // Check if user already completed configuration - redirect to signature
        if (userData.configuration_complete) {
          message.info('អ្នកបានកំណត់រចនាសម្ព័ន្ធរួចហើយ')
          router.push('/contract/submit')
          return
        }

        // Check if user has read the contract first
        if (!userData.contract_read) {
          message.warning('សូមអានកិច្ចសន្យាជាមុនសិន')
          router.push('/contract/sign')
          return
        }

        // Allow access for users who have read but not configured yet
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
      // Last step - submit selections
      handleSubmit()
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
      // Save selections to localStorage for submission page
      localStorage.setItem('contract_selections', JSON.stringify(selections))

      // Mark configuration as complete in database
      const response = await fetch('/api/contracts/save-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          selections
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      message.success('រក្សាទុកការជ្រើសរើសរបស់អ្នកដោយជោគជ័យ')
      // Redirect to signature submission page
      router.push('/contract/submit')
    } catch (error) {
      console.error('Failed to save configuration:', error)
      message.error('មានបញ្ហាក្នុងការរក្សាទុក')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Spin size="large" />
      </div>
    )
  }

  const currentDeliverable = deliverables[currentStep]
  const currentSelection = selections[currentStep]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: 32, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={2} style={{ marginBottom: 0 }}>
              <FileTextOutlined style={{ marginRight: 12 }} />
              កំណត់រចនាសម្ព័ន្ធកិច្ចសន្យា
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              សូមជ្រើសរើសជម្រើសមួយសម្រាប់សមិទ្ធកម្មនីមួយៗ ដោយផ្អែកលើទិន្នន័យមូលដ្ឋានរបស់អ្នក
            </Text>
          </Space>
        </Card>

        {/* Progress Steps */}
        <Card style={{ marginBottom: 32, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Steps
            current={currentStep}
            items={deliverables.map((d, index) => ({
              title: (
                <span style={{ fontSize: 14 }}>
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
            <span style={{ fontSize: 15 }}>
              សូមអានជម្រើសទាំង ៣ យ៉ាងត្រឹមត្រូវ ហើយជ្រើសរើសជម្រើសដែលត្រូវនឹងស្ថានភាពសាលារៀនរបស់អ្នក
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 32, padding: 16 }}
        />

        {/* Current Deliverable */}
        {currentDeliverable && (
          <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: 32 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Deliverable Title */}
              <div>
                <Title level={4} style={{ color: '#0047AB', marginBottom: 8 }}>
                  សមិទ្ធកម្មទី {currentDeliverable.deliverable_number}
                </Title>
                <Paragraph style={{ fontSize: 16, marginBottom: 8 }}>
                  {currentDeliverable.deliverable_title_khmer}
                </Paragraph>
                {currentDeliverable.activities_text && (
                  <Paragraph style={{ color: '#595959', fontSize: 14, background: '#fafafa', padding: 12, borderRadius: 8 }}>
                    <strong>សកម្មភាព:</strong> {currentDeliverable.activities_text}
                  </Paragraph>
                )}
                <Text type="secondary" style={{ fontSize: 14 }}>
                  <strong>ពេលវេលាអនុវត្ត:</strong> {currentDeliverable.timeline}
                </Text>
              </div>

              {/* Options */}
              <div>
                <Title level={5} style={{ marginBottom: 12 }}>
                  សូមជ្រើសរើសជម្រើសមួយ:
                </Title>
                <Radio.Group
                  value={currentSelection?.selected_option_id || 0}
                  onChange={(e) => handleOptionSelect(currentDeliverable.id, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {currentDeliverable.options.map((option) => (
                      <Card
                        key={option.id}
                        hoverable
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: currentSelection?.selected_option_id === option.id
                            ? '2px solid #1890ff'
                            : '1px solid #d9d9d9',
                          background: currentSelection?.selected_option_id === option.id
                            ? '#e6f7ff'
                            : '#fff',
                          boxShadow: currentSelection?.selected_option_id === option.id
                            ? '0 2px 8px rgba(24, 144, 255, 0.2)'
                            : 'none'
                        }}
                        onClick={() => handleOptionSelect(currentDeliverable.id, option.id)}
                      >
                        <Radio value={option.id} style={{ width: '100%' }}>
                          <Space direction="vertical" size="small" style={{ width: '100%', marginLeft: 8 }}>
                            <Text strong style={{ fontSize: 15 }}>
                              ជម្រើសទី {option.option_number}
                            </Text>
                            <Paragraph style={{ marginBottom: 0, color: '#262626' }}>
                              {option.option_text_khmer}
                            </Paragraph>
                            {option.baseline_percentage !== null && option.target_percentage !== null && (
                              <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
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
        <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="large"
              style={{ padding: '0 32px', height: 48, fontSize: 15 }}
            >
              <span>ថយក្រោយ</span>
            </Button>

            <Text style={{ color: '#8c8c8c', fontSize: 16, fontWeight: 500 }}>
              {currentStep + 1} / {deliverables.length}
            </Text>

            {currentStep < deliverables.length - 1 ? (
              <Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                onClick={handleNext}
                size="large"
                style={{ padding: '0 32px', height: 48, fontSize: 15 }}
              >
                <span>បន្ទាប់</span>
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                size="large"
                style={{ padding: '0 32px', height: 48, fontSize: 15 }}
              >
                <span>ពិនិត្យ និងចុះហត្ថលេខា</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
