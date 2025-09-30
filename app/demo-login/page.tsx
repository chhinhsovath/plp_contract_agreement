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
    categoryName: '📋 ដៃគូកិច្ចព្រមព្រៀង',
    users: [
      {
        id: 1,
        name: 'អ្នកសម្របសម្រួល PMU-PCU',
        phone: '0771111111',
        passcode: '1111',
        role: 'ដៃគូ',
        roleEn: 'PARTNER',
        contractType: 'កិច្ចព្រមព្រៀង PMU-PCU',
        description: 'គណៈកម្មាធិការសម្របសម្រួលខេត្ត',
        color: 'blue'
      },
      {
        id: 2,
        name: 'អ្នកគ្រប់គ្រង PCU-PM',
        phone: '0772222222',
        passcode: '2222',
        role: 'ដៃគូ',
        roleEn: 'PARTNER',
        contractType: 'កិច្ចព្រមព្រៀង PCU-អ្នកគ្រប់គ្រងគម្រោង',
        description: 'ការិយាល័យគ្រប់គ្រងគម្រោង',
        color: 'green'
      },
      {
        id: 3,
        name: 'អ្នកសម្របសម្រួលតំបន់',
        phone: '0773333333',
        passcode: '3333',
        role: 'ដៃគូ',
        roleEn: 'PARTNER',
        contractType: 'កិច្ចព្រមព្រៀង PM-តំបន់',
        description: 'ការិយាល័យសម្របសម្រួលតំបន់',
        color: 'orange'
      },
      {
        id: 4,
        name: 'មន្ត្រីអប់រំស្រុក',
        phone: '0774444444',
        passcode: '4444',
        role: 'ដៃគូ',
        roleEn: 'PARTNER',
        contractType: 'កិច្ចព្រមព្រៀង DoE-ការិយាល័យស្រុក',
        description: 'ការិយាល័យអប់រំស្រុក',
        color: 'purple'
      },
      {
        id: 5,
        name: 'នាយកសាលា',
        phone: '0775555555',
        passcode: '5555',
        role: 'ដៃគូ',
        roleEn: 'PARTNER',
        contractType: 'កិច្ចព្រមព្រៀង DoE-សាលារៀន',
        description: 'សាលាបឋមសិក្សា',
        color: 'cyan'
      }
    ]
  },
  {
    category: 'admin',
    categoryName: '👨‍💼 អ្នកគ្រប់គ្រងប្រព័ន្ធ',
    users: [
      {
        id: 6,
        name: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
        phone: '0776666666',
        passcode: '6666',
        role: 'រដ្ឋបាល',
        roleEn: 'ADMIN',
        contractType: 'គ្រប់កិច្ចសន្យាទាំងអស់',
        description: 'អាចគ្រប់គ្រងកិច្ចសន្យា និងទិន្នន័យទាំងអស់',
        color: 'gold'
      },
      {
        id: 7,
        name: 'អ្នកគ្រប់គ្រងកម្រិតខ្ពស់',
        phone: '077806680',
        passcode: '6680',
        role: 'រដ្ឋបាលកម្រិតខ្ពស់',
        roleEn: 'SUPER_ADMIN',
        contractType: 'សិទ្ធិប្រើប្រាស់ពេញលេញ',
        description: 'គ្រប់គ្រងប្រព័ន្ធទាំងស្រុង',
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
        if (user.roleEn === 'SUPER_ADMIN' || user.roleEn === 'ADMIN') {
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

  const getRoleIcon = (roleEn: string) => {
    switch (roleEn) {
      case 'SUPER_ADMIN':
        return <CrownOutlined />
      case 'ADMIN':
        return <SafetyCertificateOutlined />
      default:
        return <TeamOutlined />
    }
  }

  const getRoleColor = (roleEn: string) => {
    switch (roleEn) {
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
            ទំព័រចូលប្រព័ន្ធសាកល្បង
          </Title>
          <Paragraph className="text-gray-600 font-hanuman text-lg mb-0">
            ជ្រើសរើសគណនីសាកល្បងដើម្បីចូលប្រព័ន្ធភ្លាមៗ
          </Paragraph>
          <Text type="secondary" className="block mt-2 font-hanuman">
            ចូលប្រើភ្លាមៗសម្រាប់ការសាកល្បង • មិនចាំបាច់បញ្ចូលលេខសម្ងាត់
          </Text>
        </Card>

        {/* Warning Alert */}
        <Alert
          message="សម្រាប់តែការសាកល្បងប៉ុណ្ណោះ"
          description="ទំព័រនេះសម្រាប់តែការសាកល្បងប៉ុណ្ណោះ មិនគួរប្រើនៅក្នុងការដំណើរការជាផ្លូវការទេ។"
          type="warning"
          showIcon
          className="mb-6 font-hanuman"
        />

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <Card>
              <Spin size="large" />
              <p className="mt-4 text-center font-hanuman">កំពុងចូលប្រព័ន្ធ...</p>
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
                        {getRoleIcon(user.roleEn)}
                      </div>

                      {/* User Name */}
                      <Title level={5} className="mb-2 font-hanuman">
                        {user.name}
                      </Title>

                      {/* Role Badge */}
                      <Tag color={getRoleColor(user.roleEn)} className="mb-3 font-hanuman">
                        {user.role}
                      </Tag>

                      {/* Contract Type */}
                      <div className="mb-2">
                        <Text type="secondary" className="block text-xs font-hanuman">ប្រភេទកិច្ចសន្យា:</Text>
                        <Text strong className="text-sm font-hanuman">{user.contractType}</Text>
                      </div>

                      {/* Description */}
                      <Paragraph className="text-gray-500 text-xs mb-3 font-hanuman">
                        {user.description}
                      </Paragraph>

                      <Divider className="my-3" />

                      {/* Credentials (for reference) */}
                      <div className="bg-gray-50 rounded p-2 mb-3">
                        <Text className="text-xs text-gray-500 block font-hanuman">
                          📱 លេខទូរស័ព្ទ: {user.phone} | 🔑 លេខសម្ងាត់: {user.passcode}
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
          <Text type="secondary" className="font-hanuman">
            💡 ព័ត៌មាន: ចុចលើកាតណាមួយដើម្បីចូលប្រព័ន្ធភ្លាមៗ
          </Text>
          <br />
          <Text type="secondary" className="text-xs font-hanuman">
            ទំព័រនេះមិនបង្ហាញជាសាធារណៈ អាចចូលប្រើបានតែតាម URL ផ្ទាល់ប៉ុណ្ណោះ
          </Text>
        </Card>
      </div>
    </div>
  )
}