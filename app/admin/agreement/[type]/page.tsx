'use client'

import { useState, useEffect, use } from 'react'
import { Card, Button, Typography, Divider, Spin, Alert, Space, Tag, Breadcrumb, Layout, Menu, Dropdown, Avatar, Row, Col } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, HomeOutlined, DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined, EditOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { contractTemplates } from '@/lib/contractTemplates'
import { useContent } from '@/lib/hooks/useContent'
import { EditableContent } from '@/components/EditableContent'
import { UserRole } from '@/lib/roles'

const { Title, Text } = Typography
const { Sider, Content, Header } = Layout

export default function AdminAgreementPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { t, refresh } = useContent()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)

  const contractType = parseInt(resolvedParams.type)
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user) {
      loadContract()
    }
  }, [user])

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

  const loadContract = () => {
    const template = contractTemplates.find(t => t.id === contractType)
    if (template) {
      setContract(template)
    }
  }

  const handleContentUpdate = () => {
    refresh() // Reload content from hook
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
            key: 'indicators-rules',
            icon: <EditOutlined />,
            label: 'កែវិធីគណនាសូចនាករ',
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
    } else if (key === 'activities') {
      router.push('/activities')
    } else if (key === 'milestones') {
      router.push('/milestones')
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
    } else if (key === 'indicators-rules') {
      router.push('/admin/indicators-rules')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen p-6">
        <Alert
          message="កំហុស"
          description="រកមិនឃើញកិច្ចព្រមព្រៀងនេះទេ"
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

  const selectedKey = contractType === 4 ? 'edit-agreement-4' : contractType === 5 ? 'edit-agreement-5' : ''

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={64}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
          flexShrink: 0
        }}>
          {collapsed ? (
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>P</div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>PLP M&E</div>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Menu
            theme="light"
            selectedKeys={[selectedKey]}
            mode="inline"
            items={getSidebarMenuItems()}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              fontSize: 14
            }}
          />
        </div>
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
                កែសម្រួលកិច្ចព្រមព្រៀង {contractType}
              </Title>
            </Col>

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
                    { type: 'divider' },
                    {
                      key: 'manage-users',
                      icon: <TeamOutlined />,
                      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
                      onClick: () => router.push('/admin/users')
                    },
                    {
                      key: 'content-management',
                      icon: <FileTextOutlined />,
                      label: 'គ្រប់គ្រងខ្លឹមសារ (CMS)',
                      onClick: () => router.push('/admin/content-management')
                    },
                    { type: 'divider' as const },
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

        <Content style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <Card className="mb-6 shadow-md" style={{ borderRadius: 8 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="flex items-center justify-between">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/')}
              >
                  ត្រលប់ក្រោយ
                  </Button>
                  <Tag color="blue">SUPER ADMIN - កែសម្រួលបាន</Tag>
                </div>

                <div className="text-center">
                  <Title level={2} className="font-hanuman text-blue-800 mb-3">
                    <FileTextOutlined className="mr-3" />
                    {contract.title}
                  </Title>
                  <Text className="font-hanuman text-gray-600">
                    ចុចលើខ្លឹមសារណាមួយដើម្បីកែសម្រួល (សូមរង់ចាំ hover ឃើញពណ៌លឿង)
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

            {/* Contract Content with Inline Editing */}
            <Card className="shadow-md">
              <div className="p-6 lg:p-8 bg-white">
                <div className="prose max-w-none font-hanuman">
                  <h3 className="text-center text-lg font-bold mb-6">{contract.title}</h3>

              {/* Party A */}
              <div className="mb-6">
                <strong>
                  <EditableContent
                    contentKey="sign_party_a_label"
                    isAdmin={isSuperAdmin}
                    label="ភាគី ក"
                    onUpdate={handleContentUpdate}
                  >
                    {t('sign_party_a_label')}
                  </EditableContent>
                </strong>
                <div className="ml-4">
                  <p>{contract.partyA}</p>
                  {contract.partyASignatory && (
                    <>
                      <p className="text-sm text-gray-600">
                        <EditableContent
                          contentKey="sign_representative_label"
                          isAdmin={isSuperAdmin}
                          label="តំណាង"
                          onUpdate={handleContentUpdate}
                        >
                          {t('sign_representative_label')}
                        </EditableContent> {contract.partyASignatory}
                      </p>
                      <p className="text-sm text-gray-600">
                        <EditableContent
                          contentKey="sign_position_label"
                          isAdmin={isSuperAdmin}
                          label="តួនាទី"
                          onUpdate={handleContentUpdate}
                        >
                          {t('sign_position_label')}
                        </EditableContent> {contract.partyAPosition}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Party B */}
              <div className="mb-6">
                <strong>
                  <EditableContent
                    contentKey="sign_party_b_label"
                    isAdmin={isSuperAdmin}
                    label="ភាគី ខ"
                    onUpdate={handleContentUpdate}
                  >
                    {t('sign_party_b_label')}
                  </EditableContent>
                </strong> {contract.partyB}
              </div>

              <Divider />

              {/* Article 1 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_1_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ១"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_1_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_1_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ១ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_1_content')}
                </EditableContent>
              </p>

              {/* Article 2 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_2_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ២"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_2_title')}
                </EditableContent>
              </h4>
              <ul className="mb-6">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const contentKey = `contract_${contractType}_responsibility_${idx}`
                  const contentText = t(contentKey)

                  // Don't render if content doesn't exist or is just the key (fallback)
                  if (!contentText || contentText === contentKey) {
                    return null
                  }

                  return (
                    <li key={idx} className="mb-2">
                      <EditableContent
                        contentKey={contentKey}
                        isAdmin={isSuperAdmin}
                        label={`ទំនួលខុសត្រូវទី ${idx}`}
                        onUpdate={handleContentUpdate}
                      >
                        {contentText}
                      </EditableContent>
                    </li>
                  )
                })}
              </ul>

              {/* Article 3 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_3_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៣"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_3_title')}
                </EditableContent>
              </h4>
              <div dangerouslySetInnerHTML={{ __html: contract.content }} className="mb-6" />

              {/* Article 4 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_4_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៤"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_4_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_4_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៤ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_4_content')}
                </EditableContent>
              </p>

              {/* Article 5 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_5_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៥"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_5_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_5_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៥ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_5_content')}
                </EditableContent>
              </p>

              {/* Article 6 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_6_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៦"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_6_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_6_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៦ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_6_content')}
                </EditableContent>
              </p>

              {/* Article 7 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_7_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៧"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_7_title')}
                </EditableContent>
              </h4>
              <p className="mb-8">
                <EditableContent
                  contentKey="sign_article_7_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៧ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_7_content')}
                </EditableContent>
              </p>

              <Divider />

              {/* Article 8 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_8_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៨"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_8_title')}
                </EditableContent>
              </h4>
              <p className="mb-8">
                <EditableContent
                  contentKey="sign_article_8_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៨ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_8_content')}
                </EditableContent>
              </p>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <p className="font-bold mb-2">ភាគី ក</p>
                  {contract.partyASignatory && (
                    <>
                      <p className="text-sm">{contract.partyASignatory}</p>
                      <p className="text-sm text-gray-600">{contract.partyAPosition}</p>
                    </>
                  )}
                  <div className="mt-4 h-20 border-b-2 border-gray-400"></div>
                  <p className="text-sm mt-2">
                    <EditableContent
                      contentKey="sign_signature_seal_label"
                      isAdmin={isSuperAdmin}
                      label="ហត្ថលេខា"
                      onUpdate={handleContentUpdate}
                    >
                      {t('sign_signature_seal_label')}
                    </EditableContent>
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-2">ភាគី ខ</p>
                  <p className="text-sm">{contract.partyB}</p>
                  <div className="mt-4 h-20 border-b-2 border-gray-400"></div>
                  <p className="text-sm mt-2">
                    <EditableContent
                      contentKey="sign_signature_seal_label"
                      isAdmin={isSuperAdmin}
                      label="ហត្ថលេខា"
                      onUpdate={handleContentUpdate}
                    >
                      {t('sign_signature_seal_label')}
                    </EditableContent>
                  </p>
                </div>
              </div>

              <Divider />

              {/* End Section */}
              <div className="mt-8 text-center text-gray-500">
                <p className="font-bold">
                  <EditableContent
                    contentKey="sign_end_of_contract"
                    isAdmin={isSuperAdmin}
                    label="ចុងបញ្ចប់"
                    onUpdate={handleContentUpdate}
                  >
                    {t('sign_end_of_contract')}
                  </EditableContent>
                </p>
              </div>
            </div>
          </div>
        </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
