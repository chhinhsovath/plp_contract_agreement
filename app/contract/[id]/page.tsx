'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Form, Input, InputNumber, DatePicker, Button, Card, Row, Col, Divider, Space, Typography, message, Modal, Tabs, Alert } from 'antd'
import { PrinterOutlined, SaveOutlined, FileTextOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { getContractTemplate } from '@/lib/contract-templates'
import SignaturePad from '@/components/SignaturePad'
import { defaultPartyA } from '@/lib/defaultPartyA'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function ContractPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = Number(params.id)
  const template = getContractTemplate(contractId)

  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1')
  const [partyASignature, setPartyASignature] = useState<string>(defaultPartyA.signature.data)
  const [partyBSignature, setPartyBSignature] = useState<string>('')
  const [formData, setFormData] = useState<any>({})
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (!template) {
      message.error('កិច្ចព្រមព្រៀងមិនត្រូវបានរកឃើញ')
      router.push('/')
      return
    }

    // Set default Party A values when form tab is active
    if (form && activeTab === '2') {
      form.setFieldsValue({
        party_a_name: `${defaultPartyA.signatory.title} ${defaultPartyA.signatory.name_khmer}`,
        party_a_position: defaultPartyA.signatory.position_khmer,
        party_a_organization: defaultPartyA.organization.name_khmer
      })
    }
  }, [template, form, router, activeTab])

  if (!template) {
    return null
  }

  const handleFormSubmit = async (values: any) => {
    if (!partyBSignature) {
      message.error('សូមចុះហត្ថលេខាភាគី ខ')
      return
    }

    const contractData = {
      ...values,
      contract_type_id: contractId,
      contract_number: `PLP-${contractId}-${Date.now()}`,
      party_a_signature: partyASignature,
      party_b_signature: partyBSignature,
      party_a_signed_date: new Date(),
      party_b_signed_date: new Date(),
      status: 'signed',
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
    }

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      })

      if (response.ok) {
        message.success('កិច្ចព្រមព្រៀងត្រូវបានរក្សាទុកដោយជោគជ័យ')
        router.push('/contracts')
      } else {
        throw new Error('Failed to save contract')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការរក្សាទុក')
    }
  }

  const handlePreview = () => {
    form.validateFields().then(values => {
      setFormData(values)
      setPreviewMode(true)
    }).catch(() => {
      message.error('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់')
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const renderSection = (section: any, index: number) => (
    <div key={index} className="mb-8 font-hanuman">
      <Title level={3} className="font-hanuman text-blue-800 mb-4">
        {section.title}
      </Title>

      {section.content && (
        <Paragraph className="text-base leading-relaxed ml-8 font-hanuman">
          {section.content}
        </Paragraph>
      )}

      {section.items && (
        <ul className="list-disc ml-12 space-y-2 font-hanuman">
          {section.items.map((item: string, i: number) => (
            <li key={i} className="text-base font-hanuman">{item}</li>
          ))}
        </ul>
      )}

      {section.table && (
        <div className="ml-8 mt-4">
          <table className="min-w-full border-collapse border border-gray-300 font-hanuman">
            <thead>
              <tr className="bg-gray-100">
                {section.table.headers.map((header: string, i: number) => (
                  <th key={i} className="border border-gray-300 px-4 py-2 text-left font-semibold font-hanuman">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row: string[], i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell: string, j: number) => (
                    <td key={j} className="border border-gray-300 px-4 py-2 font-hanuman">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.subsections && section.subsections.map((subsection: any, i: number) => (
        <div key={i} className="ml-8 mt-4 font-hanuman">
          {subsection.title && (
            <Text strong className="text-base font-hanuman">
              {subsection.number} {subsection.title}
            </Text>
          )}
          {subsection.content && (
            <Paragraph className="ml-4 mt-2 font-hanuman">
              <span className="font-semibold mr-2 font-hanuman">{subsection.number}</span>
              {subsection.content}
            </Paragraph>
          )}
          {subsection.items && (
            <ul className="list-disc ml-12 mt-2 space-y-1 font-hanuman">
              {subsection.items.map((item: string, j: number) => (
                <li key={j} className="font-hanuman">{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={[{ required: field.required, message: `សូមបំពេញ ${field.label}` }]}
            initialValue={field.defaultValue}
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

  const tabItems = [
    {
      key: '1',
      label: <span className="font-hanuman"><FileTextOutlined /> មាត្រានៃកិច្ចព្រមព្រៀង</span>,
      children: (
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Title level={1} className="font-hanuman text-blue-900">
              ព្រះរាជាណាចក្រកម្ពុជា
            </Title>
            <Title level={2} className="font-hanuman">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </Title>
            <div className="mt-4">
              <div className="inline-block border-b-4 border-blue-600 w-32"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <Title level={2} className="font-hanuman text-blue-800">
              {template.title}
            </Title>
            {template.subtitle && (
              <Text className="text-gray-600 text-lg font-hanuman">{template.subtitle}</Text>
            )}
          </div>

          <Divider />

          <div className="contract-content font-hanuman">
            {template.sections.map((section, index) => renderSection(section, index))}
          </div>
        </Card>
      )
    },
    {
      key: '2',
      label: <span className="font-hanuman"><EditOutlined /> បំពេញព័ត៌មាន</span>,
      children: (
        <Card className="shadow-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            onFinishFailed={(errorInfo) => {
              console.error('Form validation failed:', errorInfo)
              const errorFields = errorInfo.errorFields || []
              const fieldNames = errorFields.map((f: any) => f.name[0]).join(', ')
              message.error(`សូមបំពេញវាលទាំងនេះ: ${fieldNames}`)
            }}
            size="large"
            className="font-hanuman"
          >
            <Title level={3} className="mb-6 text-blue-800 font-hanuman">ព័ត៌មានភាគី</Title>

            <Row gutter={24}>
              {template.fields.slice(0, Math.ceil(template.fields.length / 2)).map(field => (
                <Col span={12} key={field.name}>
                  {renderField(field)}
                </Col>
              ))}
            </Row>

            <Row gutter={24}>
              {template.fields.slice(Math.ceil(template.fields.length / 2)).map(field => (
                <Col span={12} key={field.name}>
                  {renderField(field)}
                </Col>
              ))}
            </Row>

            <Divider />

            <Title level={3} className="mb-6 text-blue-800 font-hanuman">ហត្ថលេខាភាគីទាំងពីរ</Title>

            <Row gutter={32}>
              <Col span={12}>
                <Card className="text-center">
                  <Title level={4} className="font-hanuman">ហត្ថលេខាភាគី ក</Title>
                  <div className="mb-2">
                    <Text className="font-hanuman">{defaultPartyA.signatory.title} {defaultPartyA.signatory.name_khmer}</Text>
                    <br />
                    <Text type="secondary" className="text-sm font-hanuman">{defaultPartyA.signatory.position_khmer}</Text>
                  </div>
                  {partyASignature && (
                    <div className="mt-4 text-center">
                      <img src={partyASignature} alt="ហត្ថលេខាភាគី ក" className="h-24 mx-auto border p-2" />
                      <Text type="success" className="block mt-2 font-hanuman">
                        ✓ ហត្ថលេខាបានដាក់រួចរាល់
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <SignaturePad
                  label="ហត្ថលេខាភាគី ខ"
                  onSave={(sig) => {
                    setPartyBSignature(sig)
                    message.success('ហត្ថលេខាភាគី ខ ត្រូវបានរក្សាទុក')
                  }}
                />
                {partyBSignature && (
                  <div className="mt-4 text-center">
                    <img src={partyBSignature} alt="ហត្ថលេខាភាគី ខ" className="h-24 mx-auto border p-2" />
                  </div>
                )}
              </Col>
            </Row>

            <Divider />

            <div className="text-center">
              <Space size="large">
                <Button size="large" onClick={() => router.push('/')} className="font-hanuman">
                  បោះបង់
                </Button>
                <Button type="default" size="large" onClick={handlePreview} className="font-hanuman">
                  មើលជាមុន
                </Button>
                <Button type="primary" size="large" htmlType="submit" className="font-hanuman">
                  រក្សាទុកកិច្ចព្រមព្រៀង
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-hanuman">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/')}
              type="text"
              className="text-white hover:text-blue-200 font-hanuman"
            >
              ត្រឡប់ក្រោយ
            </Button>
            <Title level={2} className="text-white mb-0 font-hanuman">
              {template.title}
            </Title>
          </div>
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint} className="font-hanuman">
              បោះពុម្ព
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} className="font-hanuman">
              រក្សាទុក
            </Button>
          </Space>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          className="font-hanuman"
          items={tabItems}
        />
      </div>

      <style jsx global>{`
        @media print {
          .ant-tabs-nav,
          .ant-btn,
          .ant-space,
          button {
            display: none !important;
          }
          .contract-content {
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  )
}