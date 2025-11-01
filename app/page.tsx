'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, Typography, Space, Dropdown, Avatar, message, Badge, Divider } from 'antd'
import { FileTextOutlined, UserOutlined, LogoutOutlined, TeamOutlined, DashboardOutlined, FormOutlined, BellOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole, getRoleLabel, hasPermission } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography

const CONTRACT_TYPES = [
  { id: 1, title: 'PMU-PCU', titleKh: 'កិច្ចព្រមព្រៀង PMU-PCU', subtitle: 'គបស និង គបក', color: '#0047AB', icon: '🏛️' },
  { id: 2, title: 'PCU-Project Manager', titleKh: 'កិច្ចព្រមព្រៀង PCU-PM', subtitle: 'គបក និងប្រធានគម្រោង', color: '#DC143C', icon: '👨‍💼' },
  { id: 3, title: 'PM-Regional', titleKh: 'កិច្ចព្រមព្រៀង PM-តំបន់', subtitle: 'ប្រធានគម្រោង និងតំបន់', color: '#FFD700', icon: '🌏' },
  { id: 4, title: 'Provincial-District', titleKh: 'កិច្ចព្រមព្រៀង ខេត្ត-ស្រុក', subtitle: 'មន្ទីរ និងការិយាល័យស្រុក', color: '#52c41a', icon: '🏫' },
  { id: 5, title: 'Provincial-School', titleKh: 'កិច្ចព្រមព្រៀង ខេត្ត-សាលា', subtitle: 'មន្ទីរ និងសាលារៀន', color: '#1890ff', icon: '🎓' }
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Auto-redirect PARTNER users
        if (userData.role === UserRole.PARTNER && (userData.contract_type === 4 || userData.contract_type === 5)) {
          if (!userData.contract_signed) {
            router.push('/contract/configure')
            return
          }
          router.push('/me-dashboard')
          return
        }

        setUser(userData)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        message.success('ចាកចេញបានជោគជ័យ')
        router.push('/login')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការចាកចេញ')
    }
  }

  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>{user?.phone_number}</div>
          <div style={{ fontSize: 14, color: '#1890ff' }}>{getRoleLabel(user?.role as UserRole)}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    ...(user?.role === UserRole.PARTNER ? [{
      key: 'me-dashboard',
      label: 'ផ្ទាំងគ្រប់គ្រង M&E',
      icon: <DashboardOutlined />,
      onClick: () => router.push('/me-dashboard'),
    }] : []),
    ...(user?.role === 'SUPER_ADMIN' ? [{
      key: 'manage-users',
      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
      icon: <TeamOutlined />,
      onClick: () => router.push('/admin/users'),
    }] : []),
    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
      key: 'content-management',
      label: 'គ្រប់គ្រងខ្លឹមសារ',
      icon: <FileTextOutlined />,
      onClick: () => router.push('/admin/content-management'),
    }] : []),
    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
      key: 'deliverables-management',
      label: 'គ្រប់គ្រងសមិទ្ធកម្ម',
      icon: <FormOutlined />,
      onClick: () => router.push('/admin/deliverables-management'),
    }] : []),
    ...(user?.role === 'SUPER_ADMIN' ? [{
      key: 'reconfig-requests',
      label: 'សំណើផ្លាស់ប្តូរ',
      icon: <BellOutlined />,
      onClick: () => router.push('/admin/reconfiguration-requests'),
    }] : []),
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'ចាកចេញ',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Minimalist Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#0047AB' }}>
            ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
          </Title>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" size="large" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                <span>{user.full_name}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        {/* Hero Section - Minimalist */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ color: '#fff', fontSize: 42, marginBottom: 16, fontWeight: 300 }}>
            កិច្ចព្រមព្រៀងសមិទ្ធកម្ម
          </Title>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>
            {isAdmin ? 'មើល និងកែប្រែកិច្ចសន្យាទាំង ៥ ប្រភេទ' : 'ជ្រើសរើសប្រភេទកិច្ចសន្យា'}
          </Text>
        </div>

        {/* Contract Cards - Minimalist Grid */}
        <Row gutter={[24, 24]}>
          {CONTRACT_TYPES.map((contract) => (
            <Col xs={24} sm={12} lg={isAdmin ? 12 : 8} key={contract.id}>
              <Card
                hoverable
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  height: '100%'
                }}
                bodyStyle={{ padding: 32 }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Icon & Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 48 }}>{contract.icon}</span>
                    <Badge count={contract.id} style={{ backgroundColor: contract.color }} />
                  </div>

                  {/* Title */}
                  <div>
                    <Title level={5} style={{ marginBottom: 4, color: contract.color }}>
                      {contract.titleKh}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {contract.subtitle}
                    </Text>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  {/* Action Buttons */}
                  {isAdmin ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        block
                        onClick={() => router.push(`/contract/view/${contract.id}`)}
                        style={{ background: contract.color, borderColor: contract.color }}
                      >
                        មើល និងកែប្រែ
                      </Button>
                      <Button
                        icon={<EditOutlined />}
                        block
                        onClick={() => router.push(`/admin/deliverables-management?type=${contract.id}`)}
                      >
                        កែសមិទ្ធកម្ម
                      </Button>
                    </Space>
                  ) : (
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      block
                      size="large"
                      onClick={() => router.push(`/contract/${contract.id}`)}
                      style={{ background: contract.color, borderColor: contract.color }}
                    >
                      បង្កើតកិច្ចព្រមព្រៀង
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Access for Admins - Minimalist */}
        {isAdmin && (
          <Card
            style={{
              marginTop: 60,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Title level={5} style={{ marginBottom: 24 }}>
              ផ្ទាំងគ្រប់គ្រងរហ័ស
            </Title>
            <Row gutter={[16, 16]}>
              {user?.role === 'SUPER_ADMIN' && (
                <Col xs={24} sm={12} md={6}>
                  <Button
                    icon={<TeamOutlined />}
                    block
                    size="large"
                    onClick={() => router.push('/admin/users')}
                  >
                    អ្នកប្រើប្រាស់
                  </Button>
                </Col>
              )}
              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<FileTextOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/admin/content-management')}
                >
                  ខ្លឹមសារ
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<FormOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/admin/deliverables-management')}
                >
                  សមិទ្ធកម្ម
                </Button>
              </Col>
              {user?.role === 'SUPER_ADMIN' && (
                <Col xs={24} sm={12} md={6}>
                  <Button
                    icon={<BellOutlined />}
                    block
                    size="large"
                    onClick={() => router.push('/admin/reconfiguration-requests')}
                  >
                    សំណើ
                  </Button>
                </Col>
              )}
            </Row>
          </Card>
        )}
      </div>
    </div>
  )
}
