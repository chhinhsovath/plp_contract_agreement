'use client'

import { useState } from 'react'
import { Form, Input, Button, Typography, message, Select, Space, Divider, Steps } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, BankOutlined, SolutionOutlined, LoginOutlined, FileTextOutlined, TeamOutlined, BookOutlined, HomeOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Text } = Typography
const { Option } = Select

// Contract types matching the main page
const CONTRACT_TYPES = [
  {
    id: 1,
    icon: <BankOutlined />,
    title: 'កិច្ចព្រមព្រៀង PMU-PCU',
    description: 'គណៈគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ និង គណៈគ្រប់គ្រងគម្រោងតាមខេត្ត',
  },
  {
    id: 2,
    icon: <SolutionOutlined />,
    title: 'កិច្ចព្រមព្រៀង PCU-Project Manager',
    description: 'ប្រធាន គបក និងប្រធានគម្រោង',
  },
  {
    id: 3,
    icon: <TeamOutlined />,
    title: 'កិច្ចព្រមព្រៀង Project Manager-Regional',
    description: 'ប្រធានគម្រោង និងមន្រ្តីគម្រោងតាមតំបន់',
  },
  {
    id: 4,
    icon: <BookOutlined />,
    title: 'កិច្ចព្រមព្រៀង DoE-District Office',
    description: 'នាយកដ្ឋានអប់រំបឋមសិក្សា និងការិយាល័យអប់រំស្រុក',
  },
  {
    id: 5,
    icon: <HomeOutlined />,
    title: 'កិច្ចព្រមព្រៀង DoE-School',
    description: 'នាយកដ្ឋានអប់រំបឋមសិក្សា និងសាលាបឋមសិក្សា',
  },
]

export default function RegisterPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

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
        message.success(`ការចុះឈ្មោះបានជោគជ័យ! លេខសម្ងាត់របស់អ្នកគឺ ${passcode}`)
        // Store contract type preference for automatic login redirect
        localStorage.setItem('user_contract_type', values.contract_type)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
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
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Steps */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4 mb-16">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <SafetyOutlined className="text-4xl text-white" />
            </div>
            <div>
              <Title level={3} className="text-white mb-0 font-hanuman">
                ប្រព័ន្ធ PLP
              </Title>
              <Text className="text-purple-200">Contract Management System</Text>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <Title level={1} className="text-white mb-4 font-hanuman" style={{ fontSize: '3rem', lineHeight: '1.2' }}>
                ចុះឈ្មោះ
              </Title>
              <Text className="text-purple-100 text-xl block leading-relaxed">
                បង្កើតគណនីថ្មី ដើម្បីចាប់ផ្តើមប្រើប្រាស់ប្រព័ន្ធ
              </Text>
            </div>

            <Divider className="bg-white/20" />

            {/* Registration Steps */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    បំពេញព័ត៌មានផ្ទាល់ខ្លួន
                  </Text>
                  <Text className="text-purple-200">
                    ឈ្មោះពេញ និងលេខទូរស័ព្ទសម្រាប់ចូលប្រើ
                  </Text>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
                  </Text>
                  <Text className="text-purple-200">
                    ជ្រើសរើសកិច្ចព្រមព្រៀងដែលពាក់ព័ន្ធនឹងតួនាទីរបស់អ្នក
                  </Text>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    បំពេញព័ត៌មានស្ថាប័ន
                  </Text>
                  <Text className="text-purple-200">
                    ស្ថាប័ន និងតួនាទីការងាររបស់អ្នក
                  </Text>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    ចាប់ផ្តើមប្រើប្រាស់
                  </Text>
                  <Text className="text-purple-200">
                    ចូលប្រើប្រាស់ប្រព័ន្ធភ្លាមៗបន្ទាប់ពីចុះឈ្មោះ
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <Text className="text-purple-300 text-sm">
            © 2025 PLP Contract System. All rights reserved.
          </Text>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
              <SafetyOutlined className="text-3xl text-white" />
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-10">
            <Title level={2} className="text-gray-900 mb-2 font-hanuman">
              ចុះឈ្មោះគណនីថ្មី
            </Title>
            <Text className="text-gray-600 text-lg">
              សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនី
            </Text>
          </div>

          {/* Registration Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            className="space-y-1"
          >
            {/* Personal Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <Title level={5} className="font-hanuman text-gray-800 mb-4">
                ព័ត៌មានផ្ទាល់ខ្លួន
              </Title>

              <Form.Item
                name="full_name"
                label={<span className="text-gray-700 font-medium font-hanuman">ឈ្មោះពេញ</span>}
                rules={[{ required: true, message: 'សូមបំពេញឈ្មោះពេញ' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="ឈ្មោះពេញជាភាសាខ្មែរ"
                  className="h-12 font-hanuman"
                />
              </Form.Item>

              <Form.Item
                name="phone_number"
                label={<span className="text-gray-700 font-medium font-hanuman">លេខទូរស័ព្ទ</span>}
                rules={[
                  { required: true, message: 'សូមបំពេញលេខទូរស័ព្ទ' },
                  { pattern: /^[0-9]{9,12}$/, message: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' }
                ]}
                extra={
                  <div className="bg-amber-50 border border-amber-100 rounded p-3 mt-3">
                    <Text className="text-amber-700 font-hanuman text-sm">
                      <strong>សំខាន់:</strong> លេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទនឹងក្លាយជាលេខសម្ងាត់របស់អ្នក
                    </Text>
                  </div>
                }
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="0123456789"
                  maxLength={12}
                  className="h-12 font-hanuman"
                />
              </Form.Item>
            </div>

            {/* Contract Type Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <Title level={5} className="font-hanuman text-gray-800 mb-4">
                ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
              </Title>

              <Form.Item
                name="contract_type"
                label={<span className="text-gray-700 font-medium font-hanuman">ប្រភេទកិច្ចព្រមព្រៀង</span>}
                rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង' }]}
                extra={
                  <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-3">
                    <Text className="text-blue-700 font-hanuman text-sm">
                      ប្រភេទកិច្ចព្រមព្រៀងនេះនឹងកំណត់សិទ្ធិចូលប្រើប្រាស់របស់អ្នក
                    </Text>
                  </div>
                }
              >
                <Select
                  placeholder="ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង"
                  allowClear
                  showSearch={false}
                  className="font-hanuman"
                >
                  {CONTRACT_TYPES.map(type => (
                    <Option key={type.id} value={type.id}>
                      <div className="py-2">
                        <Space>
                          {type.icon}
                          <div>
                            <div className="font-semibold font-hanuman">{type.title}</div>
                            <div className="text-xs text-gray-500 font-hanuman">{type.description}</div>
                          </div>
                        </Space>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* Organization Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <Title level={5} className="font-hanuman text-gray-800 mb-4">
                ព័ត៌មានស្ថាប័ន (ស្រេចចិត្ត)
              </Title>

              <Form.Item
                name="organization"
                label={<span className="text-gray-700 font-medium font-hanuman">ស្ថាប័ន/អង្គភាព</span>}
              >
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="ឈ្មោះស្ថាប័ន"
                  className="h-12 font-hanuman"
                />
              </Form.Item>

              <Form.Item
                name="position"
                label={<span className="text-gray-700 font-medium font-hanuman">តួនាទីការងារ</span>}
              >
                <Input
                  prefix={<SolutionOutlined className="text-gray-400" />}
                  placeholder="តួនាទីការងារ"
                  className="h-12 font-hanuman"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium font-hanuman">អ៊ីមែល</span>}
                rules={[{ type: 'email', message: 'អ៊ីមែលមិនត្រឹមត្រូវ' }]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="example@email.com"
                  className="h-12 font-hanuman"
                />
              </Form.Item>
            </div>

            {/* Submit Button */}
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<UserOutlined />}
                className="h-12 text-base font-semibold font-hanuman shadow-lg hover:shadow-xl transition-all"
              >
                ចុះឈ្មោះ
              </Button>
            </Form.Item>
          </Form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <Divider className="my-6">
              <Text className="text-gray-500 font-hanuman">ឬ</Text>
            </Divider>
            <div className="space-y-4">
              <div>
                <Text className="text-gray-600 font-hanuman">
                  មានគណនីរួចហើយ?
                </Text>
              </div>
              <Link href="/login">
                <Button
                  size="large"
                  block
                  icon={<LoginOutlined />}
                  className="h-12 font-hanuman border-2 hover:border-blue-500 hover:text-blue-500 font-semibold"
                >
                  ចូលប្រើប្រាស់
                </Button>
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-hanuman font-medium">
              ← ត្រឡប់ទៅទំព័រដើម
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
