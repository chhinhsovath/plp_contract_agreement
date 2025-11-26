'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Tag, Space, Button, message, Popconfirm, App, Progress, Layout, Menu, Typography, Dropdown, Avatar, Row, Col, Spin, Select, Input, Form } from 'antd'
import { EditOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, ArrowLeftOutlined, DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, FileTextOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'
import IndicatorForm from '../dashboard/components/IndicatorForm'
import DataCollectionForm from '../dashboard/components/DataCollectionForm'
import { useContent } from '@/lib/hooks/useContent'

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography

export default function IndicatorsPage() {
  const router = useRouter()
  const { t, loading: contentLoading } = useContent()
  const { message: antMessage } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [indicators, setIndicators] = useState<any[]>([])
  const [showIndicatorForm, setShowIndicatorForm] = useState(false)
  const [showDataCollectionForm, setShowDataCollectionForm] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<any>(null)
  const [selectedIndicatorForData, setSelectedIndicatorForData] = useState<number | undefined>(undefined)
  const [pageSize, setPageSize] = useState(10)
  const [collapsed, setCollapsed] = useState(false)
  const [selectedContract, setSelectedContract] = useState<number | null>(null)
  const [editingIndicatorId, setEditingIndicatorId] = useState<number | null>(null)
  const [editForm] = Form.useForm()

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user) {
      // Auto-select contract type for PARTNER users
      if (user.role === UserRole.PARTNER && user.contract_type) {
        setSelectedContract(user.contract_type)
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchIndicators()
    }
  }, [user, selectedContract])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/login')
    }
  }

  const fetchIndicators = async () => {
    setLoading(true)
    try {
      const params = selectedContract ? `?contractType=${selectedContract}` : ''
      const response = await fetch(`/api/me/indicators${params}`)
      if (response.ok) {
        const data = await response.json()
        setIndicators(data.indicators || [])
      }
    } catch (error) {
      console.error('Failed to fetch indicators:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditIndicator = (indicator: any) => {
    setEditingIndicator(indicator)
    setShowIndicatorForm(true)
  }

  const handleDeleteIndicator = async (id: number) => {
    try {
      const response = await fetch(`/api/me/indicators/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        antMessage.success(t('dashboard_indicator_deleted'))
        fetchIndicators()
      } else {
        antMessage.error(t('dashboard_indicator_delete_error'))
      }
    } catch (error) {
      antMessage.error(t('dashboard_indicator_delete_error'))
    }
  }

  const handleAddDataCollection = (indicatorId: number) => {
    setSelectedIndicatorForData(indicatorId)
    setShowDataCollectionForm(true)
  }

  const handleEditInline = (indicator: any) => {
    setEditingIndicatorId(indicator.id)
    editForm.setFieldsValue({
      indicator_name_khmer: indicator.indicator_name_khmer,
      indicator_name_english: indicator.indicator_name_english
    })
  }

  const handleSaveInline = async (indicatorId: number) => {
    try {
      const values = await editForm.validateFields()

      const response = await fetch(`/api/me/indicators/${indicatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicator_name_khmer: values.indicator_name_khmer,
          indicator_name_english: values.indicator_name_english
        })
      })

      if (response.ok) {
        antMessage.success('បានរក្សាទុក')
        setEditingIndicatorId(null)
        editForm.resetFields()
        fetchIndicators()
      } else {
        antMessage.error('Failed to update')
      }
    } catch (error) {
      antMessage.error('Failed to save')
    }
  }

  const handleCancelInline = () => {
    setEditingIndicatorId(null)
    editForm.resetFields()
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        antMessage.success(t('dashboard_logout_success'))
        router.push('/login')
      }
    } catch (error) {
      antMessage.error(t('dashboard_logout_error'))
    }
  }

  // Sidebar menu items
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
        label: t('dashboard_tab_indicators') || 'សូចនាករ',
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
      //   label: t('dashboard_tab_milestones') || 'ចំណុចសំខាន់',
      // },
      {
        key: 'contracts',
        icon: <FileTextOutlined />,
        label: t('dashboard_tab_contracts') || 'កិច្ចសន្យារបស់ខ្ញុំ',
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
      });
    }

    return [...baseItems, ...adminItems];
  };

  // Handle menu click
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'overview') {
      router.push('/dashboard');
    } else if (key === 'indicators') {
      router.push('/indicators');
    } else if (key === 'activities') {
      router.push('/activities');
    } else if (key === 'milestones') {
      router.push('/milestones');
    } else if (key === 'contracts') {
      router.push('/contracts');
    } else if (key === 'manage-users') {
      router.push('/admin/users');
    } else if (key === 'content-management') {
      router.push('/admin/content-management');
    } else if (key === 'deliverables-content') {
      router.push('/admin/deliverables-content');
    } else if (key === 'deliverables-management') {
      router.push('/admin/deliverables-management');
    } else if (key === 'reconfig-requests') {
      router.push('/admin/reconfiguration-requests');
    } else if (key === 'edit-agreement-4') {
      router.push('/admin/agreement/4');
    } else if (key === 'edit-agreement-5') {
      router.push('/admin/agreement/5');
    } else if (key === 'edit-configure-4') {
      router.push('/admin/configure-contract/4');
    } else if (key === 'edit-configure-5') {
      router.push('/admin/configure-contract/5');
    }
  };

  // Format indicators data for table
  const indicatorsData = indicators.map((ind) => ({
    key: ind.id,
    code: ind.indicator_code,
    name: ind.indicator_name_khmer,
    name_english: ind.indicator_name_english,
    type: ind.indicator_type,
    baseline: ind.baseline_value,
    target: ind.target_value,
    current: ind.current_value,
    unit: ind.measurement_unit,
    frequency: ind.frequency,
    progress: ind.progress,
    status: ind.status,
    // Include all original fields for editing
    id: ind.id,
    indicator_code: ind.indicator_code,
    indicator_name_khmer: ind.indicator_name_khmer,
    indicator_name_english: ind.indicator_name_english,
    indicator_type: ind.indicator_type,
    measurement_unit: ind.measurement_unit,
    baseline_value: ind.baseline_value,
    target_value: ind.target_value,
    contract_type: ind.contract_type,
    description: ind.description
  }))

  const indicatorColumns = [
    {
      title: t('dashboard_indicator_code'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left' as const
    },
    {
      title: t('dashboard_indicator_name'),
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (text: string, record: any) => {
        const isEditing = editingIndicatorId === record.id
        const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

        if (isEditing) {
          return (
            <Form form={editForm} layout="inline">
              <Form.Item
                name="indicator_name_khmer"
                style={{ marginBottom: 0, marginRight: 8, width: 200 }}
                rules={[{ required: true }]}
              >
                <Input size="small" placeholder="ឈ្មោះខ្មែរ" />
              </Form.Item>
              <Form.Item
                name="indicator_name_english"
                style={{ marginBottom: 0, marginRight: 8, width: 150 }}
              >
                <Input size="small" placeholder="English name" />
              </Form.Item>
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleSaveInline(record.id)}
                />
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={handleCancelInline}
                />
              </Space>
            </Form>
          )
        }

        return (
          <Space>
            <Text style={{ fontFamily: 'Hanuman' }}>{text}</Text>
            {isSuperAdmin && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditInline(record)}
              />
            )}
          </Space>
        )
      }
    },
    {
      title: t('dashboard_indicator_type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'output': 'blue',
          'outcome': 'green',
          'impact': 'purple',
          'process': 'orange'
        }
        return (
          <Tag color={colorMap[type] || 'blue'}>
            {t(`indicator_type_${type}`, type)}
          </Tag>
        )
      }
    },
    {
      title: t('dashboard_baseline'),
      dataIndex: 'baseline',
      key: 'baseline',
      width: 100,
      align: 'center' as const
    },
    {
      title: t('dashboard_target'),
      dataIndex: 'target',
      key: 'target',
      width: 100,
      align: 'center' as const
    },
    {
      title: t('dashboard_progress'),
      key: 'progress',
      width: 150,
      render: (record: any) => (
        <Progress
          percent={record.progress}
          size="small"
          status={
            record.status === 'achieved' ? 'success' :
            record.status === 'at-risk' ? 'exception' : 'active'
          }
        />
      )
    },
    {
      title: t('dashboard_status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'achieved': 'success',
          'on-track': 'processing',
          'delayed': 'warning',
          'at-risk': 'error'
        }
        return (
          <Tag color={colorMap[status] || 'default'}>
            {t(`status_${status.replace('-', '_')}`, status)}
          </Tag>
        )
      }
    },
    {
      title: t('dashboard_actions'),
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<SaveOutlined />}
            onClick={() => handleAddDataCollection(record.key)}
          >
            {t('dashboard_input_data')}
          </Button>
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditIndicator(record)}
              />
              {user?.role === UserRole.SUPER_ADMIN && (
                <Popconfirm
                  title={t('dashboard_delete_indicator_confirm')}
                  onConfirm={() => handleDeleteIndicator(record.key)}
                  okText={t('dashboard_confirm_yes')}
                  cancelText={t('dashboard_confirm_no')}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  // Show loading spinner while content is loading
  if (contentLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Minimalist Light Sidebar */}
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
          selectedKeys={['indicators']}
          mode="inline"
          items={getSidebarMenuItems()}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            fontSize: 14
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s', background: '#f5f5f5' }}>
        {/* Compact Light Header */}
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
                {t('dashboard_indicators_title') || 'សូចនាករ'}
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
                      label: <span className="font-hanuman">{t('dashboard_menu_profile')}</span>,
                    },
                    {
                      key: 'change-password',
                      icon: <KeyOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_password')}</span>,
                    },
                    // Show Configure Deliverables only for Contract Type 4 & 5
                    ...(user?.contract_type === 4 || user?.contract_type === 5 ? [{
                      key: 'configure-deliverables',
                      icon: <SettingOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_configure')}</span>,
                      onClick: () => router.push('/contract/configure')
                    }] : []),
                    { type: 'divider' },
                    // Admin menu items for SUPER_ADMIN, ADMIN, COORDINATOR
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'manage-users',
                      icon: <TeamOutlined />,
                      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
                      onClick: () => router.push('/admin/users')
                    }] : []),
                    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
                      key: 'content-management',
                      icon: <FileTextOutlined />,
                      label: 'គ្រប់គ្រងខ្លឹមសារ (CMS)',
                      onClick: () => router.push('/admin/content-management')
                    }] : []),
                    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
                      key: 'deliverables-management',
                      icon: <FormOutlined />,
                      label: 'គ្រប់គ្រងសមិទ្ធកម្ម',
                      onClick: () => router.push('/admin/deliverables-management')
                    }] : []),
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'reconfig-requests',
                      icon: <BellOutlined />,
                      label: 'សំណើផ្លាស់ប្តូរសមិទ្ធកម្ម',
                      onClick: () => router.push('/admin/reconfiguration-requests')
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
                    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'COORDINATOR' ? [{ type: 'divider' as const }] : []),
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_logout')}</span>,
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
          {/* Indicators Table Card */}
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    style={{ marginBottom: 8 }}
                  >
                    {t('dashboard_back')}
                  </Button>
                  <Title level={5} style={{ margin: 0, fontFamily: 'Hanuman' }}>
                    <FundProjectionScreenOutlined style={{ marginRight: 8 }} />
                    {t('dashboard_indicators_title')}
                  </Title>
                </div>
                <Space size="middle">
                  {/* Contract Type Filter */}
                  <Space>
                    <Text strong style={{ fontFamily: 'Hanuman' }}>
                      ប្រភេទកិច្ចសន្យា:
                    </Text>
                    <Select
                      style={{ width: 200 }}
                      placeholder="ជ្រើសរើសប្រភេទកិច្ចសន្យា"
                      value={selectedContract}
                      onChange={setSelectedContract}
                      disabled={user?.role === UserRole.PARTNER}
                      allowClear={user?.role !== UserRole.PARTNER}
                    >
                      <Select.Option value={1}>PMU-PCU</Select.Option>
                      <Select.Option value={2}>PCU-Project Manager</Select.Option>
                      <Select.Option value={3}>Project Manager-Regional</Select.Option>
                      <Select.Option value={4}>DoE-District Office</Select.Option>
                      <Select.Option value={5}>DoE-School</Select.Option>
                    </Select>
                  </Space>
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingIndicator(null)
                        setShowIndicatorForm(true)
                      }}
                    >
                      {t('dashboard_add_indicator')}
                    </Button>
                  )}
                </Space>
              </div>

              <Table
                columns={indicatorColumns}
                dataSource={indicatorsData}
                loading={loading}
                scroll={{ x: 1400 }}
                pagination={{
                  pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total) => `សរុប ${total} ធាតុ`,
                  onShowSizeChange: (_, size) => setPageSize(size)
                }}
                size="middle"
              />
            </Space>
          </Card>

          {/* Forms */}
          <IndicatorForm
            visible={showIndicatorForm}
            onClose={() => {
              setShowIndicatorForm(false)
              setEditingIndicator(null)
            }}
            onSuccess={() => {
              fetchIndicators()
              setShowIndicatorForm(false)
              setEditingIndicator(null)
            }}
            indicator={editingIndicator}
          />

          <DataCollectionForm
            visible={showDataCollectionForm}
            onClose={() => {
              setShowDataCollectionForm(false)
              setSelectedIndicatorForData(undefined)
            }}
            onSuccess={() => {
              fetchIndicators()
              setShowDataCollectionForm(false)
              setSelectedIndicatorForData(undefined)
            }}
            indicatorId={selectedIndicatorForData}
          />
        </Content>
      </Layout>
    </Layout>
  )
}
