'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Form, Input, InputNumber, DatePicker, Button, Card, Row, Col, Divider, Space, Typography, message, Spin } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { getContractTemplate } from '@/lib/contract-templates'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

export default function EditContractPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contractData, setContractData] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)

  useEffect(() => {
    fetchContract()
  }, [contractId])

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`)
      if (response.ok) {
        const data = await response.json()
        setContractData(data)

        // Get the template based on contract type
        const contractTemplate = getContractTemplate(data.contract_type_id)
        setTemplate(contractTemplate)

        // Set form values
        form.setFieldsValue({
          party_a_name: data.party_a_name,
          party_a_position: data.party_a_position,
          party_a_organization: data.party_a_organization,
          party_b_name: data.party_b_name,
          party_b_position: data.party_b_position,
          party_b_organization: data.party_b_organization,
          start_date: dayjs(data.start_date),
          end_date: dayjs(data.end_date),
          location: data.location,
          ...data.additional_data,
        })

        // Set field values
        if (data.contract_fields) {
          const fieldValues: any = {}
          data.contract_fields.forEach((field: any) => {
            fieldValues[field.field_name] = field.field_value
          })
          form.setFieldsValue(fieldValues)
        }
      } else {
        message.error('កិច្ចព្រមព្រៀងមិនត្រូវបានរកឃើញ')
        router.push('/contracts')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការទាញយកទិន្នន័យ')
      router.push('/contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setSaving(true)
    try {
      const fields = template?.fields?.map((field: any) => ({
        field_name: field.name,
        field_value: values[field.name],
        field_type: field.type,
        is_required: field.required,
      })) || []

      const updateData = {
        party_a_name: values.party_a_name,
        party_a_position: values.party_a_position,
        party_a_organization: values.party_a_organization,
        party_b_name: values.party_b_name,
        party_b_position: values.party_b_position,
        party_b_organization: values.party_b_organization,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        location: values.location,
        status: contractData.status,
        party_a_signature: contractData.party_a_signature,
        party_b_signature: contractData.party_b_signature,
        party_a_signed_date: contractData.party_a_signed_date,
        party_b_signed_date: contractData.party_b_signed_date,
        additional_data: {
          ...Object.keys(values).reduce((acc: any, key) => {
            if (!['party_a_name', 'party_a_position', 'party_a_organization',
                 'party_b_name', 'party_b_position', 'party_b_organization',
                 'start_date', 'end_date', 'location'].includes(key)) {
              acc[key] = values[key]
            }
            return acc
          }, {})
        },
        fields,
      }

      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        message.success('កិច្ចព្រមព្រៀងត្រូវបានកែប្រែដោយជោគជ័យ')
        router.push('/contracts')
      } else {
        throw new Error('Failed to update contract')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការកែប្រែ')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `សូមបំពេញ ${field.label}` }]}
          >
            <Input size="large" />
          </Form.Item>
        )
      case 'number':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `សូមបំពេញ ${field.label}` }]}
          >
            <InputNumber size="large" className="w-full" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        )
      case 'date':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `សូមជ្រើសរើស ${field.label}` }]}
          >
            <DatePicker size="large" className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        )
      case 'textarea':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `សូមបំពេញ ${field.label}` }]}
          >
            <TextArea rows={3} size="large" />
          </Form.Item>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!contractData || !template) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 font-hanuman">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/contracts')}
              type="text"
              className="text-white hover:text-blue-200 font-hanuman"
            >
              ត្រឡប់ក្រោយ
            </Button>
            <Title level={2} className="text-white mb-0 font-hanuman">
              កែប្រែកិច្ចព្រមព្រៀង
            </Title>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="shadow-lg">
          <div className="mb-4">
            <Text className="text-gray-600 font-hanuman">លេខកិច្ចព្រមព្រៀង: {contractData.contract_number}</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            className="font-hanuman"
          >
            <Title level={3} className="mb-6 text-blue-800 font-hanuman">ព័ត៌មានភាគី ក</Title>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="party_a_name"
                  label="ឈ្មោះភាគី ក"
                  rules={[{ required: true, message: 'សូមបំពេញឈ្មោះ' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_a_position"
                  label="តួនាទី"
                  rules={[{ required: true, message: 'សូមបំពេញតួនាទី' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_a_organization"
                  label="អង្គភាព"
                  rules={[{ required: true, message: 'សូមបំពេញអង្គភាព' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={3} className="mb-6 text-blue-800 font-hanuman">ព័ត៌មានភាគី ខ</Title>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="party_b_name"
                  label="ឈ្មោះភាគី ខ"
                  rules={[{ required: true, message: 'សូមបំពេញឈ្មោះ' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_b_position"
                  label="តួនាទី"
                  rules={[{ required: true, message: 'សូមបំពេញតួនាទី' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_b_organization"
                  label="អង្គភាព"
                  rules={[{ required: true, message: 'សូមបំពេញអង្គភាព' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={3} className="mb-6 text-blue-800 font-hanuman">រយៈពេលនិងទីកន្លែង</Title>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="start_date"
                  label="ថ្ងៃចាប់ផ្តើម"
                  rules={[{ required: true, message: 'សូមជ្រើសរើសថ្ងៃ' }]}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="end_date"
                  label="ថ្ងៃបញ្ចប់"
                  rules={[{ required: true, message: 'សូមជ្រើសរើសថ្ងៃ' }]}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="location"
                  label="ទីកន្លែង"
                  rules={[{ required: true, message: 'សូមបំពេញទីកន្លែង' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {template.fields && template.fields.length > 0 && (
              <>
                <Divider />
                <Title level={3} className="mb-6 text-blue-800 font-hanuman">ព័ត៌មានបន្ថែម</Title>
                <Row gutter={24}>
                  {template.fields.map((field: any) => (
                    <Col span={12} key={field.name}>
                      {renderField(field)}
                    </Col>
                  ))}
                </Row>
              </>
            )}

            <Divider />

            <div className="text-center">
              <Space size="large">
                <Button size="large" onClick={() => router.push('/contracts')} className="font-hanuman">
                  បោះបង់
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                  className="font-hanuman"
                >
                  រក្សាទុកការកែប្រែ
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}