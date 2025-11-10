'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Radio, Steps, Typography, Space, Alert, Spin, message, Modal, Input, Badge } from 'antd'
import { CheckCircleOutlined, RightOutlined, LeftOutlined, FileTextOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'
import { useContent } from '@/lib/hooks/useContent'
import { WorkflowProgress } from '@/components/WorkflowProgress'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

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
  baseline_percentage?: number
  baseline_source?: string
  baseline_date?: string
  baseline_notes?: string
}

interface ExistingSelection {
  deliverable_id: number
  deliverable_title_khmer: string
  selected_option_id: number
  option_text_khmer: string
  option_number: number
  baseline_percentage?: number
  baseline_source?: string
  baseline_date?: string
  baseline_notes?: string
}

export default function ContractConfigurePage() {
  const router = useRouter()
  const { t } = useContent()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Selection[]>([])
  const [submitting, setSubmitting] = useState(false)

  // New state for viewing existing configuration
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('edit')
  const [existingSelections, setExistingSelections] = useState<ExistingSelection[]>([])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestReason, setRequestReason] = useState('')
  const [requestingChange, setRequestingChange] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<any>(null)

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
          setLoading(false)
          message.error(t('configure_no_access_error'))
          router.push('/')
          return
        }

        // Support all contract types 1-5
        if (!userData.contract_type || userData.contract_type < 1 || userData.contract_type > 5) {
          setLoading(false)
          message.error(t('configure_invalid_type_error'))
          router.push('/')
          return
        }

        // User must sign contract before configuring deliverables
        if (!userData.contract_signed) {
          setLoading(false)
          message.warning(t('configure_must_sign_first_warning') || 'សូមចុះហត្ថលេខលើលិខិតកិច្ចព្រមាណ មុនពេលកំណត់រចនាសម្ព័ន្ធលទ្ធផល / Please sign the contract first before configuring deliverables')
          router.push('/contract/submit')
          return
        }

        setUser(userData)

        // Check if user already completed configuration or signed
        if (userData.configuration_complete || userData.contract_signed) {
          // Fetch existing selections to show in view mode
          const selections = await fetchExistingSelections(userData.id)

          // If no selections found, user needs to configure (reset scenario)
          if (!selections || selections.length === 0) {
            // Reset the flags since there's no actual configuration
            userData.configuration_complete = false
            userData.contract_signed = false

            // Check if user has read the contract
            if (!userData.contract_read) {
              setLoading(false)
              message.warning(t('configure_read_first_warning'))
              router.push('/contract/sign')
              return
            }

            // Load deliverables for configuration
            await fetchDeliverables(userData.contract_type)
            setViewMode('edit')
          } else {
            // Has selections, show view mode
            await checkPendingRequest(userData.id)
            setViewMode('view')
          }
        } else {
          // Check if user has read the contract first
          if (!userData.contract_read) {
            setLoading(false)
            message.warning(t('configure_read_first_warning'))
            router.push('/contract/sign')
            return
          }
          // Allow access for users who have read but not configured yet
          await fetchDeliverables(userData.contract_type)
          setViewMode('edit')
        }
      } else {
        setLoading(false)
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setLoading(false)
      router.push('/login')
    }
  }

  const fetchExistingSelections = async (userId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/me/deliverables`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.deliverables) {
          setExistingSelections(data.data.deliverables)
          return data.data.deliverables
        }
      } else {
        message.error(t('configure_fetch_current_error'))
      }
      return []
    } catch (error) {
      console.error('Failed to fetch existing selections:', error)
      message.error(t('configure_data_error'))
      return []
    } finally {
      setLoading(false)
    }
  }

  const checkPendingRequest = async (userId: number) => {
    try {
      const response = await fetch(`/api/reconfiguration-requests/my-request`)
      if (response.ok) {
        const data = await response.json()
        if (data.request && data.request.status === 'pending') {
          setPendingRequest(data.request)
        }
      }
    } catch (error) {
      console.error('Failed to check pending request:', error)
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
        message.error(t('configure_load_error'))
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
      message.error(t('configure_data_error'))
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

  const handleBaselineChange = (deliverableId: number, field: string, value: any) => {
    setSelections(prev =>
      prev.map(s =>
        s.deliverable_id === deliverableId
          ? { ...s, [field]: value }
          : s
      )
    )
  }

  const handleNext = () => {
    const currentSelection = selections[currentStep]
    if (!currentSelection || currentSelection.selected_option_id === 0) {
      message.warning(t('configure_select_one_warning'))
      return
    }

    // Validate baseline fields
    if (!currentSelection.baseline_percentage || !currentSelection.baseline_source || !currentSelection.baseline_date) {
      message.warning('សូមបំពេញព័ត៌មាននៃតម្លៃមូលដ្ឋាន / Please fill all baseline information')
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
    // Check all selections are made with baseline data
    const allSelected = selections.every(s =>
      s.selected_option_id !== 0 &&
      s.baseline_percentage &&
      s.baseline_source &&
      s.baseline_date
    )
    if (!allSelected) {
      message.error(t('configure_select_all_error') || 'Please complete all selections with baseline information')
      return
    }

    setSubmitting(true)
    try {
      // Save selections to localStorage for submission page
      localStorage.setItem('contract_selections', JSON.stringify(selections))

      // Save selections to database via API endpoint
      const response = await fetch('/api/contract-deliverables/selections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selections
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save selections')
      }

      // Also mark configuration as complete
      await fetch('/api/contracts/save-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          selections
        })
      })

      message.success(t('contract_configure_success_message'))
      // Redirect to signature submission page
      router.push('/contract/submit')
    } catch (error) {
      console.error('Failed to save configuration:', error)
      message.error(error instanceof Error ? error.message : t('configure_save_error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestChange = () => {
    setShowRequestModal(true)
  }

  const handleSubmitChangeRequest = async () => {
    if (!requestReason.trim()) {
      message.warning(t('reconfig_reason_required_warning'))
      return
    }

    setRequestingChange(true)
    try {
      const response = await fetch('/api/reconfiguration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          contractType: user.contract_type,
          requestReason: requestReason,
          currentSelections: existingSelections
        })
      })

      if (response.ok) {
        message.success(t('reconfig_success_message'))
        setShowRequestModal(false)
        setRequestReason('')
        // Refresh to show pending request
        await checkPendingRequest(user.id)
      } else {
        const data = await response.json()
        message.error(data.error || t('reconfig_submit_error'))
      }
    } catch (error) {
      console.error('Failed to submit request:', error)
      message.error(t('configure_connection_error'))
    } finally {
      setRequestingChange(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Spin size="large" />
      </div>
    )
  }

  // View Mode: Show existing selections
  if (viewMode === 'view') {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Workflow Progress */}
          <WorkflowProgress currentStep={2} />

          {/* Header */}
          <Card style={{ marginBottom: 32, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={2} style={{ marginBottom: 0 }}>
                <EyeOutlined style={{ marginRight: 12 }} />
                {t('contract_configure_view_title')}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                {t('contract_configure_view_subtitle')}
              </Text>
            </Space>
          </Card>

          {/* Pending Request Alert */}
          {pendingRequest && (
            <Alert
              message={<span style={{ fontSize: 15 }}>{t('reconfig_request_pending_alert')}</span>}
              description={
                <div>
                  <Text>{t('reconfig_request_reason_label')} {pendingRequest.request_reason}</Text>
                  <br />
                  <Text type="secondary">កាលបរិច្ឆេទស្នើសុំ: {new Date(pendingRequest.created_at).toLocaleDateString('km-KH')}</Text>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 32 }}
            />
          )}

          {/* Current Selections */}
          <Card title={t('configure_selected_deliverables_title')} style={{ marginBottom: 32 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {existingSelections.map((deliverable: any, index: number) => {
                // Find the selected option from the deliverable's options array
                const selectedOption = deliverable.options?.find((opt: any) => opt.id === deliverable.selected_option_id)

                return (
                  <Card key={deliverable.id} type="inner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <Badge count={selectedOption?.option_number} style={{ backgroundColor: '#52c41a' }}>
                          <Title level={5} style={{ marginBottom: 8, paddingRight: 30 }}>
                            {t('contract_configure_deliverable_label')} {index + 1}
                          </Title>
                        </Badge>
                        <Paragraph style={{ fontSize: 16, marginBottom: 12, color: '#0047AB' }}>
                          {deliverable.deliverable_title_khmer}
                        </Paragraph>
                        {selectedOption && (
                          <Alert
                            message={<Text strong>{t('configure_selected_option_label')} {t('contract_configure_option_label')} {selectedOption.option_number}</Text>}
                            description={selectedOption.option_text_khmer}
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                        )}

                        {/* Baseline Information Display */}
                        {deliverable.baseline_percentage !== undefined && (
                          <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginTop: 12 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8, color: '#0047AB' }}>
                              ព័ត៌មាននៃតម្លៃមូលដ្ឋាន / Baseline Information
                            </Text>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>តម្លៃមូលដ្ឋាន / Baseline %</Text>
                                <Paragraph style={{ marginBottom: 0, fontWeight: 500 }}>
                                  {deliverable.baseline_percentage}%
                                </Paragraph>
                              </div>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>ប្រភព / Source</Text>
                                <Paragraph style={{ marginBottom: 0, fontWeight: 500 }}>
                                  {deliverable.baseline_source}
                                </Paragraph>
                              </div>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>កាលបរិច្ឆេទ / Date</Text>
                                <Paragraph style={{ marginBottom: 0, fontWeight: 500 }}>
                                  {deliverable.baseline_date ? new Date(deliverable.baseline_date).toLocaleDateString('km-KH') : '-'}
                                </Paragraph>
                              </div>
                              {deliverable.baseline_notes && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>ចំណាំ / Notes</Text>
                                  <Paragraph style={{ marginBottom: 0, fontWeight: 500 }}>
                                    {deliverable.baseline_notes}
                                  </Paragraph>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </Space>
          </Card>

          {/* Request Change Button */}
          <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              {user.contract_signed ? (
                <Alert
                  message={t('configure_signed_alert_title')}
                  description={t('configure_signed_alert_description')}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              ) : null}

              <Button
                type="primary"
                size="large"
                icon={<EditOutlined />}
                onClick={handleRequestChange}
                disabled={!!pendingRequest}
                style={{ padding: '0 32px', height: 48, fontSize: 15 }}
              >
                {pendingRequest ? t('configure_pending_request_message') : t('contract_configure_request_change_button')}
              </Button>

              <div style={{ marginTop: 16 }}>
                <Button
                  size="large"
                  onClick={() => router.push('/me-dashboard')}
                  style={{ padding: '0 32px', height: 48 }}
                >
                  {t('contract_configure_return_dashboard_button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Request Change Modal */}
          <Modal
            title={<span className="font-hanuman">{t('reconfig_request_modal_title')}</span>}
            open={showRequestModal}
            onCancel={() => {
              setShowRequestModal(false)
              setRequestReason('')
            }}
            footer={[
              <Button key="cancel" onClick={() => {
                setShowRequestModal(false)
                setRequestReason('')
              }}>
                {t('common_cancel')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={requestingChange}
                onClick={handleSubmitChangeRequest}
              >
                {t('reconfig_submit_button')}
              </Button>
            ]}
            width={600}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                message={t('reconfig_request_alert_message')}
                description={t('reconfig_request_alert_description')}
                type="info"
                showIcon
              />

              <div>
                <Text strong>{t('reconfig_request_reason_label')}</Text>
                <TextArea
                  rows={4}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder={t('reconfig_reason_placeholder')}
                  maxLength={500}
                  showCount
                  style={{ marginTop: 8 }}
                />
              </div>
            </Space>
          </Modal>
        </div>
      </div>
    )
  }

  // Edit Mode: Initial configuration
  const currentDeliverable = deliverables[currentStep]
  const currentSelection = selections[currentStep]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Workflow Progress */}
        <WorkflowProgress currentStep={2} />

        {/* Header */}
        <Card style={{ marginBottom: 32, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={2} style={{ marginBottom: 0 }}>
              <FileTextOutlined style={{ marginRight: 12 }} />
              {t('contract_configure_page_title')}
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              {t('contract_configure_subtitle')}
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
                  {t('contract_configure_deliverable_label')} {d.deliverable_number}
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
              {t('contract_configure_alert_message')}
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
                  {t('contract_configure_deliverable_label')} {currentDeliverable.deliverable_number}
                </Title>
                <Paragraph style={{ fontSize: 16, marginBottom: 8 }}>
                  {currentDeliverable.deliverable_title_khmer}
                </Paragraph>
                {currentDeliverable.activities_text && (
                  <Paragraph style={{ color: '#595959', fontSize: 14, background: '#fafafa', padding: 12, borderRadius: 8 }}>
                    <strong>{t('contract_configure_activities_label')}</strong> {currentDeliverable.activities_text}
                  </Paragraph>
                )}
                <Text type="secondary" style={{ fontSize: 14 }}>
                  <strong>{t('contract_configure_timeline_label')}</strong> {currentDeliverable.timeline}
                </Text>
              </div>

              {/* Options */}
              <div>
                <Title level={5} style={{ marginBottom: 12 }}>
                  {t('contract_configure_select_option_label')}
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
                              {t('contract_configure_option_label')} {option.option_number}
                            </Text>
                            <Paragraph style={{ marginBottom: 0, color: '#262626' }}>
                              {option.option_text_khmer}
                            </Paragraph>
                            {option.baseline_percentage !== null && option.target_percentage !== null && (
                              <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
                                {t('contract_configure_target_label')} {option.baseline_percentage}% → {option.target_percentage}%
                              </Text>
                            )}
                          </Space>
                        </Radio>
                      </Card>
                    ))}
                  </Space>
                </Radio.Group>
              </div>

              {/* Baseline Input Section - Show only when option is selected */}
              {currentSelection?.selected_option_id !== 0 && (
                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                  <Title level={5} style={{ marginBottom: 16, color: '#0047AB' }}>
                    {t('contract_configure_baseline_label') || 'ព័ត៌មាននៃតម្លៃមូលដ្ឋាន / Baseline Information'}
                  </Title>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Baseline Percentage */}
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        តម្លៃមូលដ្ឋាននៃលទ្ធផលនៅឆ្នាំសិក្សា២០២៤-២០២៥ (%) *
                      </Text>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="ឧ. 85.5"
                        value={currentSelection?.baseline_percentage || ''}
                        onChange={(e) => handleBaselineChange(currentDeliverable.id, 'baseline_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Baseline Source */}
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        ប្រភពទិន្នន័យមូលដ្ឋាន *
                      </Text>
                      <Input
                        placeholder="ឧ. របាយការណ៍ឆ្នាំ 2024"
                        value={currentSelection?.baseline_source || ''}
                        onChange={(e) => handleBaselineChange(currentDeliverable.id, 'baseline_source', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Baseline Date */}
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        កាលបរិច្ឆេទដែលបានវាស់វែងតម្លៃមូលដ្ឋាន *
                      </Text>
                      <Input
                        type="date"
                        value={currentSelection?.baseline_date || ''}
                        onChange={(e) => handleBaselineChange(currentDeliverable.id, 'baseline_date', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Baseline Notes (Optional) */}
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        ចំណាំលម្អិតបន្ថែម (ជម្រើស)
                      </Text>
                      <Input.TextArea
                        placeholder="ពន្យល់លម្អិតបន្ថែមពីលើតម្លៃមូលដ្ឋាននេះ..."
                        value={currentSelection?.baseline_notes || ''}
                        onChange={(e) => handleBaselineChange(currentDeliverable.id, 'baseline_notes', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </Space>
                </div>
              )}
            </Space>
          </Card>
        )}

        {/* Navigation Buttons */}
        <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="large"
              style={{ padding: '0 32px', height: 48, fontSize: 15 }}
            >
              <span>{t('contract_configure_back_button')}</span>
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
                <span>{t('contract_configure_next_button')}</span>
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
                <span>{t('contract_configure_submit_button')}</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
