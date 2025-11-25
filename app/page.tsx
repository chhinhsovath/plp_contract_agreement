'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Typography, Space, Dropdown, Avatar, message, Table, Tag } from 'antd'
import { FileTextOutlined, UserOutlined, LogoutOutlined, TeamOutlined, DashboardOutlined, FormOutlined, BellOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole, getRoleLabel } from '@/lib/roles'
import api from '@/lib/api-client'

const { Title, Text } = Typography

const CONTRACT_TYPES = [
  { id: 1, title_kh: 'កិច្ចព្រមព្រៀង PMU-PCU', title_en: 'PMU-PCU Agreement', parties: 'គបស និង គបក' },
  { id: 2, title_kh: 'កិច្ចព្រមព្រៀង PCU-Project Manager', title_en: 'PCU-PM Agreement', parties: 'គបក និងប្រធានគម្រោង' },
  { id: 3, title_kh: 'កិច្ចព្រមព្រៀង Project Manager-Regional', title_en: 'PM-Regional Agreement', parties: 'ប្រធានគម្រោង និងតំបន់' },
  { id: 4, title_kh: 'កិច្ចព្រមព្រៀង Provincial-District', title_en: 'Provincial-District Agreement', parties: 'មន្ទីរ និងការិយាល័យស្រុក' },
  { id: 5, title_kh: 'កិច្ចព្រមព្រៀង Provincial-School', title_en: 'Provincial-School Agreement', parties: 'មន្ទីរ និងសាលារៀន' }
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await api('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Auto-redirect PARTNER users
        if (userData.role === UserRole.PARTNER && (userData.contract_type === 4 || userData.contract_type === 5)) {
          if (!userData.contract_signed) {
            router.push('/contract/sign')
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
      const response = await api('/api/auth/logout', { method: 'POST' })
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

  const displayedContractTypes = user?.role === UserRole.SUPER_ADMIN
    ? CONTRACT_TYPES.filter(c => c.id === 4 || c.id === 5)
    : CONTRACT_TYPES;

  const columns = [
    {
      title: 'លេខ',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <Tag color="blue">{id}</Tag>
    },
    {
      title: 'ប្រភេទកិច្ចសន្យា',
      dataIndex: 'title_kh',
      key: 'title_kh',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 13 }}>{record.parties}</Text>
        </div>
      )
    },
    {
      title: 'សកម្មភាព',
      key: 'actions',
      width: isAdmin ? 300 : 180,
      render: (_: any, record: any) => (
        <Space>
          {isAdmin ? (
            <>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => router.push(`/contract/view/${record.id}`)}
              >
                មើល និងកែប្រែ
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/deliverables-management?type=${record.id}`)}
              >
                កែសមិទ្ធកម្ម
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => router.push(`/contract/${record.id}`)}
            >
              បង្កើតកិច្ចព្រមព្រៀង
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Simple Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#0047AB' }}>
            ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
          </Title>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" size="large">
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                  <span>{user.full_name}</span>
                </Space>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            កិច្ចព្រមព្រៀងសមិទ្ធកម្ម
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {isAdmin ? 'មើល និងកែប្រែកិច្ចសន្យាទាំង ៥ ប្រភេទ' : 'ជ្រើសរើសប្រភេទកិច្ចសន្យា'}
          </Text>
        </div>

        {/* Contracts Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={displayedContractTypes}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </Card>

        {/* Admin Quick Access - Compact */}
        {isAdmin && (
          <Card style={{ marginTop: 24 }}>
            <Space size="middle" wrap>
              <Text strong>ផ្ទាំងគ្រប់គ្រងរហ័ស:</Text>
              {user?.role === 'SUPER_ADMIN' && (
                <Button icon={<TeamOutlined />} onClick={() => router.push('/admin/users')}>
                  អ្នកប្រើប្រាស់
                </Button>
              )}
              <Button icon={<FileTextOutlined />} onClick={() => router.push('/admin/content-management')}>
                ខ្លឹមសារ
              </Button>
              <Button icon={<FormOutlined />} onClick={() => router.push('/admin/deliverables-management')}>
                សមិទ្ធកម្ម
              </Button>
              {user?.role === 'SUPER_ADMIN' && (
                <Button icon={<BellOutlined />} onClick={() => router.push('/admin/reconfiguration-requests')}>
                  សំណើ
                </Button>
              )}
            </Space>
          </Card>
        )}
      </div>
    </div>
  )
}
