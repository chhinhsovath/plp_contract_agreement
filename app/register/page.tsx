'use client'

import { useState } from 'react'
import { Form, Input, Button, Typography, message, Radio, Space, Divider, Card, Row, Col } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, BankOutlined, SolutionOutlined, LoginOutlined, FileTextOutlined, TeamOutlined, BookOutlined, HomeOutlined, SafetyOutlined, CheckCircleOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Text, Paragraph } = Typography

// Only show agreement types 4 and 5 for public registration
const CONTRACT_TYPES = [
  {
    id: 4,
    icon: <BookOutlined />,
    title: 'កិច្ចព្រមព្រៀង Provincial-District',
    subtitle: 'នាយកដ្ឋានបឋមសិក្សា និងការិយាល័យអប់រំស្រុក',
    description: 'សម្រាប់ការិយាល័យអប់រំស្រុក/ក្រុង/ខណ្ឌ',
  },
  {
    id: 5,
    icon: <HomeOutlined />,
    title: 'កិច្ចព្រមព្រៀង Provincial-School',
    subtitle: 'នាយកដ្ឋានបឋមសិក្សា និងសាលារៀន',
    description: 'សម្រាប់សាលាបឋមសិក្សា',
  },
]

export default function RegisterPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    // Extract last 4 digits of phone number as passcode
    const phoneNumber = values.phone_number.replace(/\D/g, '') // Remove non-digits
    const passcode = phoneNumber.slice(-4)

    if (phoneNumber.length < 9) {
      message.error('លេខទូរស័ព្ទមិនត្រឹមត្រូវ')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: values.full_name,
          phone_number: phoneNumber,
          passcode: passcode,
          contract_type: values.contract_type,
          organization: values.organization,
          position: values.position,
          email: values.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        message.success(`ការចុះឈ្មោះបានជោគជ័យ! កំពុងផ្ទេរទៅទំព័រកម្មវិធី...`)
        // Store contract type preference
        localStorage.setItem('user_contract_type', values.contract_type)

        // Auto-login after successful registration
        setTimeout(async () => {
          try {
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone_number: phoneNumber,
                passcode: passcode,
              }),
            })

            const loginData = await loginResponse.json()

            if (loginResponse.ok) {
              // Redirect based on contract type and signing requirements
              const contractType = values.contract_type
              const requiresContractSigning = loginData.requiresContractSigning

              if (requiresContractSigning) {
                // For contract types 4 & 5, go to configure page
                if (contractType === 4 || contractType === 5) {
                  router.push('/contract/configure')
                } else {
                  // For contract types 1, 2, 3, go to sign page
                  router.push('/contract/sign')
                }
              } else {
                // If already signed, go to dashboard
                router.push('/me-dashboard')
              }
            } else {
              message.error(loginData.error || 'ការចូលប្រើប្រាស់មិនជោគជ័យ')
              router.push('/login')
            }
          } catch (error) {
            message.error('កំហុសក្នុងការតភ្ជាប់')
            router.push('/login')
          }
        }, 1500)
      } else {
        message.error(data.error || 'ការចុះឈ្មោះមិនជោគជ័យ')
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
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
              }}>
                <SafetyOutlined style={{ fontSize: 48, color: '#fff' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
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
                ចុះឈ្មោះគណនីថ្មី
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#595959', marginBottom: 32 }}>
                បង្កើតគណនីរបស់អ្នក ដើម្បីចាប់ផ្តើមប្រើប្រាស់ប្រព័ន្ធ
              </Paragraph>
            </div>

            {/* Registration Steps */}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                    <UserOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      ព័ត៌មានផ្ទាល់ខ្លួន
                    </Title>
                    <Text type="secondary">
                      ឈ្មោះពេញ និងលេខទូរស័ព្ទសម្រាប់ចូលប្រើ
                    </Text>
                  </div>
                </Space>
              </Card>

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
                    <FileTextOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
                    </Title>
                    <Text type="secondary">
                      ជ្រើសរើសកិច្ចព្រមព្រៀងដែលពាក់ព័ន្ធនឹងតួនាទីរបស់អ្នក
                    </Text>
                  </div>
                </Space>
              </Card>

              <Card variant="borderless" style={{ background: '#fffbe6', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#faad14',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <BankOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      ព័ត៌មានស្ថាប័ន
                    </Title>
                    <Text type="secondary">
                      ស្ថាប័ន និងតួនាទីការងាររបស់អ្នក (ស្រេចចិត្ត)
                    </Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Space>
        </Col>

        {/* Right Side - Registration Form */}
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
                ចុះឈ្មោះ
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនី
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              {/* Personal Information */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  ព័ត៌មានផ្ទាល់ខ្លួន
                </Title>

                <Form.Item
                  name="full_name"
                  label="ឈ្មោះពេញ"
                  rules={[{ required: true, message: 'សូមបំពេញឈ្មោះពេញ' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="ឈ្មោះពេញជាភាសាខ្មែរ"
                  />
                </Form.Item>

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

                <Card
                  size="small"
                  style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 0 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>សំខាន់:</strong> លេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទនឹងក្លាយជាលេខសម្ងាត់របស់អ្នក
                  </Text>
                </Card>
              </div>

              {/* Contract Type */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
                </Title>

                <Form.Item
                  name="contract_type"
                  rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង' }]}
                >
                  <Radio.Group style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {CONTRACT_TYPES.map(type => (
                        <Card
                          key={type.id}
                          hoverable
                          style={{
                            cursor: 'pointer',
                            border: '2px solid #d9d9d9',
                            transition: 'all 0.3s'
                          }}
                          bodyStyle={{ padding: '16px' }}
                        >
                          <Radio value={type.id} style={{ width: '100%' }}>
                            <Space align="start" size="middle" style={{ width: '100%' }}>
                              <div style={{
                                fontSize: 32,
                                color: type.id === 4 ? '#52c41a' : '#1890ff',
                                marginTop: 4
                              }}>
                                {type.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                  {type.title}
                                </div>
                                <div style={{ fontSize: 14, color: '#595959', marginBottom: 4 }}>
                                  {type.subtitle}
                                </div>
                                <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                                  {type.description}
                                </div>
                              </div>
                            </Space>
                          </Radio>
                        </Card>
                      ))}
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <Card
                  size="small"
                  style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: 0 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>ជំនួយ:</strong> ប្រភេទកិច្ចព្រមព្រៀងនេះនឹងកំណត់សិទ្ធិចូលប្រើប្រាស់របស់អ្នក
                  </Text>
                </Card>
              </div>

              {/* Organization Information */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  ព័ត៌មានស្ថាប័ន <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>(ស្រេចចិត្ត)</Text>
                </Title>

                <Form.Item
                  name="organization"
                  label="ស្ថាប័ន/អង្គភាព"
                >
                  <Input
                    prefix={<BankOutlined />}
                    placeholder="ឈ្មោះស្ថាប័ន"
                  />
                </Form.Item>

                <Form.Item
                  name="position"
                  label="តួនាទីការងារ"
                >
                  <Input
                    prefix={<SolutionOutlined />}
                    placeholder="តួនាទីការងារ"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="អ៊ីមែល"
                  rules={[{ type: 'email', message: 'អ៊ីមែលមិនត្រឹមត្រូវ' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                  />
                </Form.Item>
              </div>

              {/* Submit Button */}
              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<RocketOutlined />}
                  style={{ height: 48 }}
                >
                  ចុះឈ្មោះគណនី
                </Button>
              </Form.Item>

              <Divider plain>ឬ</Divider>

              <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                <Text type="secondary">
                  មានគណនីរួចហើយ?
                </Text>
                <Link href="/login" style={{ width: '100%', display: 'block' }}>
                  <Button
                    size="large"
                    block
                    icon={<LoginOutlined />}
                    style={{ height: 48 }}
                  >
                    ចូលប្រើប្រាស់
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
