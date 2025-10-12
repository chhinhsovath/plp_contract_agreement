'use client'

import { useState } from 'react'
import { Form, Input, Button, Typography, message, Divider } from 'antd'
import { PhoneOutlined, LockOutlined, LoginOutlined, UserAddOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Text } = Typography

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
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
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
              <Text className="text-blue-200">Contract Management System</Text>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <Title level={1} className="text-white mb-4 font-hanuman" style={{ fontSize: '3rem', lineHeight: '1.2' }}>
                ស្វាគមន៍
              </Title>
              <Text className="text-blue-100 text-xl block leading-relaxed">
                ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសមិទ្ធកម្ម សម្រាប់គម្រោង PLP
              </Text>
            </div>

            <Divider className="bg-white/20" />

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    គ្រប់គ្រងកិច្ចព្រមព្រៀង
                  </Text>
                  <Text className="text-blue-200">
                    ងាយស្រួលក្នុងការបង្កើត និងតាមដានកិច្ចព្រមព្រៀង
                  </Text>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    តាមដានសមិទ្ធកម្ម
                  </Text>
                  <Text className="text-blue-200">
                    ពិនិត្យមើលវឌ្ឍនភាព និងសមិទ្ធផលជាទៀងទាត់
                  </Text>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Text className="text-white font-semibold block mb-1 font-hanuman text-lg">
                    សុវត្ថិភាព និងសម្ងាត់
                  </Text>
                  <Text className="text-blue-200">
                    ការពារទិន្នន័យរបស់អ្នកដោយប្រព័ន្ធសុវត្ថិភាព
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <Text className="text-blue-300 text-sm">
            © 2025 PLP Contract System. All rights reserved.
          </Text>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <SafetyOutlined className="text-3xl text-white" />
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-10">
            <Title level={2} className="text-gray-900 mb-2 font-hanuman">
              ចូលប្រើប្រាស់
            </Title>
            <Text className="text-gray-600 text-lg">
              សូមចូលប្រើគណនីរបស់អ្នក ដើម្បីបន្តទៅកាន់ប្រព័ន្ធ
            </Text>
          </div>

          {/* Login Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            className="space-y-2"
          >
            <Form.Item
              name="phone_number"
              label={<span className="text-gray-700 font-medium font-hanuman text-base">លេខទូរស័ព្ទ</span>}
              rules={[
                { required: true, message: 'សូមបំពេញលេខទូរស័ព្ទ' },
                { pattern: /^[0-9]{9,12}$/, message: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="0123456789"
                maxLength={12}
                className="h-12 font-hanuman"
              />
            </Form.Item>

            <Form.Item
              name="passcode"
              label={<span className="text-gray-700 font-medium font-hanuman text-base">លេខសម្ងាត់ (4 ខ្ទង់)</span>}
              rules={[
                { required: true, message: 'សូមបំពេញលេខសម្ងាត់' },
                { pattern: /^[0-9]{4}$/, message: 'លេខសម្ងាត់ត្រូវតែមាន 4 ខ្ទង់' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="លេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទ"
                maxLength={4}
                className="h-12 font-hanuman"
              />
            </Form.Item>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <Text className="text-blue-700 font-hanuman text-sm">
                <strong>ជំនួយ:</strong> លេខសម្ងាត់គឺជាលេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទរបស់អ្នក
              </Text>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<LoginOutlined />}
                className="h-12 text-base font-semibold font-hanuman shadow-lg hover:shadow-xl transition-all"
              >
                ចូលប្រើប្រាស់
              </Button>
            </Form.Item>
          </Form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <Divider className="my-6">
              <Text className="text-gray-500 font-hanuman">ឬ</Text>
            </Divider>
            <div className="space-y-4">
              <div>
                <Text className="text-gray-600 font-hanuman">
                  មិនទាន់មានគណនី?
                </Text>
              </div>
              <Link href="/register">
                <Button
                  size="large"
                  block
                  icon={<UserAddOutlined />}
                  className="h-12 font-hanuman border-2 hover:border-blue-500 hover:text-blue-500 font-semibold"
                >
                  ចុះឈ្មោះគណនីថ្មី
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
