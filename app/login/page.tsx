'use client'

import { useState } from 'react'
import { Form, Input, Button, Typography, message, Row, Col, Card, Space, Divider } from 'antd'
import { PhoneOutlined, LockOutlined, LoginOutlined, UserAddOutlined, SafetyOutlined, CheckCircleOutlined, RocketOutlined, TeamOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Text, Paragraph } = Typography

const LOGIN_TYPES = [
  {
    id: 'internal',
    title: 'ការិយាល័យអប់រំស្រុក/ខណ្ឌ',
    subtitle: 'ចូលប្រើប្រាស់សម្រាប់កិច្ចព្រមព្រៀងប្រភេទ 4',
    description: 'ចូលប្រើដោយប្រើលេខទូរស័ព្ទ និងលេខសម្ងាត់',
    icon: <TeamOutlined />,
    color: '#52c41a'
  },
  {
    id: 'external',
    title: 'សាលារៀន',
    subtitle: 'ចូលប្រើប្រាស់សម្រាប់កិច្ចព្រមព្រៀងប្រភេទ 5',
    description: 'ចូលប្រើដោយប្រើឈ្មោះអ្នកប្រើ និងលេខសម្ងាត់ពីប្រព័ន្ធ PLP',
    icon: <SafetyOutlined />,
    color: '#1890ff'
  }
]

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedLoginType, setSelectedLoginType] = useState<string | null>(null)
  const [hasSelectedLoginType, setHasSelectedLoginType] = useState(false)

  // Handle Internal Login (Phone + Passcode)
  const handleInternalLogin = async (values: any) => {
    const phoneNumber = values.phone_number.replace(/\D/g, '') // Remove non-digits

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          passcode: values.passcode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        message.success('ចូលប្រើប្រាស់បានជោគជ័យ!')
        // Store user info in localStorage or context
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('user_contract_type', '4')

        // Check if user needs to sign contract (PARTNER role and not signed)
        if (data.requiresContractSigning) {
          // Contract type 4 & 5 need to configure options first
          if (data.user.contract_type === 4 || data.user.contract_type === 5) {
            router.push('/contract/configure')
          } else {
            // Contract type 1, 2, 3 go directly to sign
            router.push('/contract/sign')
          }
        } else {
          router.push('/dashboard')
        }
      } else {
        message.error(data.error || 'លេខទូរស័ព្ទ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការតភ្ជាប់')
    } finally {
      setLoading(false)
    }
  }

  // Handle External Login (Username + Password via Globe API)
  const handleExternalLogin = async (values: any) => {
    setLoading(true)
    try {
      // Step 1: Login to Globe API
      const response = await fetch('https://plp-api.moeys.gov.kh/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.accessToken) {
        // Store the external user data and token
        localStorage.setItem('external_access_token', data.accessToken)
        localStorage.setItem('external_user', JSON.stringify(data.user))
        localStorage.setItem('user_contract_type', '5')

        // Step 2: Create local session via bridge API
        const bridgeResponse = await fetch('/api/auth/external-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: data.accessToken,
            externalUser: data.user,
          }),
        })

        const bridgeData = await bridgeResponse.json()

        if (bridgeResponse.ok) {
          message.success('ចូលប្រើប្រាស់បានជោគជ័យ!')

          // Redirect based on contract signing requirements
          if (bridgeData.requiresContractSigning) {
            router.push('/contract/configure')
          } else {
            router.push('/dashboard')
          }
        } else {
          message.error(bridgeData.error || 'មានបញ្ហាក្នុងការបង្កើត session')
        }
      } else {
        message.error(data.message || 'ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ')
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('កំហុសក្នុងការតភ្ជាប់ទៅម៉ាស៊ីនមេ PLP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Row style={{ maxWidth: 1200, width: '100%' }} gutter={[48, 48]}>
        {/* Left Side - Branding */}
        <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Logo & Brand */}
            <Space size="middle" align="center">
              <div style={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}>
                <SafetyOutlined style={{ fontSize: 48, color: '#fff' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  ប្រព័ន្ធ PLP
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀង
                </Text>
              </div>
            </Space>

            {/* Welcome Message */}
            <div>
              <Title level={1} style={{ marginBottom: 16, fontSize: 42, color: '#262626' }}>
                ស្វាគមន៍
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#595959', marginBottom: 32 }}>
                ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសមិទ្ធកម្ម សម្រាប់គម្រោង PLP
              </Paragraph>
            </div>

            {/* Features */}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card variant="borderless" style={{ background: '#e6f7ff', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#1890ff',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      គ្រប់គ្រងកិច្ចព្រមព្រៀង
                    </Title>
                    <Text type="secondary">
                      ងាយស្រួលក្នុងការបង្កើត និងតាមដានកិច្ចព្រមព្រៀង
                    </Text>
                  </div>
                </Space>
              </Card>

              <Card variant="borderless" style={{ background: '#f6ffed', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#52c41a',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <RocketOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      តាមដានសមិទ្ធកម្ម
                    </Title>
                    <Text type="secondary">
                      ពិនិត្យមើលវឌ្ឍនភាព និងសមិទ្ធផលជាទៀងទាត់
                    </Text>
                  </div>
                </Space>
              </Card>

              <Card variant="borderless" style={{ background: '#fff2f0', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#ff4d4f',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <TeamOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      សហការជាមួយក្រុម
                    </Title>
                    <Text type="secondary">
                      ការងារជាក្រុមប្រកបដោយប្រសិទ្ធភាព
                    </Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Space>
        </Col>

        {/* Right Side - Login Form */}
        <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center' }}>
          <Card
            style={{
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {!hasSelectedLoginType
                  ? 'ជ្រើសរើសប្រភេទចូលប្រើ'
                  : selectedLoginType === 'internal'
                    ? 'ចូលប្រើប្រាស់ (ការិយាល័យអប់រំស្រុក/ខណ្ឌ)'
                    : 'ចូលប្រើប្រាស់ (សាលារៀន)'}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                {!hasSelectedLoginType
                  ? 'សូមជ្រើសរើសប្រភេទគណនីរបស់អ្នក'
                  : selectedLoginType === 'internal'
                    ? 'ចូលប្រើដោយប្រើលេខទូរស័ព្ទ និងលេខសម្ងាត់'
                    : 'ចូលប្រើដោយប្រើឈ្មោះអ្នកប្រើ និងលេខសម្ងាត់ពីប្រព័ន្ធ PLP'
                }
              </Text>
            </div>

            {/* Step 1: Login Type Selection */}
            {!hasSelectedLoginType && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {LOGIN_TYPES.map(type => (
                      <Card
                        key={type.id}
                        hoverable
                        onClick={() => {
                          setSelectedLoginType(type.id)
                          setHasSelectedLoginType(true)
                        }}
                        style={{
                          cursor: 'pointer',
                          border: '2px solid #d9d9d9',
                          transition: 'all 0.3s'
                        }}
                        bodyStyle={{ padding: '20px' }}
                      >
                        <Space align="start" size="large" style={{ width: '100%' }}>
                          <div style={{
                            fontSize: 48,
                            color: type.color,
                          }}>
                            {type.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
                              {type.title}
                            </div>
                            <div style={{ fontSize: 15, color: '#595959', marginBottom: 6 }}>
                              {type.subtitle}
                            </div>
                            <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                              {type.description}
                            </div>
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 13, color: type.color, fontWeight: 500 }}>
                                ចុចដើម្បីចូលប្រើប្រាស់ →
                              </Text>
                            </div>
                          </div>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </div>

                <Card
                  size="small"
                  style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: 24 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>ជំនួយ:</strong> សូមជ្រើសរើសប្រភេទគណនីដែលត្រូវនឹងតួនាទីរបស់អ្នក
                  </Text>
                </Card>
              </>
            )}

            {/* Step 2a: Internal Login Form (Phone + Passcode) */}
            {hasSelectedLoginType && selectedLoginType === 'internal' && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleInternalLogin}
                size="large"
              >
                <Form.Item
                  name="phone_number"
                  label="លេខទូរស័ព្ទ"
                  rules={[
                    { required: true, message: 'សូមបំពេញលេខទូរស័ព្ទ' },
                    { pattern: /^[0-9]{9,12}$/, message: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0123456789"
                    maxLength={12}
                    autoComplete="tel"
                  />
                </Form.Item>

                <Form.Item
                  name="passcode"
                  label="លេខសម្ងាត់ (4 ខ្ទង់)"
                  rules={[
                    { required: true, message: 'សូមបំពេញលេខសម្ងាត់' },
                    { pattern: /^[0-9]{4}$/, message: 'លេខសម្ងាត់ត្រូវតែមាន 4 ខ្ទង់' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="លេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទ"
                    maxLength={4}
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Card
                  size="small"
                  style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: 24 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>ជំនួយ:</strong> លេខសម្ងាត់គឺជាលេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទរបស់អ្នក
                  </Text>
                </Card>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<LoginOutlined />}
                    style={{ height: 48 }}
                  >
                    ចូលប្រើប្រាស់
                  </Button>
                </Form.Item>

                {/* Back Button */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    block
                    onClick={() => {
                      setHasSelectedLoginType(false)
                      setSelectedLoginType(null)
                      form.resetFields()
                    }}
                    style={{ height: 40 }}
                  >
                    ← ត្រឡប់ទៅជ្រើសរើសប្រភេទចូលប្រើ
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Step 2b: External Login Form (Username + Password) */}
            {hasSelectedLoginType && selectedLoginType === 'external' && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleExternalLogin}
                size="large"
              >
                <Form.Item
                  name="username"
                  label="ឈ្មោះអ្នកប្រើ"
                  rules={[{ required: true, message: 'សូមបំពេញឈ្មោះអ្នកប្រើ' }]}
                >
                  <Input
                    prefix={<UserAddOutlined />}
                    placeholder="បញ្ចូលឈ្មោះអ្នកប្រើ"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="លេខសម្ងាត់"
                  rules={[{ required: true, message: 'សូមបំពេញលេខសម្ងាត់' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="បញ្ចូលលេខសម្ងាត់"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Card
                  size="small"
                  style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 24 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>សំខាន់:</strong> សូមប្រើឈ្មោះអ្នកប្រើ និងលេខសម្ងាត់របស់អ្នកពីប្រព័ន្ធ PLP
                  </Text>
                </Card>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<LoginOutlined />}
                    style={{ height: 48 }}
                  >
                    ចូលប្រើប្រាស់
                  </Button>
                </Form.Item>

                {/* Back Button */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    block
                    onClick={() => {
                      setHasSelectedLoginType(false)
                      setSelectedLoginType(null)
                      form.resetFields()
                    }}
                    style={{ height: 40 }}
                  >
                    ← ត្រឡប់ទៅជ្រើសរើសប្រភេទចូលប្រើ
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Common Footer Links */}
            {hasSelectedLoginType && (
              <>
                <Divider plain>ឬ</Divider>

                <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                  <Text type="secondary">
                    មិនទាន់មានគណនី?
                  </Text>
                  <Link href="/register" style={{ width: '100%', display: 'block' }}>
                    <Button
                      size="large"
                      block
                      icon={<UserAddOutlined />}
                      style={{ height: 48 }}
                    >
                      ចុះឈ្មោះគណនីថ្មី
                    </Button>
                  </Link>
                </Space>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Link href="/">
                    <Text type="secondary">
                      ← ត្រឡប់ទៅទំព័រដើម
                    </Text>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
