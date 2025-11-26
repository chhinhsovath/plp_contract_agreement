'use client'

import { useState, useEffect, use } from 'react'
import { Card, Button, Typography, Spin, Alert, Space, Tag, Breadcrumb, Divider, Layout, Menu, Avatar, Dropdown, Row, Col, App } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, HomeOutlined, EditOutlined, DashboardOutlined, UserOutlined, LogoutOutlined, KeyOutlined, SettingOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, TeamOutlined, BellOutlined, FormOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useContent } from '@/lib/hooks/useContent'
import { EditableContent } from '@/components/EditableContent'
import { UserRole } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography
const { Sider, Content, Header } = Layout

export default function AdminConfigureContractPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { t, refresh } = useContent()
  const { message } = App.useApp()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenuKey, setSelectedMenuKey] = useState('edit-configure')

  const contractType = parseInt(resolvedParams.type)
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  // Only Types 4 and 5 are supported
  const isValidType = contractType === 4 || contractType === 5

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Only SUPER_ADMIN can access
        if (userData.role !== UserRole.SUPER_ADMIN) {
          router.push('/')
          return
        }

        setUser(userData)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleContentUpdate = () => {
    refresh() // Reload content from hook
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        message.success('ចាកចេញដោយជោគជ័យ')
        router.push('/login')
      }
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការចាកចេញ')
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
      //   onClick: () => router.push('/activities')
      // },
      // Hidden: Milestones page
      // {
      //   key: 'milestones',
      //   icon: <CalendarOutlined />,
      //   label: 'ចំណុចសំខាន់',
      //   onClick: () => router.push('/milestones')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!isValidType) {
    return (
      <div className="min-h-screen p-6">
        <Alert
          message="កំហុស"
          description={`ប្រភេទកិច្ចសន្យាមិនត្រឹមត្រូវ។ មានតែប្រភេទ 4 និង 5 ទេដែលអាចកែសម្រួលបាន។`}
          type="error"
          showIcon
        />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen p-6">
        <Alert
          message="មិនមានសិទ្ធិចូលប្រើ"
          description="មានតែ SUPER_ADMIN ទេដែលអាចចូលប្រើទំព័រនេះបាន"
          type="error"
          showIcon
        />
      </div>
    )
  }

  const contractTypeName = contractType === 4
    ? 'កិច្ចព្រមព្រៀងនាយកដ្ឋាន-ស្រុក (Provincial-District)'
    : 'កិច្ចព្រមព្រៀងនាយកដ្ឋាន-សាលា (Provincial-School)'

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
          selectedKeys={[`edit-configure-${contractType}`]}
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
                កែសម្រួលទំព័រកំណត់រចនាសម្ព័ន្ធ - ប្រភេទ {contractType}
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
          {/* Breadcrumb */}
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[
              {
                title: (
                  <a onClick={() => router.push('/dashboard')}>
                    <HomeOutlined /> ទំព័រដើម
                  </a>
                )
              },
              {
                title: 'កែសម្រួលទំព័រកំណត់រចនាសម្ព័ន្ធ'
              },
              {
                title: `ប្រភេទ ${contractType}`
              }
            ]}
          />

          {/* Header Card */}
          <Card style={{
            marginBottom: 16,
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="flex items-center justify-between">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/dashboard')}
                >
                  ត្រលប់ក្រោយ
                </Button>
                <Tag color="blue">SUPER ADMIN - កែសម្រួលបាន</Tag>
              </div>

              <div className="text-center">
                <Title level={2} className="font-hanuman text-blue-800 mb-3">
                  <EditOutlined className="mr-3" />
                  កែសម្រួលទំព័រកំណត់រចនាសម្ព័ន្ធ
                </Title>
                <Text className="font-hanuman text-gray-600 text-lg">
                  {contractTypeName}
                </Text>
              </div>

              <Alert
                message="របៀបប្រើប្រាស់"
                description={
                  <ul className="font-hanuman list-disc ml-5 mt-2">
                    <li>ចង្អុលទៅលើខ្លឹមសារ → ឃើញពណ៌លឿង និងរូបតារ ✏️</li>
                    <li>ចុចលើខ្លឹមសារ → បើកផ្ទាំងកែសម្រួល</li>
                    <li>កែខ្លឹមសារ → ចុច "រក្សាទុក"</li>
                    <li>ទំព័រនឹងផ្ទុកឡើងវិញដោយស្វ័យប្រវត្តិដើម្បីបង្ហាញការផ្លាស់ប្តូរ</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Space>
          </Card>

        {/* Configuration Page Content Preview */}
        <Card style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <div className="p-6 lg:p-8 bg-white">
            <div className="prose max-w-none font-hanuman">

              {/* Page Title and Subtitle */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <Title level={3} className="text-center mb-4">
                  <EditableContent
                    contentKey="contract_configure_page_title"
                    isAdmin={isSuperAdmin}
                    label="ចំណងជើងទំព័រ"
                    onUpdate={handleContentUpdate}
                  >
                    {t('contract_configure_page_title')}
                  </EditableContent>
                </Title>
                <Paragraph className="text-center text-base">
                  <EditableContent
                    contentKey="contract_configure_subtitle"
                    isAdmin={isSuperAdmin}
                    label="ចំណងជើងរង"
                    multiline
                    onUpdate={handleContentUpdate}
                  >
                    {t('contract_configure_subtitle')}
                  </EditableContent>
                </Paragraph>
              </div>

              <Divider orientation="left">ព័ត៌មានផ្សេងៗ / Alert Messages</Divider>

              {/* Alert Message */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Text strong className="block mb-2">ការណែនាំ:</Text>
                <EditableContent
                  contentKey="contract_configure_alert_message"
                  isAdmin={isSuperAdmin}
                  label="សារព្រមាន"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('contract_configure_alert_message')}
                </EditableContent>
              </div>

              <Divider orientation="left">ស្លាកសមិទ្ធកម្ម / Deliverable Labels</Divider>

              {/* Deliverable Labels */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag color="blue">Label 1</Tag>
                    <EditableContent
                      contentKey="contract_configure_deliverable_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកសមិទ្ធកម្ម"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_deliverable_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="green">Label 2</Tag>
                    <EditableContent
                      contentKey="contract_configure_activities_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកសកម្មភាព"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_activities_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="purple">Label 3</Tag>
                    <EditableContent
                      contentKey="contract_configure_timeline_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកពេលវេលា"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_timeline_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="orange">Label 4</Tag>
                    <EditableContent
                      contentKey="contract_configure_select_option_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកជ្រើសរើសជម្រើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_select_option_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="red">Label 5</Tag>
                    <EditableContent
                      contentKey="contract_configure_option_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកជម្រើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_option_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="cyan">Label 6</Tag>
                    <EditableContent
                      contentKey="contract_configure_target_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកគោលដៅ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_target_label')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              <Divider orientation="left">ស្លាកទិន្នន័យមូលដ្ឋាន / Baseline Labels</Divider>

              {/* Baseline Information Labels */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag>Title</Tag>
                    <EditableContent
                      contentKey="configure_baseline_info_title"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងព័ត៌មានមូលដ្ឋាន"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_info_title')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 1</Tag>
                    <EditableContent
                      contentKey="configure_baseline_percentage_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកភាគរយមូលដ្ឋាន"
                      multiline
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_percentage_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 2</Tag>
                    <EditableContent
                      contentKey="configure_baseline_source_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកប្រភពមូលដ្ឋាន"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_source_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 3</Tag>
                    <EditableContent
                      contentKey="configure_baseline_date_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកកាលបរិច្ឆេទមូលដ្ឋាន"
                      multiline
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_date_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 4</Tag>
                    <EditableContent
                      contentKey="configure_baseline_notes_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកចំណាំមូលដ្ឋាន"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_notes_label')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              {contractType === 5 && (
                <>
                  <Divider orientation="left">សំណួរ Yes/No (សម្រាប់ប្រភេទ 5 ប៉ុណ្ណោះ)</Divider>

                  <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Tag color="magenta">Question</Tag>
                        <EditableContent
                          contentKey="configure_yesno_question"
                          isAdmin={isSuperAdmin}
                          label="សំណួរ Yes/No"
                          onUpdate={handleContentUpdate}
                        >
                          {t('configure_yesno_question')}
                        </EditableContent>
                      </div>

                      <div>
                        <Tag color="green">Yes Option</Tag>
                        <EditableContent
                          contentKey="configure_yes_option"
                          isAdmin={isSuperAdmin}
                          label="ជម្រើស បាទ/ចាស"
                          onUpdate={handleContentUpdate}
                        >
                          {t('configure_yes_option')}
                        </EditableContent>
                      </div>

                      <div>
                        <Tag color="red">No Option</Tag>
                        <EditableContent
                          contentKey="configure_no_option"
                          isAdmin={isSuperAdmin}
                          label="ជម្រើស ទេ"
                          onUpdate={handleContentUpdate}
                        >
                          {t('configure_no_option')}
                        </EditableContent>
                      </div>
                    </Space>
                  </div>
                </>
              )}

              <Divider orientation="left">ប៊ូតុងផ្សេងៗ / Button Labels</Divider>

              {/* Button Labels */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag color="default">Button 1</Tag>
                    <EditableContent
                      contentKey="contract_configure_back_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងត្រលប់ក្រោយ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_back_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="blue">Button 2</Tag>
                    <EditableContent
                      contentKey="contract_configure_next_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងបន្ទាប់"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_next_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="green">Button 3</Tag>
                    <EditableContent
                      contentKey="contract_configure_submit_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងដាក់ស្នើ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_submit_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="orange">Button 4</Tag>
                    <EditableContent
                      contentKey="contract_configure_request_change_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងស្នើសុំផ្លាស់ប្តូរ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_request_change_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="purple">Button 5</Tag>
                    <EditableContent
                      contentKey="contract_configure_return_dashboard_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងត្រលប់ទៅផ្ទាំងគ្រប់គ្រង"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_return_dashboard_button')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              <Divider orientation="left">ទិដ្ឋភាពមើល / View Mode Labels</Divider>

              {/* View Mode Labels */}
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag>Title</Tag>
                    <EditableContent
                      contentKey="contract_configure_view_title"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងទិដ្ឋភាពមើល"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_view_title')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Subtitle</Tag>
                    <EditableContent
                      contentKey="contract_configure_view_subtitle"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងរងទិដ្ឋភាពមើល"
                      multiline
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_view_subtitle')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Section Title</Tag>
                    <EditableContent
                      contentKey="configure_selected_deliverables_title"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងសមិទ្ធកម្មដែលបានជ្រើសរើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_selected_deliverables_title')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Selected Label</Tag>
                    <EditableContent
                      contentKey="configure_selected_option_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកជម្រើសដែលបានជ្រើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_selected_option_label')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              {/* Info Note */}
              <Alert
                message="ចំណាំសំខាន់"
                description={
                  <div className="font-hanuman">
                    <p>ខ្លឹមសារទាំងអស់ខាងលើនឹងត្រូវបានបង្ហាញនៅលើទំព័រកំណត់រចនាសម្ព័ន្ធ (/contract/configure) សម្រាប់អ្នកប្រើប្រាស់ដែលមានកិច្ចសន្យាប្រភេទ {contractType}។</p>
                    <p className="mt-2 mb-0">ការផ្លាស់ប្តូរដែលអ្នកធ្វើនៅទីនេះនឹងមានប្រសិទ្ធភាពភ្លាមៗ។</p>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginTop: 24 }}
              />
            </div>
          </div>
        </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
