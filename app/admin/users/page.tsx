'use client'

import { useState, useEffect } from 'react'
import { Layout, Menu, Table, Button, Tag, Space, Typography, Input, message, Modal, Select, Card, Row, Col, Dropdown, Avatar } from 'antd'
import { SearchOutlined, EditOutlined, UserOutlined, TeamOutlined, DashboardOutlined, FileTextOutlined, LogoutOutlined, SettingOutlined, FundProjectionScreenOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { UserRole, ROLE_DEFINITIONS, getRoleLabel, hasPermission } from '@/lib/roles'
import { useRouter } from 'next/navigation'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography
const { Search } = Input

export default function UsersManagementPage() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [pageSize, setPageSize] = useState(15)

  useEffect(() => {
    checkCurrentUser()
    fetchUsers()
  }, [])

  const checkCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)

        // Check if user has permission to manage users
        if (!hasPermission(data.user.role as UserRole, 'users.read')) {
          message.error('អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះ')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Session check failed:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        message.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការតភ្ជាប់')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: number, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        message.success('តួនាទីត្រូវបានកែប្រែដោយជោគជ័យ')
        fetchUsers()
        setEditModalVisible(false)
      } else {
        message.error('មានបញ្ហាក្នុងការកែប្រែតួនាទី')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការកែប្រែ')
    }
  }

  const handleDeactivateUser = async (userId: number, isActive: boolean) => {
    const action = isActive ? 'ផ្អាក' : 'ធ្វើឱ្យសកម្ម'

    Modal.confirm({
      title: `បញ្ជាក់ការ${action}គណនី`,
      content: `តើអ្នកពិតជាចង់${action}គណនីនេះមែនទេ?`,
      okText: action,
      cancelText: 'បោះបង់',
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !isActive }),
          })

          if (response.ok) {
            message.success(`គណនីត្រូវបាន${action}ដោយជោគជ័យ`)
            fetchUsers()
          } else {
            message.error(`មានបញ្ហាក្នុងការ${action}គណនី`)
          }
        } catch (error) {
          message.error(`កំហុសក្នុងការ${action}`)
        }
      },
    })
  }

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      SUPER_ADMIN: 'red',
      ADMIN: 'orange',
      MANAGER: 'blue',
      COORDINATOR: 'green',
      OFFICER: 'cyan',
      VIEWER: 'default',
      PARTNER: 'purple',
    }
    return colors[role] || 'default'
  }

  const canEditUser = (targetRole: UserRole) => {
    if (!currentUser) return false

    const currentRole = currentUser.role as UserRole
    const currentLevel = ROLE_DEFINITIONS[currentRole]?.level || 0
    const targetLevel = ROLE_DEFINITIONS[targetRole]?.level || 0

    return hasPermission(currentRole, 'users.manage_roles') && currentLevel > targetLevel
  }

  const getAvailableRoles = (targetRole: UserRole) => {
    if (!currentUser) return []

    const currentRole = currentUser.role as UserRole
    const currentLevel = ROLE_DEFINITIONS[currentRole]?.level || 0

    return Object.entries(ROLE_DEFINITIONS)
      .filter(([_, def]) => def.level < currentLevel)
      .map(([role, def]) => ({
        value: role,
        label: `${def.nameKhmer} (${def.name})`,
      }))
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      message.error('មានបញ្ហាក្នុងការចាកចេញ')
    }
  }

  const getSidebarMenuItems = () => {
    const items: MenuProps['items'] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'ទំព័រដើម',
      },
      {
        key: 'contracts',
        icon: <FileTextOutlined />,
        label: 'កិច្ចសន្យា',
      },
    ]

    if (currentUser?.role === UserRole.SUPER_ADMIN) {
      items.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'គ្រប់គ្រងប្រព័ន្ធ',
        children: [
          {
            key: 'users',
            icon: <TeamOutlined />,
            label: 'អ្នកប្រើប្រាស់',
          },
          {
            key: 'content-management',
            icon: <FileTextOutlined />,
            label: 'ខ្លឹមសារអត្ថបទ',
          },
          {
            key: 'deliverables-content',
            icon: <FundProjectionScreenOutlined />,
            label: 'ខ្លឹមសារការងារ',
          },
        ],
      })
    }

    return items
  }

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'contracts':
        router.push('/contracts')
        break
      case 'users':
        router.push('/admin/users')
        break
      case 'content-management':
        router.push('/admin/content-management')
        break
      case 'deliverables-content':
        router.push('/admin/deliverables-content')
        break
      default:
        break
    }
  }

  const columns = [
    {
      title: 'ឈ្មោះពេញ',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>{record.phone_number}</div>
        </div>
      ),
    },
    {
      title: 'តួនាទីប្រព័ន្ធ',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {getRoleLabel(role)}
        </Tag>
      ),
    },
    {
      title: 'ស្ថាប័ន',
      dataIndex: 'organization',
      key: 'organization',
      render: (org: string) => org || '-',
    },
    {
      title: 'តួនាទីការងារ',
      dataIndex: 'position',
      key: 'position',
      render: (pos: string) => pos || '-',
    },
    {
      title: 'ស្ថានភាព',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'សកម្ម' : 'ផ្អាក'}
        </Tag>
      ),
    },
    {
      title: 'ចូលប្រើចុងក្រោយ',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date: string) => date ? new Date(date).toLocaleDateString('km-KH') : 'មិនទាន់ចូល',
    },
    {
      title: 'សកម្មភាព',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {canEditUser(record.role) && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(record)
                setEditModalVisible(true)
              }}
            />
          )}
          {hasPermission(currentUser?.role as UserRole, 'users.update') && record.role !== 'SUPER_ADMIN' && (
            <Button
              type="text"
              danger={record.is_active}
              onClick={() => handleDeactivateUser(record.id, record.is_active)}
            >
              {record.is_active ? 'ផ្អាក' : 'ធ្វើឱ្យសកម្ម'}
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const filteredUsers = users.filter((user: any) =>
    user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phone_number.includes(searchText) ||
    user.organization?.toLowerCase().includes(searchText.toLowerCase())
  )

  const roleStats = Object.values(UserRole).map(role => ({
    role,
    count: users.filter((u: any) => u.role === role).length,
  }))

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'ប្រវត្តិរូប',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'ការកំណត់',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ចាកចេញ',
      danger: true,
    },
  ]

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout()
    } else if (key === 'profile') {
      router.push('/me-dashboard')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Hanuman',
          }}
        >
          {collapsed ? 'PLP' : 'PLP គ្រប់គ្រង'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={['users']}
          mode="inline"
          items={getSidebarMenuItems()}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Row justify="space-between" style={{ width: '100%' }}>
            <Col>
              <Button
                type="text"
                onClick={() => router.push('/dashboard')}
                style={{ fontFamily: 'Hanuman' }}
              >
                ត្រឡប់ទៅ Dashboard
              </Button>
            </Col>
            <Col>
              <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <Text style={{ fontFamily: 'Hanuman' }}>{currentUser?.full_name || 'អ្នកប្រើប្រាស់'}</Text>
                </Space>
              </Dropdown>
            </Col>
          </Row>
        </Header>

        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          <Card style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              គ្រប់គ្រងអ្នកប្រើប្រាស់
            </Title>
          </Card>

        {/* Role Statistics - Optimized for Tablet/Desktop */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {roleStats.map(({ role, count }) => (
            <Col xs={24} md={8} lg={6} xl={4} key={role}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>{count}</div>
                  <div style={{ fontSize: 15, marginTop: 8 }}>{getRoleLabel(role)}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginBottom: 24 }}>
          <Search
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬស្ថាប័ន"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ minWidth: 400 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} នៃ ${total} អ្នកប្រើប្រាស់`,
              onShowSizeChange: (current, size) => setPageSize(size)
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </div>

      {/* Edit User Modal */}
      <Modal
        title="កែប្រែតួនាទីអ្នកប្រើប្រាស់"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>ឈ្មោះ: </Text>
              <Text>{selectedUser.full_name}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>លេខទូរស័ព្ទ: </Text>
              <Text>{selectedUser.phone_number}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>តួនាទីបច្ចុប្បន្ន: </Text>
              <Tag color={getRoleColor(selectedUser.role)}>
                {getRoleLabel(selectedUser.role)}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>តួនាទីថ្មី: </Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="ជ្រើសរើសតួនាទីថ្មី"
                options={getAvailableRoles(selectedUser.role)}
                onChange={(newRole) => handleUpdateRole(selectedUser.id, newRole as UserRole)}
              />
            </div>
          </div>
        )}
      </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}
