'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Button, Select, Space, Modal, Form, Input, InputNumber, message, Spin, Tag, Typography, Collapse, Badge, Popconfirm, Layout, Menu, Dropdown, Avatar, Row, Col, App } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, ReloadOutlined, DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'

const { Title, Text } = Typography
const { TextArea } = Input
const { Panel } = Collapse
const { Sider, Content, Header } = Layout

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
  const router = useRouter()
  const { message: antMessage } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
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
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDeliverables()
    }
  }, [user])

  useEffect(() => {
    if (selectedContractType === 'all') {
      setFilteredDeliverables(deliverables)
    } else {
      setFilteredDeliverables(deliverables.filter(d => d.contract_type === selectedContractType))
    }
  }, [deliverables, selectedContractType])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user?.role !== 'SUPER_ADMIN' && data.user?.role !== 'ADMIN' && data.user?.role !== 'COORDINATOR') {
          antMessage.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ')
          router.push('/dashboard')
          return
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        antMessage.success('ចាកចេញដោយជោគជ័យ')
        router.push('/login')
      }
    } catch (error) {
      antMessage.error('មានបញ្ហាក្នុងការចាកចេញ')
    }
  }

  // Sidebar menu items
  const getSidebarMenuItems = () => {
    const baseItems = [
      {
        key: 'overview',
        icon: <DashboardOutlined />,
        label: 'ទិដ្ឋភាពទូទៅ',
        onClick: () => router.push('/dashboard')
      },
      {
        key: 'indicators',
        icon: <FundProjectionScreenOutlined />,
        label: 'សូចនាករ',
        onClick: () => router.push('/indicators')
      },
      // Hidden: Activities page
      // {
      //   key: 'activities',
      //   icon: <ProjectOutlined />,
      //   label: 'សកម្មភាព',
      // },
      // Hidden: Milestones page
      // {
      //   key: 'milestones',
      //   icon: <CalendarOutlined />,
      //   label: 'ចំណុចសំខាន់',
      // },
      {
        key: 'contracts',
        icon: <FileTextOutlined />,
        label: 'កិច្ចសន្យារបស់ខ្ញុំ',
        onClick: () => router.push('/contracts')
      },
    ];

    const adminItems: any[] = [];

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'COORDINATOR') {
      adminItems.push({
        type: 'divider',
      });
      adminItems.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'ការគ្រប់គ្រង',
        children: [
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'manage-users',
            icon: <TeamOutlined />,
            label: 'អ្នកប្រើប្រាស់',
            onClick: () => router.push('/admin/users')
          }] : []),
          {
            key: 'content-management',
            icon: <FileTextOutlined />,
            label: 'ខ្លឹមសារ',
            onClick: () => router.push('/admin/content-management')
          },
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'deliverables-content',
            icon: <EditOutlined />,
            label: 'កែខ្លឹមសារសមិទ្ធកម្ម',
            onClick: () => router.push('/admin/deliverables-content')
          }] : []),
          {
            key: 'deliverables-management',
            icon: <FormOutlined />,
            label: 'សមិទ្ធកម្ម',
            onClick: () => router.push('/admin/deliverables-management')
          },
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'reconfig-requests',
            icon: <BellOutlined />,
            label: 'សំណើផ្លាស់ប្តូរ',
            onClick: () => router.push('/admin/reconfiguration-requests')
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'indicators-rules',
            icon: <EditOutlined />,
            label: 'កែវិធីគណនាសូចនាករ',
            onClick: () => router.push('/admin/indicators-rules')
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-4',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៤',
            onClick: () => router.push('/admin/agreement/4')
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-5',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៥',
            onClick: () => router.push('/admin/agreement/5')
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-4',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៤',
            onClick: () => router.push('/admin/configure-contract/4')
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-5',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៥',
            onClick: () => router.push('/admin/configure-contract/5')
          }] : []),
        ],
      });
    }

    return [...baseItems, ...adminItems];
  };

  const fetchDeliverables = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/deliverables')
      if (response.ok) {
        const data = await response.json()
        setDeliverables(data.deliverables)
      } else {
        antMessage.error('មិនអាចទាញយកទិន្នន័យបាន')
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
      antMessage.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
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
        antMessage.success('បានកែប្រែសមិទ្ធកម្មដោយជោគជ័យ')
        setShowEditDeliverableModal(false)
        setEditingDeliverable(null)
        deliverableForm.resetFields()
        fetchDeliverables()
      } else {
        const data = await response.json()
        antMessage.error(data.error || 'មានបញ្ហាក្នុងការកែប្រែ')
      }
    } catch (error) {
      console.error('Update error:', error)
      antMessage.error('មានបញ្ហាក្នុងការតភ្ជាប់')
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
        antMessage.success('បានកែប្រែជម្រើសដោយជោគជ័យ')
        setShowEditOptionModal(false)
        setEditingOption(null)
        optionForm.resetFields()
        fetchDeliverables()
      } else {
        const data = await response.json()
        antMessage.error(data.error || 'មានបញ្ហាក្នុងការកែប្រែ')
      }
    } catch (error) {
      console.error('Update option error:', error)
      antMessage.error('មានបញ្ហាក្នុងការតភ្ជាប់')
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
    <Layout style={{ minHeight: '100vh' }}>
      {/* Light Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={64}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px'
        }}>
          {collapsed ? (
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>P</div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>PLP M&E</div>
          )}
        </div>
        <Menu
          theme="light"
          selectedKeys={['deliverables-management']}
          defaultOpenKeys={['admin']}
          mode="inline"
          items={getSidebarMenuItems()}
          style={{
            border: 'none',
            fontSize: 14
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s', background: '#f5f5f5' }}>
        {/* Header */}
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          height: 64,
          lineHeight: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <Row justify="space-between" align="middle" style={{ height: '100%' }}>
            <Col>
              <Title level={4} style={{ margin: 0, fontFamily: 'Hanuman', color: '#262626' }}>
                គ្រប់គ្រងសមិទ្ធកម្ម និងជម្រើស
              </Title>
            </Col>

            {/* User Profile Dropdown */}
            <Col>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: <span className="font-hanuman">ព័ត៌មានផ្ទាល់ខ្លួន</span>,
                    },
                    {
                      key: 'change-password',
                      icon: <KeyOutlined />,
                      label: <span className="font-hanuman">ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>,
                    },
                    { type: 'divider' },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: <span className="font-hanuman">ចាកចេញ</span>,
                      onClick: handleLogout,
                      danger: true
                    }
                  ]
                }}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  style={{
                    height: 48,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Avatar icon={<UserOutlined />} size={32} style={{ background: '#1890ff' }} />
                  <div style={{ textAlign: 'left', display: collapsed ? 'none' : 'block' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', fontFamily: 'Hanuman' }}>
                      {user?.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'Hanuman' }}>
                      {user?.role}
                    </div>
                  </div>
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </Header>

        {/* Main Content */}
        <Content style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Card style={{
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
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
        </Content>
      </Layout>

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
    </Layout>
  )
}
