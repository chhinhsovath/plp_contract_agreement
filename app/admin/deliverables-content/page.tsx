'use client'

import { useState, useEffect } from 'react'
import { Card, Select, Button, Input, Space, Modal, Form, message, Spin, Tag, Typography, Alert, Collapse, Divider } from 'antd'
import { EditOutlined, FileTextOutlined, ReloadOutlined, SaveOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { AdminNav } from '@/components/admin/AdminNav'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Panel } = Collapse

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

export default function DeliverablesContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [selectedType, setSelectedType] = useState(4) // Default to Type 4
  const [showEditDeliverableModal, setShowEditDeliverableModal] = useState(false)
  const [showEditOptionModal, setShowEditOptionModal] = useState(false)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const [editingOption, setEditingOption] = useState<DeliverableOption | null>(null)
  const [processing, setProcessing] = useState(false)
  const [deliverableForm] = Form.useForm()
  const [optionForm] = Form.useForm()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (selectedType) {
      fetchDeliverables()
    }
  }, [selectedType])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user?.role !== 'SUPER_ADMIN') {
          message.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ')
          router.push('/')
          return
        }
      } else {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
      return
    }
    setLoading(false)
  }

  const fetchDeliverables = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contract-deliverables?contract_type=${selectedType}`)
      if (response.ok) {
        const data = await response.json()
        setDeliverables(data.deliverables)
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

  const handleEditDeliverable = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable)
    deliverableForm.setFieldsValue({
      deliverable_title_khmer: deliverable.deliverable_title_khmer,
      deliverable_title_english: deliverable.deliverable_title_english,
      timeline: deliverable.timeline,
      activities_text: deliverable.activities_text
    })
    setShowEditDeliverableModal(true)
  }

  const handleEditOption = (option: DeliverableOption) => {
    setEditingOption(option)
    optionForm.setFieldsValue({
      option_text_khmer: option.option_text_khmer,
      option_text_english: option.option_text_english,
      baseline_percentage: option.baseline_percentage,
      target_percentage: option.target_percentage
    })
    setShowEditOptionModal(true)
  }

  const handleUpdateDeliverable = async (values: any) => {
    if (!editingDeliverable) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/contract-deliverables/${editingDeliverable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success('បានកែប្រែសមិទ្ធកម្មដោយជោគជ័យ')
        setShowEditDeliverableModal(false)
        setEditingDeliverable(null)
        deliverableForm.resetFields()
        fetchDeliverables()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការកែប្រែ')
      }
    } catch (error) {
      console.error('Update error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateOption = async (values: any) => {
    if (!editingOption) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/deliverable-options/${editingOption.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success('បានកែប្រែជម្រើសដោយជោគជ័យ')
        setShowEditOptionModal(false)
        setEditingOption(null)
        optionForm.resetFields()
        fetchDeliverables()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការកែប្រែ')
      }
    } catch (error) {
      console.error('Update error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <AdminNav />

      <Card style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          <FileTextOutlined style={{ marginRight: 12 }} />
          គ្រប់គ្រងខ្លឹមសារសមិទ្ធកម្ម (Deliverables Content Management)
        </Title>
        <Text type="secondary">
          កែប្រែចំណងជើង និងជម្រើសរបស់សមិទ្ធកម្មទាំងអស់ - ប្រភេទកិច្ចសន្យា {selectedType}
        </Text>
      </Card>

      <Alert
        message="ការណែនាំ"
        description="ប្រើទំព័រនេះដើម្បីកែប្រែចំណងជើងសមិទ្ធកម្ម និងអត្ថបទជម្រើសនីមួយៗ។ ការផ្លាស់ប្តូរនឹងមានផលភ្លាមៗលើទំព័រកំណត់រចនាសម្ព័ន្ធ។"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space size="middle">
          <Text strong>ជ្រើសរើសប្រភេទកិច្ចសន្យា:</Text>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ width: 250 }}
            options={[
              { label: 'ប្រភេទ 1 - PMU-PCU', value: 1 },
              { label: 'ប្រភេទ 2 - PCU-PM', value: 2 },
              { label: 'ប្រភេទ 3 - PM-Regional', value: 3 },
              { label: 'ប្រភេទ 4 - Provincial-District', value: 4 },
              { label: 'ប្រភេទ 5 - Provincial-School', value: 5 }
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchDeliverables}>
            ផ្ទុកឡើងវិញ
          </Button>
        </Space>
      </Card>

      {deliverables.length === 0 ? (
        <Card>
          <Alert
            message="មិនមានទិន្នន័យ"
            description={`រកមិនឃើញសមិទ្ធកម្មសម្រាប់កិច្ចសន្យាប្រភេទ ${selectedType}`}
            type="warning"
            showIcon
          />
        </Card>
      ) : (
        <Collapse accordion defaultActiveKey={[deliverables[0]?.id.toString()]}>
          {deliverables.map((deliverable) => (
            <Panel
              key={deliverable.id.toString()}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 }}>
                  <div>
                    <Tag color="blue">សមិទ្ធកម្ម {deliverable.deliverable_number}</Tag>
                    <Text strong className="font-hanuman" style={{ marginLeft: 8 }}>
                      {deliverable.deliverable_title_khmer}
                    </Text>
                  </div>
                </div>
              }
              extra={
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditDeliverable(deliverable)
                  }}
                >
                  កែចំណងជើង
                </Button>
              }
            >
              <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <Text type="secondary" strong>English Title:</Text>
                    <Paragraph style={{ marginBottom: 0, marginLeft: 8 }}>
                      {deliverable.deliverable_title_english}
                    </Paragraph>
                  </div>
                  <div>
                    <Text type="secondary" strong>ពេលវេលា / Timeline:</Text>
                    <Paragraph style={{ marginBottom: 0, marginLeft: 8 }}>
                      {deliverable.timeline}
                    </Paragraph>
                  </div>
                  {deliverable.activities_text && (
                    <div>
                      <Text type="secondary" strong>សកម្មភាព / Activities:</Text>
                      <Paragraph style={{ marginBottom: 0, marginLeft: 8 }}>
                        {deliverable.activities_text}
                      </Paragraph>
                    </div>
                  )}
                </Space>
              </Card>

              <Divider orientation="left" style={{ fontSize: 14, color: '#0047AB' }}>
                ជម្រើសទាំងអស់ ({deliverable.options.length})
              </Divider>

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {deliverable.options.map((option) => (
                  <Card
                    key={option.id}
                    size="small"
                    style={{ border: '1px solid #d9d9d9' }}
                    title={
                      <Space>
                        <Tag color="green">ជម្រើស {option.option_number}</Tag>
                        {option.baseline_percentage !== null && option.target_percentage !== null && (
                          <Tag color="purple">
                            {option.baseline_percentage}% → {option.target_percentage}%
                          </Tag>
                        )}
                      </Space>
                    }
                    extra={
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditOption(option)}
                      >
                        កែប្រែ
                      </Button>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong className="font-hanuman" style={{ color: '#0047AB' }}>
                          ខ្មែរ:
                        </Text>
                        <Paragraph className="font-hanuman" style={{ marginBottom: 0, marginTop: 4 }}>
                          {option.option_text_khmer}
                        </Paragraph>
                      </div>
                      <div>
                        <Text strong style={{ color: '#595959' }}>
                          English:
                        </Text>
                        <Paragraph style={{ marginBottom: 0, marginTop: 4 }}>
                          {option.option_text_english}
                        </Paragraph>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Panel>
          ))}
        </Collapse>
      )}

      {/* Edit Deliverable Modal */}
      <Modal
        title={
          <span className="font-hanuman">
            កែប្រែសមិទ្ធកម្ម {editingDeliverable?.deliverable_number}
          </span>
        }
        open={showEditDeliverableModal}
        onCancel={() => {
          setShowEditDeliverableModal(false)
          setEditingDeliverable(null)
          deliverableForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={deliverableForm}
          layout="vertical"
          onFinish={handleUpdateDeliverable}
        >
          <Alert
            message="កំណត់ចំណាំ"
            description="ការផ្លាស់ប្តូរចំណងជើងនឹងមានផលភ្លាមៗលើទំព័រកំណត់រចនាសម្ព័ន្ធរបស់ដៃគូ"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="deliverable_title_khmer"
            label="ចំណងជើងខ្មែរ"
            rules={[{ required: true, message: 'សូមបញ្ចូលចំណងជើងខ្មែរ' }]}
          >
            <TextArea rows={2} className="font-hanuman" />
          </Form.Item>

          <Form.Item
            name="deliverable_title_english"
            label="English Title"
            rules={[{ required: true, message: 'Please enter English title' }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="timeline"
            label="ពេលវេលា / Timeline"
            rules={[{ required: true, message: 'សូមបញ្ចូលពេលវេលា' }]}
          >
            <Input placeholder="ឧ. ត្រីមាសទី 1-4" />
          </Form.Item>

          <Form.Item
            name="activities_text"
            label="សកម្មភាព / Activities (ជម្រើស)"
          >
            <TextArea rows={3} placeholder="ពិពណ៌នាសកម្មភាពដែលត្រូវធ្វើ..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setShowEditDeliverableModal(false)
                setEditingDeliverable(null)
                deliverableForm.resetFields()
              }}>
                បោះបង់
              </Button>
              <Button type="primary" htmlType="submit" loading={processing} icon={<SaveOutlined />}>
                រក្សាទុក
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Option Modal */}
      <Modal
        title={
          <span className="font-hanuman">
            កែប្រែជម្រើស {editingOption?.option_number}
          </span>
        }
        open={showEditOptionModal}
        onCancel={() => {
          setShowEditOptionModal(false)
          setEditingOption(null)
          optionForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={optionForm}
          layout="vertical"
          onFinish={handleUpdateOption}
        >
          <Alert
            message="កំណត់ចំណាំ"
            description="ការផ្លាស់ប្តូរអត្ថបទជម្រើសនឹងមានផលភ្លាមៗលើទំព័រកំណត់រចនាសម្ព័ន្ធរបស់ដៃគូ"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {editingOption && (
            <Alert
              message={
                <Space>
                  <CheckCircleOutlined />
                  <Text>
                    ជម្រើស {editingOption.option_number}
                    {editingOption.baseline_percentage !== null && editingOption.target_percentage !== null && (
                      <Tag color="purple" style={{ marginLeft: 8 }}>
                        {editingOption.baseline_percentage}% → {editingOption.target_percentage}%
                      </Tag>
                    )}
                  </Text>
                </Space>
              }
              type="success"
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="option_text_khmer"
            label="អត្ថបទជម្រើសខ្មែរ"
            rules={[{ required: true, message: 'សូមបញ្ចូលអត្ថបទខ្មែរ' }]}
          >
            <TextArea rows={4} className="font-hanuman" />
          </Form.Item>

          <Form.Item
            name="option_text_english"
            label="Option Text (English)"
            rules={[{ required: true, message: 'Please enter English text' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Divider orientation="left">គោលដៅ / Target Percentages (ជម្រើស)</Divider>

          <Alert
            message="ព័ត៌មាន"
            description="បើជម្រើសនេះមិនមានគោលដៅ (គ្មានលេខភាគរយ) អ្នកអាចទុកទទេ។ បើមាន សូមបញ្ចូលភាគរយមូលដ្ឋាន និងភាគរយគោលដៅ។"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="baseline_percentage"
              label="Baseline % (មូលដ្ឋាន)"
              style={{ flex: 1 }}
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="ឧ. 36"
                addonAfter="%"
              />
            </Form.Item>

            <Form.Item
              name="target_percentage"
              label="Target % (គោលដៅ)"
              style={{ flex: 1 }}
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="ឧ. 46"
                addonAfter="%"
              />
            </Form.Item>
          </Space>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setShowEditOptionModal(false)
                setEditingOption(null)
                optionForm.resetFields()
              }}>
                បោះបង់
              </Button>
              <Button type="primary" htmlType="submit" loading={processing} icon={<SaveOutlined />}>
                រក្សាទុក
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
