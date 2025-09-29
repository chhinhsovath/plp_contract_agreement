'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, Typography, Space, Dropdown, Avatar, message } from 'antd'
import { FileTextOutlined, EditOutlined, FileAddOutlined, FolderOpenOutlined, UserOutlined, LogoutOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { getAvailableContractIds, getContractTemplate } from '@/lib/contract-templates'
import { UserRole, getRoleLabel, hasPermission } from '@/lib/roles'

const { Title, Text } = Typography

export default function HomePage() {
  const router = useRouter()
  const contractIds = getAvailableContractIds()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check session on mount
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
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

  const handleNavigateToContract = (contractId: number) => {
    router.push(`/contract/${contractId}`)
  }

  const handleNavigateToList = () => {
    router.push('/contracts')
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="font-hanuman">
          <div className="font-semibold">{user?.full_name}</div>
          <div className="text-sm text-gray-500">{user?.phone_number}</div>
          <div className="text-sm text-blue-600">{getRoleLabel(user?.role as UserRole)}</div>
          {user?.organization && (
            <div className="text-sm text-gray-500">{user.organization}</div>
          )}
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    ...(hasPermission(user?.role as UserRole, 'users.read') ? [{
      key: 'manage-users',
      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
      icon: <TeamOutlined />,
      onClick: () => router.push('/admin/users'),
    }] : []),
    {
      key: 'logout',
      label: 'ចាកចេញ',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with user info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Title level={3} className="mb-0 text-blue-800 font-hanuman">
            PLP Contract System
          </Title>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" className="flex items-center space-x-2">
                <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                <span className="font-hanuman">{user.full_name}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <Title level={1} className="text-blue-800 font-hanuman mb-4">
            ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
          </Title>
          <Text className="text-xl text-gray-700">
            សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀងដែលអ្នកចង់បង្កើត
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {contractIds.map((id) => {
            const template = getContractTemplate(id)
            if (!template) return null

            return (
              <Col xs={24} md={12} key={id}>
                <Card
                  hoverable
                  className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                  onClick={() => handleNavigateToContract(id)}
                >
                  <Space direction="vertical" className="w-full">
                    <div className="flex items-center justify-between">
                      <FileTextOutlined className="text-5xl text-blue-600" />
                      <div className="text-3xl font-bold text-gray-400">
                        {id}
                      </div>
                    </div>
                    <Title level={4} className="text-gray-800 font-hanuman mt-4">
                      {template.title}
                    </Title>
                    {template.subtitle && (
                      <Text className="text-gray-600 text-sm">
                        {template.subtitle}
                      </Text>
                    )}
                    <div className="mt-4">
                      <Button
                        type="primary"
                        icon={<FileAddOutlined />}
                        size="large"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateToContract(id)
                        }}
                      >
                        បង្កើតកិច្ចព្រមព្រៀង
                      </Button>
                    </div>
                  </Space>
                </Card>
              </Col>
            )
          })}

          <Col xs={24} md={12}>
            <Card
              hoverable
              className="h-full bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-shadow duration-300"
              onClick={handleNavigateToList}
            >
              <Space direction="vertical" className="w-full">
                <div className="flex items-center justify-between">
                  <FolderOpenOutlined className="text-5xl text-green-600" />
                  <EditOutlined className="text-3xl text-gray-400" />
                </div>
                <Title level={4} className="text-gray-800 font-hanuman mt-4">
                  កិច្ចព្រមព្រៀងដែលបានរក្សាទុក
                </Title>
                <Text className="text-gray-600">
                  មើល កែសម្រួល និងគ្រប់គ្រងកិច្ចព្រមព្រៀងដែលបានបង្កើតរួច
                </Text>
                <div className="mt-4">
                  <Button
                    type="primary"
                    icon={<FolderOpenOutlined />}
                    size="large"
                    className="w-full bg-green-600 border-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigateToList()
                    }}
                  >
                    ចូលទៅកាន់បញ្ជី
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <Space direction="vertical" size="small">
              <Title level={4} className="text-blue-800 mb-2">
                📋 ប្រភេទកិច្ចព្រមព្រៀងដែលមាន
              </Title>
              <ul className="text-left max-w-3xl mx-auto space-y-2">
                <li>✅ កិច្ចព្រមព្រៀងរវាង គបស និង គបក (PMU-PCU)</li>
                <li>✅ កិច្ចព្រមព្រៀងរវាងប្រធាន គបក និងប្រធានគម្រោង</li>
                <li>✅ កិច្ចព្រមព្រៀងរវាងប្រធានគម្រោង និងមន្រ្តីគម្រោងតាមតំបន់</li>
                <li>✅ កិច្ចព្រមព្រៀងរវាងនាយកដ្ឋានបឋម និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ</li>
                <li>✅ កិច្ចព្រមព្រៀងរវាងនាយកដ្ឋានបឋម និងសាលាបឋមសិក្សា</li>
              </ul>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  )
}