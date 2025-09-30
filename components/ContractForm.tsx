'use client'

import React, { useState } from 'react'
import { Form, Input, Button, DatePicker, Select, Row, Col, Divider, Steps, message, Modal } from 'antd'
import { CONTRACT_TYPES, Contract } from '@/types/contract'
import SignaturePad from './SignaturePad'
import ContractPreview from './ContractPreview'
import LocationSelector from './LocationSelector'
import { getLocationFullName } from '@/lib/geoApi'
import dayjs from 'dayjs'

interface ContractFormProps {
  contractTypeId: number
  onSuccess: () => void
  onCancel: () => void
}

const { Step } = Steps
const { TextArea } = Input

const ContractForm: React.FC<ContractFormProps> = ({ contractTypeId, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [partyASignature, setPartyASignature] = useState<string>('')
  const [partyBSignature, setPartyBSignature] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [contractData, setContractData] = useState<Contract | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)

  const contractType = CONTRACT_TYPES.find(t => t.id === contractTypeId)

  // Set default values if available
  React.useEffect(() => {
    if (contractType && (contractType as any).default_party_a) {
      const defaults = (contractType as any).default_party_a
      form.setFieldsValue({
        party_a_name: defaults.name,
        party_a_position: defaults.position,
        party_a_organization: defaults.organization
      })
    }
  }, [contractType, form])

  const steps = [
    { title: 'ព័ត៌មានទូទៅ', description: 'បំពេញព័ត៌មានកិច្ចព្រមព្រៀង' },
    { title: 'ព័ត៌មានលម្អិត', description: 'បំពេញព័ត៌មានបន្ថែម' },
    { title: 'ហត្ថលេខា', description: 'ចុះហត្ថលេខាភាគីទាំងពីរ' },
    { title: 'ពិនិត្យនិងរក្សាទុក', description: 'ពិនិត្យមើលនិងបញ្ចប់' }
  ]

  const handleNext = async () => {
    try {
      if (currentStep === 0 || currentStep === 1) {
        await form.validateFields()
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      message.error('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់')
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!partyASignature || !partyBSignature) {
        message.error('សូមចុះហត្ថលេខាភាគីទាំងពីរ')
        return
      }

      const contract: Contract = {
        ...values,
        contract_type_id: contractTypeId,
        contract_number: `PLP-${Date.now()}`,
        party_a_signature: partyASignature,
        party_b_signature: partyBSignature,
        party_a_signed_date: new Date(),
        party_b_signed_date: new Date(),
        status: 'signed',
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      }

      setContractData(contract)
      setShowPreview(true)
    } catch (error) {
      message.error('កំហុសក្នុងការរក្សាទុកកិច្ចព្រមព្រៀង')
    }
  }

  const handleSaveContract = async () => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      })

      if (response.ok) {
        message.success('កិច្ចព្រមព្រៀងត្រូវបានរក្សាទុកដោយជោគជ័យ')
        onSuccess()
      } else {
        throw new Error('Failed to save contract')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការរក្សាទុក')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Divider>ព័ត៌មានភាគី ក</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="party_a_name"
                  label="ឈ្មោះភាគី ក"
                  rules={[{ required: true, message: 'សូមបំពេញឈ្មោះ' }]}
                >
                  <Input placeholder="ឈ្មោះពេញ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_a_position"
                  label="តួនាទី"
                  rules={[{ required: true, message: 'សូមបំពេញតួនាទី' }]}
                >
                  <Input placeholder="តួនាទី" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_a_organization"
                  label="អង្គភាព"
                  rules={[{ required: true, message: 'សូមបំពេញអង្គភាព' }]}
                >
                  <Input placeholder="អង្គភាព/ស្ថាប័ន" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>ព័ត៌មានភាគី ខ</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="party_b_name"
                  label="ឈ្មោះភាគី ខ"
                  rules={[{ required: true, message: 'សូមបំពេញឈ្មោះ' }]}
                >
                  <Input placeholder="ឈ្មោះពេញ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_b_position"
                  label="តួនាទី"
                  rules={[{ required: true, message: 'សូមបំពេញតួនាទី' }]}
                >
                  <Input placeholder="តួនាទី" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="party_b_organization"
                  label="អង្គភាព"
                  rules={[{ required: true, message: 'សូមបំពេញអង្គភាព' }]}
                >
                  <Input placeholder="អង្គភាព/ស្ថាប័ន" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>រយៈពេលកិច្ចព្រមព្រៀង</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="start_date"
                  label="ថ្ងៃចាប់ផ្តើម"
                  rules={[{ required: true, message: 'សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម' }]}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="end_date"
                  label="ថ្ងៃបញ្ចប់"
                  rules={[{ required: true, message: 'សូមជ្រើសរើសថ្ងៃបញ្ចប់' }]}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-hanuman">
                    ទីតាំង <span className="text-red-500">*</span>
                  </label>
                  <LocationSelector
                    onLocationChange={(location) => {
                      setSelectedLocation(location)
                      const locationString = getLocationFullName(location, 'kh')
                      form.setFieldsValue({ location: locationString })
                    }}
                    required={{ province: true, district: true, commune: false, village: false }}
                  />
                </div>
                <Form.Item
                  name="location"
                  hidden
                  rules={[{ required: true, message: 'សូមជ្រើសរើសទីតាំង' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 1:
        return (
          <>
            <Divider>ព័ត៌មានលម្អិតតាមប្រភេទកិច្ចព្រមព្រៀង</Divider>
            {contractType?.fields.map((field) => (
              <Form.Item
                key={field.field_name}
                name={field.field_name}
                label={field.field_name}
                rules={[{ required: field.is_required, message: `សូមបំពេញ ${field.field_name}` }]}
              >
                {field.field_type === 'text' && <TextArea rows={3} />}
                {field.field_type === 'number' && <Input type="number" />}
                {field.field_type === 'dropdown' && (
                  <Select>
                    <Select.Option value="monthly">ប្រចាំខែ</Select.Option>
                    <Select.Option value="quarterly">ប្រចាំត្រីមាស</Select.Option>
                    <Select.Option value="yearly">ប្រចាំឆ្នាំ</Select.Option>
                  </Select>
                )}
              </Form.Item>
            ))}
          </>
        )

      case 2:
        return (
          <Row gutter={32}>
            <Col span={12}>
              <SignaturePad
                label="ហត្ថលេខាភាគី ក"
                onSave={(sig) => {
                  setPartyASignature(sig)
                  message.success('ហត្ថលេខាភាគី ក ត្រូវបានរក្សាទុក')
                }}
              />
              {partyASignature && (
                <div className="mt-2">
                  <img src={partyASignature} alt="ហត្ថលេខាភាគី ក" className="h-20 border p-1" />
                </div>
              )}
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
                <div className="mt-2">
                  <img src={partyBSignature} alt="ហត្ថលេខាភាគី ខ" className="h-20 border p-1" />
                </div>
              )}
            </Col>
          </Row>
        )

      case 3:
        const formValues = form.getFieldsValue()
        return (
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">សង្ខេបកិច្ចព្រមព្រៀង</h3>
            <div className="space-y-2">
              <p><strong>ប្រភេទកិច្ចព្រមព្រៀង:</strong> {contractType?.type_name_khmer}</p>
              <p><strong>ភាគី ក:</strong> {formValues.party_a_name} - {formValues.party_a_position}</p>
              <p><strong>ភាគី ខ:</strong> {formValues.party_b_name} - {formValues.party_b_position}</p>
              <p><strong>រយៈពេល:</strong> {formValues.start_date?.format('DD/MM/YYYY')} ដល់ {formValues.end_date?.format('DD/MM/YYYY')}</p>
              <p><strong>ទីកន្លែង:</strong> {formValues.location}</p>
            </div>
            <div className="mt-4 flex space-x-4">
              {partyASignature && (
                <div>
                  <p className="text-sm text-gray-600">ហត្ថលេខាភាគី ក</p>
                  <img src={partyASignature} alt="ហត្ថលេខាភាគី ក" className="h-20 border p-1" />
                </div>
              )}
              {partyBSignature && (
                <div>
                  <p className="text-sm text-gray-600">ហត្ថលេខាភាគី ខ</p>
                  <img src={partyBSignature} alt="ហត្ថលេខាភាគី ខ" className="h-20 border p-1" />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Steps current={currentStep} className="mb-8">
        {steps.map((step) => (
          <Step key={step.title} title={step.title} description={step.description} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        className="mt-8"
      >
        {renderStepContent()}
      </Form>

      <div className="mt-8 flex justify-between">
        <Button onClick={onCancel}>បោះបង់</Button>
        <div className="space-x-2">
          {currentStep > 0 && (
            <Button onClick={handlePrev}>ត្រឡប់ក្រោយ</Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>បន្ទាប់</Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleSubmit}>រក្សាទុកកិច្ចព្រមព្រៀង</Button>
          )}
        </div>
      </div>

      <Modal
        title="មើលកិច្ចព្រមព្រៀង"
        open={showPreview}
        onOk={handleSaveContract}
        onCancel={() => setShowPreview(false)}
        width={800}
        okText="រក្សាទុក"
        cancelText="កែប្រែ"
      >
        {contractData && <ContractPreview contract={contractData} contractType={contractType!} />}
      </Modal>
    </>
  )
}

export default ContractForm