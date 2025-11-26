'use client'

import { useState, useEffect } from 'react'
import { Card, Layout, Menu, Typography, Dropdown, Avatar, Row, Col, Empty, Spin, Button, Table, Tag, message } from 'antd'
import { ArrowLeftOutlined, DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, FileTextOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined, EditOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'
import { useContent } from '@/lib/hooks/useContent'

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography

export default function ContractsPage() {
  const router = useRouter()
  const { t, loading: contentLoading } = useContent()
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)) {
      fetchContracts()
    } else {
      setLoading(false)
    }
  }, [user])

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

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contracts/all')
      if (response.ok) {
        const data = await response.json()
        setContracts(data.contracts || [])
      } else {
        message.error('Failed to fetch contracts')
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
      message.error('Failed to fetch contracts')
    } finally {
      setLoading(false)
    }
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
      {
        key: 'activities',
        icon: <FileTextOutlined />,
        label: 'កិច្ចសន្យារបស់ខ្ញុំ',
      },
      {
        key: 'milestones',
        icon: <CalendarOutlined />,
        label: t('dashboard_tab_milestones') || 'ចំណុចសំខាន់',
      },
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

  if (contentLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
          selectedKeys={['activities']}
          mode="inline"
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
                កិច្ចសន្យារបស់ខ្ញុំ
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
                    ...(user?.contract_type === 4 || user?.contract_type === 5 ? [{
                      key: 'configure-deliverables',
                      icon: <SettingOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_configure')}</span>,
                      onClick: () => router.push('/contract/configure')
                    }] : []),
                    { type: 'divider' },
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

        <Content style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/dashboard')}
              style={{ marginBottom: 16 }}
            >
              {t('dashboard_back')}
            </Button>
            <Title level={5} style={{ margin: '0 0 24px 0', fontFamily: 'Hanuman' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              {user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN ? 'គ្រប់គ្រងកិច្ចសន្យា / Manage Contracts' : 'កិច្ចសន្យារបស់ខ្ញុំ'}
            </Title>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" />
              </div>
            ) : user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN ? (
              <Table
                dataSource={contracts}
                rowKey="id"
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 80,
                  },
                  {
                    title: 'Contract Number',
                    dataIndex: 'contract_number',
                    key: 'contract_number',
                    render: (text: string) => <Text code>{text || 'N/A'}</Text>
                  },
                  {
                    title: 'Type',
                    dataIndex: 'contract_type_id',
                    key: 'contract_type_id',
                    width: 100,
                    render: (type: number) => (
                      <Tag color={type === 4 ? 'blue' : type === 5 ? 'green' : 'default'}>
                        Type {type}
                      </Tag>
                    )
                  },
                  {
                    title: 'Created By',
                    dataIndex: 'created_by_user',
                    key: 'created_by',
                    render: (user: any) => (
                      <div>
                        <div style={{ fontFamily: 'Hanuman', fontWeight: 500 }}>{user?.full_name || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.phone_number || user?.email || ''}</div>
                      </div>
                    )
                  },
                  {
                    title: 'Party B',
                    dataIndex: 'party_b_name',
                    key: 'party_b_name',
                    ellipsis: true,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    render: (status: string) => {
                      const statusColors: Record<string, string> = {
                        'draft': 'default',
                        'pending': 'processing',
                        'signed': 'success',
                        'rejected': 'error',
                        'completed': 'success'
                      }
                      return <Tag color={statusColors[status] || 'default'}>{status?.toUpperCase()}</Tag>
                    }
                  },
                  {
                    title: 'Created',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    width: 180,
                    render: (date: string) => new Date(date).toLocaleString('km-KH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 150,
                    render: (_: any, record: any) => (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => router.push(`/contract/${record.id}`)}
                        >
                          View
                        </Button>
                        {record.contract_html && (
                          <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(`/contract/print/${record.id}`, '_blank')}
                          >
                            Print
                          </Button>
                        )}
                      </div>
                    )
                  }
                ]}
                pagination={{
                  pageSize: 20,
                  showTotal: (total) => `Total: ${total} contracts`,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
              />
            ) : (
              <Empty description="ទំព័រនេះកំពុងរៀបចំ / This page is under development" />
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
