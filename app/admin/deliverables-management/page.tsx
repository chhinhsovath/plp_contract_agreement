'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Button, Select, Space, Modal, Form, Input, InputNumber, message, Spin, Tag, Typography, Collapse, Badge, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons'
import { AdminNav } from '@/components/admin/AdminNav'

const { Title, Text } = Typography
const { TextArea } = Input
const { Panel } = Collapse

interface DeliverableOption {
  id: number
  option_number: number
  option_text_khmer: string
  option_text_english: string | null
  baseline_percentage: number | null
  target_percentage: number | null
  condition_type: string
}

interface Deliverable {
  id: number
  contract_type: number
  deliverable_number: number
  deliverable_title_khmer: string
  deliverable_title_english: string | null
  timeline: string
  activities_text: string | null
  options: DeliverableOption[]
}

export default function DeliverablesManagementPage() {
  const [loading, setLoading] = useState(true)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [filteredDeliverables, setFilteredDeliverables] = useState<Deliverable[]>([])
  const [selectedContractType, setSelectedContractType] = useState<number | 'all'>('all')
  const [showEditDeliverableModal, setShowEditDeliverableModal] = useState(false)
  const [showEditOptionModal, setShowEditOptionModal] = useState(false)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const [editingOption, setEditingOption] = useState<DeliverableOption | null>(null)
  const [processing, setProcessing] = useState(false)
  const [deliverableForm] = Form.useForm()
  const [optionForm] = Form.useForm()

  useEffect(() => {
    fetchDeliverables()
  }, [])

  useEffect(() => {
    if (selectedContractType === 'all') {
      setFilteredDeliverables(deliverables)
    } else {
      setFilteredDeliverables(deliverables.filter(d => d.contract_type === selectedContractType))
    }
  }, [deliverables, selectedContractType])

  const fetchDeliverables = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/deliverables')
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

  const handleEditOption = (option: DeliverableOption, deliverable: Deliverable) => {
    setEditingOption(option)
    setEditingDeliverable(deliverable)
    optionForm.setFieldsValue({
      option_text_khmer: option.option_text_khmer,
      option_text_english: option.option_text_english,
      baseline_percentage: option.baseline_percentage,
      target_percentage: option.target_percentage,
      condition_type: option.condition_type
    })
    setShowEditOptionModal(true)
  }

  const handleUpdateDeliverable = async (values: any) => {
    if (!editingDeliverable) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/deliverables/${editingDeliverable.id}`, {
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
      const response = await fetch(`/api/admin/deliverable-options/${editingOption.id}`, {
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
      console.error('Update option error:', error)
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
    <div style={{ padding: 24 }}>
      <AdminNav />

      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: 12 }} />
          គ្រប់គ្រងសមិទ្ធកម្ម និងជម្រើស (Deliverables & Options)
        </Title>
        <Text type="secondary">
          គ្រប់គ្រងសមិទ្ធកម្ម និងជម្រើសសម្រាប់កិច្ចសន្យាទាំង ៥ ប្រភេទ - សរុប {deliverables.length} សមិទ្ធកម្ម
        </Text>
      </Card>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <Space>
              <Text strong>ប្រភេទកិច្ចសន្យា:</Text>
              <Select
                value={selectedContractType}
                onChange={setSelectedContractType}
                style={{ width: 200 }}
                options={[
                  { label: 'ទាំងអស់', value: 'all' },
                  { label: 'ប្រភេទ 1 (PMU-PCU)', value: 1 },
                  { label: 'ប្រភេទ 2 (PCU-PM)', value: 2 },
                  { label: 'ប្រភេទ 3 (PM-Regional)', value: 3 },
                  { label: 'ប្រភេទ 4 (Provincial-District)', value: 4 },
                  { label: 'ប្រភេទ 5 (Provincial-School)', value: 5 }
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchDeliverables}>
                ផ្ទុកឡើងវិញ
              </Button>
            </Space>
          </div>

          {/* Deliverables List with Nested Options */}
          <Collapse accordion>
            {filteredDeliverables.map((deliverable) => (
              <Panel
                key={deliverable.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space>
                      <Tag color="blue">ប្រភេទ {deliverable.contract_type}</Tag>
                      <Badge count={deliverable.deliverable_number} style={{ backgroundColor: '#52c41a' }} />
                      <Text strong className="font-hanuman">{deliverable.deliverable_title_khmer}</Text>
                    </Space>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditDeliverable(deliverable)
                      }}
                    >
                      កែប្រែ
                    </Button>
                  </div>
                }
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Deliverable Details */}
                  <div>
                    <Text type="secondary">ពេលវេលា: {deliverable.timeline}</Text>
                    {deliverable.activities_text && (
                      <>
                        <br />
                        <Text type="secondary">សកម្មភាព: {deliverable.activities_text}</Text>
                      </>
                    )}
                  </div>

                  {/* Options Table */}
                  <Card type="inner" title={`ជម្រើស (${deliverable.options.length})`}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {deliverable.options.map((option) => (
                        <Card
                          key={option.id}
                          size="small"
                          style={{ background: '#fafafa' }}
                          extra={
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditOption(option, deliverable)}
                            >
                              កែប្រែ
                            </Button>
                          }
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div>
                              <Tag color="purple">ជម្រើស {option.option_number}</Tag>
                              <Text className="font-hanuman">{option.option_text_khmer}</Text>
                            </div>
                            {option.option_text_english && (
                              <Text type="secondary" italic>{option.option_text_english}</Text>
                            )}
                            {option.baseline_percentage !== null && option.target_percentage !== null && (
                              <Text type="success">
                                មូលដ្ឋាន: {option.baseline_percentage}% → គោលដៅ: {option.target_percentage}%
                              </Text>
                            )}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              លក្ខណៈ: {option.condition_type}
                            </Text>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  </Card>
                </Space>
              </Panel>
            ))}
          </Collapse>
        </Space>
      </Card>

      {/* Edit Deliverable Modal */}
      <Modal
        title={<span className="font-hanuman">កែប្រែសមិទ្ធកម្ម</span>}
        open={showEditDeliverableModal}
        onCancel={() => {
          setShowEditDeliverableModal(false)
          setEditingDeliverable(null)
          deliverableForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        {editingDeliverable && (
          <Form form={deliverableForm} layout="vertical" onFinish={handleUpdateDeliverable}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">ប្រភេទកិច្ចសន្យា {editingDeliverable.contract_type}</Tag>
              <Tag color="green">សមិទ្ធកម្មទី {editingDeliverable.deliverable_number}</Tag>
            </div>

            <Form.Item
              name="deliverable_title_khmer"
              label="ចំណងជើងសមិទ្ធកម្ម (ខ្មែរ)"
              rules={[{ required: true, message: 'សូមបញ្ចូលចំណងជើង' }]}
            >
              <TextArea rows={2} className="font-hanuman" />
            </Form.Item>

            <Form.Item name="deliverable_title_english" label="ចំណងជើងសមិទ្ធកម្ម (English)">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name="timeline" label="ពេលវេលាអនុវត្ត">
              <Input placeholder="ឧ. ខែមករា - ខែមីនា ២០២៦" />
            </Form.Item>

            <Form.Item name="activities_text" label="សកម្មភាព (ស្រេចចិត្ត)">
              <TextArea rows={3} className="font-hanuman" />
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
                <Button type="primary" htmlType="submit" loading={processing}>
                  រក្សាទុក
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Edit Option Modal */}
      <Modal
        title={<span className="font-hanuman">កែប្រែជម្រើស</span>}
        open={showEditOptionModal}
        onCancel={() => {
          setShowEditOptionModal(false)
          setEditingOption(null)
          optionForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        {editingOption && editingDeliverable && (
          <Form form={optionForm} layout="vertical" onFinish={handleUpdateOption}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">ប្រភេទ {editingDeliverable.contract_type}</Tag>
              <Tag color="green">សមិទ្ធកម្ម {editingDeliverable.deliverable_number}</Tag>
              <Tag color="purple">ជម្រើស {editingOption.option_number}</Tag>
            </div>

            <Form.Item
              name="option_text_khmer"
              label="អត្ថបទជម្រើស (ខ្មែរ)"
              rules={[{ required: true, message: 'សូមបញ្ចូលអត្ថបទ' }]}
            >
              <TextArea rows={3} className="font-hanuman" />
            </Form.Item>

            <Form.Item name="option_text_english" label="អត្ថបទជម្រើស (English)">
              <TextArea rows={3} />
            </Form.Item>

            <Space style={{ width: '100%' }}>
              <Form.Item
                name="baseline_percentage"
                label="ភាគរយមូលដ្ឋាន (%)"
                style={{ width: 200 }}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="target_percentage"
                label="ភាគរយគោលដៅ (%)"
                style={{ width: 200 }}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Space>

            <Form.Item
              name="condition_type"
              label="ប្រភេទលក្ខខណ្ឌ"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: 'តិច', value: 'low' },
                  { label: 'មធ្យម', value: 'medium' },
                  { label: 'ខ្ពស់', value: 'high' },
                  { label: 'ថេរ', value: 'maintain' }
                ]}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => {
                  setShowEditOptionModal(false)
                  setEditingOption(null)
                  optionForm.resetFields()
                }}>
                  បោះបង់
                </Button>
                <Button type="primary" htmlType="submit" loading={processing}>
                  រក្សាទុក
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
