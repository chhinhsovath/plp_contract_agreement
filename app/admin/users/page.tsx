'use client'

import { useState, useEffect } from 'react'
import { Layout, Menu, Table, Button, Tag, Space, Typography, Input, message, Modal, Select, Card, Row, Col, Dropdown, Avatar } from 'antd'
import type { TableProps } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined, DashboardOutlined, FileTextOutlined, LogoutOutlined, SettingOutlined, FundProjectionScreenOutlined, MenuFoldOutlined, MenuUnfoldOutlined, FormOutlined, BellOutlined } from '@ant-design/icons'
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

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

  const handleDeleteUser = async (userId: number, userName: string) => {
    Modal.confirm({
      title: 'បញ្ជាក់ការលុបគណនី',
      content: `តើអ្នកពិតជាចង់លុបគណនី "${userName}" មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`,
      okText: 'លុប',
      okType: 'danger',
      cancelText: 'បោះបង់',
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
          })

          const data = await response.json()

          if (response.ok) {
            message.success('គណនីត្រូវបានលុបដោយជោគជ័យ')
            fetchUsers()
          } else {
            message.error(data.error || 'មានបញ្ហាក្នុងការលុបគណនី')
          }
        } catch (error) {
          message.error('កំហុសក្នុងការលុប')
        }
      },
    })
  }

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('សូមជ្រើសរើសអ្នកប្រើប្រាស់យ៉ាងហោចណាស់មួយនាក់')
      return
    }

    Modal.confirm({
      title: 'បញ្ជាក់ការលុបជាក្រុម',
      content: `តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ចំនួន ${selectedRowKeys.length} នាក់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`,
      okText: 'លុប',
      okType: 'danger',
      cancelText: 'បោះបង់',
      onOk: async () => {
        try {
          const response = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: selectedRowKeys }),
          })

          const data = await response.json()

          if (response.ok) {
            message.success(data.message || `លុបអ្នកប្រើប្រាស់ចំនួន ${data.deletedCount} នាក់ដោយជោគជ័យ`)

            if (data.undeletableUsers && data.undeletableUsers.length > 0) {
              Modal.info({
                title: 'អ្នកប្រើប្រាស់ដែលមិនអាចលុបបាន',
                content: (
                  <ul>
                    {data.undeletableUsers.map((user: string, index: number) => (
                      <li key={index}>{user}</li>
                    ))}
                  </ul>
                ),
              })
            }

            setSelectedRowKeys([])
            fetchUsers()
          } else {
            message.error(data.error || 'មានបញ្ហាក្នុងការលុបអ្នកប្រើប្រាស់')
          }
        } catch (error) {
          message.error('កំហុសក្នុងការលុប')
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

    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'COORDINATOR') {
      adminItems.push({
        type: 'divider',
      });
      adminItems.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'ការគ្រប់គ្រង',
        children: [
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
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
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
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
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
            key: 'reconfig-requests',
            icon: <BellOutlined />,
            label: 'សំណើផ្លាស់ប្តូរ',
            onClick: () => router.push('/admin/reconfiguration-requests')
          }] : []),
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-4',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៤',
            onClick: () => router.push('/admin/agreement/4')
          }] : []),
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-5',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៥',
            onClick: () => router.push('/admin/agreement/5')
          }] : []),
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-4',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៤',
            onClick: () => router.push('/admin/configure-contract/4')
          }] : []),
          ...(currentUser?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-5',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៥',
            onClick: () => router.push('/admin/configure-contract/5')
          }] : []),
        ],
      });
    }

    return [...baseItems, ...adminItems];
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
      title: 'លេខកិច្ចសន្យា',
      dataIndex: 'contract_type',
      key: 'contract_type',
      render: (contractType: number | null) => (
        contractType ? (
          <Tag color="blue">កិច្ចសន្យាទី {contractType}</Tag>
        ) : (
          <span style={{ color: '#8c8c8c' }}>-</span>
        )
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
          {hasPermission(currentUser?.role as UserRole, 'users.delete') && canEditUser(record.role) && record.phone_number !== '077806680' && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(record.id, record.full_name)}
            />
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

  const roleStats = Object.values(UserRole)
    .map(role => ({
      role,
      count: users.filter((u: any) => u.role === role).length,
    }))
    .filter(stat => stat.count > 0) // Only show roles with users

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

  const rowSelection: TableProps<any>['rowSelection'] = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys)
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.phone_number === '077806680' || !canEditUser(record.role), // Disable super admin and users with higher roles
    }),
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
          selectedKeys={['manage-users']}
          defaultOpenKeys={['admin']}
          mode="inline"
          items={getSidebarMenuItems()}
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
                គ្រប់គ្រងអ្នកប្រើប្រាស់
              </Title>
            </Col>
            <Col>
              <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
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
                      {currentUser?.full_name || 'អ្នកប្រើប្រាស់'}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'Hanuman' }}>
                      {currentUser?.role}
                    </div>
                  </div>
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </Header>

        <Content style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        {/* Role Statistics - Optimized for Tablet/Desktop */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {roleStats.map(({ role, count }) => (
            <Col xs={24} md={8} lg={6} xl={4} key={role}>
              <Card hoverable style={{
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                height: '100%'
              }}
              styles={{ body: { padding: 16 } }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>{count}</div>
                  <div style={{ fontSize: 15, marginTop: 8 }}>{getRoleLabel(role)}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <Search
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬស្ថាប័ន"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ minWidth: 400, flex: 1 }}
          />
          {hasPermission(currentUser?.role as UserRole, 'users.delete') && selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              size="large"
            >
              លុបដែលបានជ្រើសរើស ({selectedRowKeys.length})
            </Button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} នៃ ${total} អ្នកប្រើប្រាស់`,
              onShowSizeChange: (_current, size) => setPageSize(size)
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
