'use client'

import { useState } from 'react'
import { Form, Input, Button, Typography, message, Row, Col, Card, Space, Divider } from 'antd'
import { PhoneOutlined, LockOutlined, LoginOutlined, UserAddOutlined, SafetyOutlined, CheckCircleOutlined, RocketOutlined, TeamOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Text, Paragraph } = Typography

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
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

        // Check if user needs to sign contract (PARTNER role and not signed)
        if (data.requiresContractSigning) {
          router.push('/contract/sign')
        } else {
          router.push('/me-dashboard')
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
                  Contract Management System
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
              <Card bordered={false} style={{ background: '#e6f7ff', border: 'none' }}>
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

              <Card bordered={false} style={{ background: '#f6ffed', border: 'none' }}>
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

              <Card bordered={false} style={{ background: '#fff2f0', border: 'none' }}>
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
                ចូលប្រើប្រាស់
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                សូមចូលប្រើគណនីរបស់អ្នក ដើម្បីបន្តទៅកាន់ប្រព័ន្ធ
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
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
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
