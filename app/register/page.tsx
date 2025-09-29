'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Select, Tag, Space } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, BankOutlined, SolutionOutlined, LoginOutlined, FileTextOutlined, TeamOutlined, BookOutlined, HomeOutlined } from '@ant-design/icons'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <Title level={2} className="text-blue-800 font-hanuman mb-2">
            ចុះឈ្មោះគណនីថ្មី
          </Title>
          <Text className="text-gray-600 font-hanuman">
            សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីចុះឈ្មោះ
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
            name="full_name"
            label="ឈ្មោះពេញ"
            rules={[{ required: true, message: 'សូមបំពេញឈ្មោះពេញ' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="ឈ្មោះពេញជាភាសាខ្មែរ" />
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

          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <Text className="text-blue-700 font-hanuman">
              <strong>សម្គាល់:</strong> លេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទនឹងក្លាយជាលេខសម្ងាត់របស់អ្នក
            </Text>
          </div>

          <Form.Item
            name="contract_type"
            label="ប្រភេទកិច្ចព្រមព្រៀងដែលពាក់ព័ន្ធ"
            rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង' }]}
          >
            <Select
              placeholder="ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង"
              allowClear
              showSearch={false}
            >
              {CONTRACT_TYPES.map(type => (
                <Option key={type.id} value={type.id}>
                  <Space>
                    {type.icon}
                    <div>
                      <div className="font-semibold">{type.title}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="bg-amber-50 p-3 rounded-md mb-4">
            <Text className="text-amber-700 font-hanuman text-sm">
              <strong>សម្គាល់:</strong> ប្រភេទកិច្ចព្រមព្រៀងនេះនឹងកំណត់កិច្ចព្រមព្រៀងដែលអ្នកអាចបង្កើត និងមើលឃើញ
            </Text>
          </div>

          <Form.Item
            name="organization"
            label="ស្ថាប័ន/អង្គភាព"
          >
            <Input prefix={<BankOutlined />} placeholder="ឈ្មោះស្ថាប័ន" />
          </Form.Item>

          <Form.Item
            name="position"
            label="តួនាទី"
          >
            <Input prefix={<SolutionOutlined />} placeholder="តួនាទីការងារ" />
          </Form.Item>

          <Form.Item
            name="email"
            label="អ៊ីមែល (ស្រេច)"
            rules={[{ type: 'email', message: 'អ៊ីមែលមិនត្រឹមត្រូវ' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@email.com" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<UserOutlined />}
              className="font-hanuman h-12"
            >
              ចុះឈ្មោះ
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="font-hanuman text-gray-600">
              មានគណនីរួចហើយ?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                ចូលប្រើប្រាស់
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}