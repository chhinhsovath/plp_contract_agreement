'use client'

import { useState, useEffect } from 'react'
import { Card, Select, Button, Input, Space, Modal, Form, message, Spin, Tag, Typography, Alert, Collapse, Divider, Layout, Menu, Dropdown, Avatar, Row, Col } from 'antd'
import { EditOutlined, FileTextOutlined, ReloadOutlined, SaveOutlined, CheckCircleOutlined, DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'

const { Sider, Content, Header } = Layout
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
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
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
        setUser(data.user)
        if (data.user?.role !== 'SUPER_ADMIN') {
          message.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ')
          router.push('/dashboard')
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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getSidebarMenuItems = () => {
    const baseItems = [
      {
        key: 'overview',
        icon: <DashboardOutlined />,
        label: 'ទិដ្ឋភាពទូទៅ',
      },
      {
        key: 'indicators',
        icon: <FundProjectionScreenOutlined />,
        label: 'សូចនាករ',
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
      },
    ]

    const adminItems: any[] = []

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'COORDINATOR') {
      adminItems.push({
        type: 'divider',
      })
      adminItems.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'ការគ្រប់គ្រង',
        children: [
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'manage-users',
            icon: <TeamOutlined />,
            label: 'អ្នកប្រើប្រាស់',
          }] : []),
          {
            key: 'content-management',
            icon: <FileTextOutlined />,
            label: 'ខ្លឹមសារ',
          },
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'deliverables-content',
            icon: <EditOutlined />,
            label: 'កែខ្លឹមសារសមិទ្ធកម្ម',
          }] : []),
          {
            key: 'deliverables-management',
            icon: <FormOutlined />,
            label: 'សមិទ្ធកម្ម',
          },
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'reconfig-requests',
            icon: <BellOutlined />,
            label: 'សំណើផ្លាស់ប្តូរ',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-4',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៤',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-5',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៥',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-4',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៤',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-5',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៥',
          }] : []),
        ],
      })
    }

    return [...baseItems, ...adminItems]
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'overview') {
      router.push('/dashboard')
    } else if (key === 'indicators') {
      router.push('/indicators')
    } else if (key === 'contracts') {
      router.push('/contracts')
    } else if (key === 'manage-users') {
      router.push('/admin/users')
    } else if (key === 'content-management') {
      router.push('/admin/content-management')
    } else if (key === 'deliverables-content') {
      router.push('/admin/deliverables-content')
    } else if (key === 'deliverables-management') {
      router.push('/admin/deliverables-management')
    } else if (key === 'reconfig-requests') {
      router.push('/admin/reconfiguration-requests')
    } else if (key === 'edit-agreement-4') {
      router.push('/admin/agreement/4')
    } else if (key === 'edit-agreement-5') {
      router.push('/admin/agreement/5')
    } else if (key === 'edit-configure-4') {
      router.push('/admin/configure-contract/4')
    } else if (key === 'edit-configure-5') {
      router.push('/admin/configure-contract/5')
    }
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
    <Layout style={{ minHeight: '100vh' }}>
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
          mode="inline"
          selectedKeys={['deliverables-content']}
          defaultOpenKeys={['admin']}
          items={getSidebarMenuItems()}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            fontSize: 14
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s', background: '#f5f5f5' }}>
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
                គ្រប់គ្រងខ្លឹមសារសមិទ្ធកម្ម
              </Title>
            </Col>
            <Col>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: 'ប្រវត្តិរូប',
                    },
                    {
                      key: 'change-password',
                      icon: <KeyOutlined />,
                      label: 'ផ្លាស់ប្តូរលេខសម្ងាត់',
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'ចាកចេញ',
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
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

        <Content style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Alert
        message="ការណែនាំ"
        description="ប្រើទំព័រនេះដើម្បីកែប្រែចំណងជើងសមិទ្ធកម្ម និងអត្ថបទជម្រើសនីមួយៗ។ ការផ្លាស់ប្តូរនឹងមានផលភ្លាមៗលើទំព័រកំណត់រចនាសម្ព័ន្ធ។"
        type="info"
        showIcon
        style={{ marginBottom: 16, borderRadius: 8 }}
      />

      <Card style={{
        marginBottom: 16,
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
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
        </Content>
      </Layout>
    </Layout>
  )
}
