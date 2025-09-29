'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Typography, Input, message, Modal, Select, Card, Row, Col } from 'antd'
import { SearchOutlined, EditOutlined, UserOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { UserRole, ROLE_DEFINITIONS, getRoleLabel, hasPermission } from '@/lib/roles'

const { Title, Text } = Typography
const { Search } = Input

export default function UsersManagementPage() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

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
          window.location.href = '/'
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
    const colors = {
      SUPER_ADMIN: 'red',
      ADMIN: 'orange',
      MANAGER: 'blue',
      COORDINATOR: 'green',
      OFFICER: 'cyan',
      VIEWER: 'default',
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

  const columns = [
    {
      title: 'ឈ្មោះពេញ',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string, record: any) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{record.phone_number}</div>
        </div>
      ),
    },
    {
      title: 'តួនាទីប្រព័ន្ធ',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)} className="font-hanuman">
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
        <Tag color={isActive ? 'success' : 'error'} className="font-hanuman">
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Title level={2} className="font-hanuman">
            <TeamOutlined className="mr-2" />
            គ្រប់គ្រងអ្នកប្រើប្រាស់
          </Title>
          <Link href="/">
            <Button icon={<HomeOutlined />} className="font-hanuman">
              ត្រឡប់ទៅទំព័រដើម
            </Button>
          </Link>
        </div>

        {/* Role Statistics */}
        <Row gutter={16} className="mb-6">
          {roleStats.map(({ role, count }) => (
            <Col span={4} key={role}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm font-hanuman">{getRoleLabel(role)}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mb-4">
          <Search
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬស្ថាប័ន"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            className="font-hanuman"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showTotal: (total, range) => `${range[0]}-${range[1]} នៃ ${total} អ្នកប្រើប្រាស់`,
          }}
          className="font-hanuman"
        />
      </div>

      {/* Edit User Modal */}
      <Modal
        title="កែប្រែតួនាទីអ្នកប្រើប្រាស់"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        className="font-hanuman"
      >
        {selectedUser && (
          <div>
            <div className="mb-4">
              <Text strong>ឈ្មោះ: </Text>
              <Text>{selectedUser.full_name}</Text>
            </div>
            <div className="mb-4">
              <Text strong>លេខទូរស័ព្ទ: </Text>
              <Text>{selectedUser.phone_number}</Text>
            </div>
            <div className="mb-4">
              <Text strong>តួនាទីបច្ចុប្បន្ន: </Text>
              <Tag color={getRoleColor(selectedUser.role)}>
                {getRoleLabel(selectedUser.role)}
              </Tag>
            </div>
            <div className="mb-4">
              <Text strong>តួនាទីថ្មី: </Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="ជ្រើសរើសតួនាទីថ្មី"
                options={getAvailableRoles(selectedUser.role)}
                onChange={(newRole) => handleUpdateRole(selectedUser.id, newRole as UserRole)}
                className="font-hanuman"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}