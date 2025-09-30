'use client'

import { useState } from 'react'
import { Card, Button, Row, Col, Typography, Tag, message, Spin, Divider, Alert } from 'antd'
import { UserOutlined, LoginOutlined, CrownOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Title, Text, Paragraph } = Typography

// Demo user credentials
const demoUsers = [
  {
    category: 'agreement',
    categoryName: '📋 Agreement Partners',
    users: [
      {
        id: 1,
        name: 'PMU-PCU Coordinator',
        phone: '0771111111',
        passcode: '1111',
        role: 'PARTNER',
        contractType: 'PMU-PCU Agreement',
        description: 'Provincial Coordination Unit',
        color: 'blue'
      },
      {
        id: 2,
        name: 'PCU-PM Manager',
        phone: '0772222222',
        passcode: '2222',
        role: 'PARTNER',
        contractType: 'PCU-Project Manager',
        description: 'Project Management Office',
        color: 'green'
      },
      {
        id: 3,
        name: 'Regional Coordinator',
        phone: '0773333333',
        passcode: '3333',
        role: 'PARTNER',
        contractType: 'PM-Regional Agreement',
        description: 'Regional Coordination Office',
        color: 'orange'
      },
      {
        id: 4,
        name: 'District Education Officer',
        phone: '0774444444',
        passcode: '4444',
        role: 'PARTNER',
        contractType: 'DoE-District Agreement',
        description: 'District Office of Education',
        color: 'purple'
      },
      {
        id: 5,
        name: 'School Director',
        phone: '0775555555',
        passcode: '5555',
        role: 'PARTNER',
        contractType: 'DoE-School Agreement',
        description: 'Primary School',
        color: 'cyan'
      }
    ]
  },
  {
    category: 'admin',
    categoryName: '👨‍💼 Administrative Users',
    users: [
      {
        id: 6,
        name: 'System Administrator',
        phone: '0776666666',
        passcode: '6666',
        role: 'ADMIN',
        contractType: 'All Contracts',
        description: 'Can manage all contracts and data',
        color: 'gold'
      },
      {
        id: 7,
        name: 'Super Administrator',
        phone: '077806680',
        passcode: '6680',
        role: 'SUPER_ADMIN',
        contractType: 'Full System Access',
        description: 'Complete system control',
        color: 'red'
      }
    ]
  }
]

export default function DemoLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleQuickLogin = async (user: any) => {
    setLoading(true)
    setSelectedUser(user)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: user.phone,
          passcode: user.passcode
        })
      })

      if (response.ok) {
        const data = await response.json()
        message.success(`ចូលប្រព័ន្ធជោគជ័យ! សូមស្វាគមន៍ ${user.name}`)

        // Redirect based on role
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
          router.push('/admin/users')
        } else {
          router.push('/me-dashboard')
        }
      } else {
        message.error('មានបញ្ហាក្នុងការចូលប្រព័ន្ធ')
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ')
    } finally {
      setLoading(false)
      setSelectedUser(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <CrownOutlined />
      case 'ADMIN':
        return <SafetyCertificateOutlined />
      default:
        return <TeamOutlined />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'red'
      case 'ADMIN':
        return 'gold'
      default:
        return 'blue'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 text-center shadow-lg">
          <Title level={2} className="text-blue-800 font-hanuman mb-2">
            <UserOutlined className="mr-2" />
            Demo Login Portal
          </Title>
          <Paragraph className="text-gray-600 font-hanuman text-lg mb-0">
            ជ្រើសរើសគណនីសាកល្បងដើម្បីចូលប្រព័ន្ធភ្លាមៗ
          </Paragraph>
          <Text type="secondary" className="block mt-2">
            Quick access for testing • No credentials needed
          </Text>
        </Card>

        {/* Warning Alert */}
        <Alert
          message="Development Environment Only"
          description="This page is for testing purposes only and should not be accessible in production."
          type="warning"
          showIcon
          className="mb-6"
        />

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <Card>
              <Spin size="large" />
              <p className="mt-4 text-center">កំពុងចូលប្រព័ន្ធ...</p>
            </Card>
          </div>
        )}

        {/* User Categories */}
        {demoUsers.map(category => (
          <div key={category.category} className="mb-8">
            <Title level={3} className="mb-4">
              {category.categoryName}
            </Title>

            <Row gutter={[16, 16]}>
              {category.users.map(user => (
                <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
                  <Card
                    hoverable
                    className="h-full shadow-md transition-all duration-300 hover:shadow-xl"
                    onClick={() => handleQuickLogin(user)}
                  >
                    <div className="text-center">
                      {/* Role Icon */}
                      <div className="text-4xl mb-3" style={{ color: user.color }}>
                        {getRoleIcon(user.role)}
                      </div>

                      {/* User Name */}
                      <Title level={5} className="mb-2">
                        {user.name}
                      </Title>

                      {/* Role Badge */}
                      <Tag color={getRoleColor(user.role)} className="mb-3">
                        {user.role}
                      </Tag>

                      {/* Contract Type */}
                      <div className="mb-2">
                        <Text type="secondary" className="block text-xs">Contract Type:</Text>
                        <Text strong className="text-sm">{user.contractType}</Text>
                      </div>

                      {/* Description */}
                      <Paragraph className="text-gray-500 text-xs mb-3">
                        {user.description}
                      </Paragraph>

                      <Divider className="my-3" />

                      {/* Credentials (for reference) */}
                      <div className="bg-gray-50 rounded p-2 mb-3">
                        <Text className="text-xs text-gray-500 block">
                          📱 {user.phone} | 🔑 {user.passcode}
                        </Text>
                      </div>

                      {/* Login Button */}
                      <Button
                        type="primary"
                        icon={<LoginOutlined />}
                        loading={loading && selectedUser?.id === user.id}
                        block
                        size="large"
                        className="font-hanuman"
                      >
                        ចូលប្រព័ន្ធ
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))}

        {/* Footer */}
        <Card className="mt-8 text-center bg-gray-50">
          <Text type="secondary">
            💡 Tip: Click any card to instantly login with that user's credentials
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            This page is unlisted and only accessible via direct URL
          </Text>
        </Card>
      </div>
    </div>
  )
}