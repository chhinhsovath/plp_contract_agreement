'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { PhoneOutlined, LockOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons'
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
        router.push('/')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <LoginOutlined className="text-4xl text-blue-600" />
            </div>
          </div>
          <Title level={2} className="text-blue-800 font-hanuman mb-2">
            ចូលប្រើប្រាស់
          </Title>
          <Text className="text-gray-600 font-hanuman">
            ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          className="font-hanuman"
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
              className="font-hanuman h-12"
            >
              ចូលប្រើប្រាស់
            </Button>
          </Form.Item>

          <div className="text-center space-y-2">
            <div>
              <Text className="font-hanuman text-gray-600">
                មិនមានគណនី?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                  ចុះឈ្មោះឥឡូវនេះ
                </Link>
              </Text>
            </div>
            <div>
              <Text className="font-hanuman text-sm text-gray-500">
                លេខសម្ងាត់គឺជាលេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទរបស់អ្នក
              </Text>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}