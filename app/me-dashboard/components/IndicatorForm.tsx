'use client'

import { useState } from 'react'
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface IndicatorFormProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  indicator?: any
}

export default function IndicatorForm({
  visible,
  onClose,
  onSuccess,
  indicator
}: IndicatorFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = indicator
        ? `/api/me/indicators/${indicator.id}`
        : '/api/me/indicators'

      const method = indicator ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        throw new Error('Failed to save indicator')
      }

      message.success(indicator ? 'សូចនាករបានធ្វើបច្ចុប្បន្នភាព' : 'សូចនាករបានបង្កើត')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving indicator:', error)
      message.error('មានបញ្ហាក្នុងការរក្សាទុកសូចនាករ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={indicator ? 'កែប្រែសូចនាករ' : 'បង្កើតសូចនាករថ្មី'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={indicator || {
          indicator_type: 'output',
          frequency: 'monthly',
          baseline_value: 0
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="indicator_code"
          label="លេខកូដសូចនាករ"
          rules={[{ required: true, message: 'សូមបញ្ចូលលេខកូដ' }]}
        >
          <Input placeholder="ឧ. PMU-IND-001" />
        </Form.Item>

        <Form.Item
          name="indicator_name_khmer"
          label="ឈ្មោះសូចនាករ (ភាសាខ្មែរ)"
          rules={[{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ' }]}
        >
          <Input placeholder="ចំនួន គបក ដែលទទួលបានការបណ្តុះបណ្តាល" />
        </Form.Item>

        <Form.Item
          name="indicator_name_english"
          label="ឈ្មោះសូចនាករ (English)"
        >
          <Input placeholder="Number of PCUs trained" />
        </Form.Item>

        <Form.Item
          name="contract_type"
          label="ប្រភេទកិច្ចសន្យា"
          rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទកិច្ចសន្យា' }]}
        >
          <Select>
            <Option value={1}>PMU-PCU Agreement</Option>
            <Option value={2}>PCU-Project Manager</Option>
            <Option value={3}>Project Manager-Regional</Option>
            <Option value={4}>DoE-District Office</Option>
            <Option value={5}>DoE-School Agreement</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="indicator_type"
          label="ប្រភេទសូចនាករ"
          rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទ' }]}
        >
          <Select>
            <Option value="output">Output / លទ្ធផល</Option>
            <Option value="outcome">Outcome / លទ្ធផលចុងក្រោយ</Option>
            <Option value="impact">Impact / ផលប៉ះពាល់</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="measurement_unit"
          label="ឯកតាវាស់វែង"
          rules={[{ required: true, message: 'សូមបញ្ចូលឯកតា' }]}
        >
          <Input placeholder="ឧ. ចំនួន, ភាគរយ, ពិន្ទុ" />
        </Form.Item>

        <Form.Item
          name="baseline_value"
          label="តម្លៃមូលដ្ឋាន (Baseline)"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="0"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="target_value"
          label="គោលដៅ (Target)"
          rules={[{ required: true, message: 'សូមបញ្ចូលតម្លៃគោលដៅ' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="100"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="frequency"
          label="ភាពញឹកញាប់នៃការប្រមូល"
          rules={[{ required: true, message: 'សូមជ្រើសរើសភាពញឹកញាប់' }]}
        >
          <Select>
            <Option value="daily">ប្រចាំថ្ងៃ</Option>
            <Option value="weekly">ប្រចាំសប្តាហ៍</Option>
            <Option value="monthly">ប្រចាំខែ</Option>
            <Option value="quarterly">ប្រចាំត្រីមាស</Option>
            <Option value="annually">ប្រចាំឆ្នាំ</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="ការពិពណ៌នា"
        >
          <TextArea
            rows={3}
            placeholder="បញ្ចូលព័ត៌មានបន្ថែម"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>
              បោះបង់
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
            >
              {indicator ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតសូចនាករ'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}