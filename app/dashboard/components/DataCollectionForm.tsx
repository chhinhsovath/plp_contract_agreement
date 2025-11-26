'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Select, InputNumber, DatePicker, Input, Button, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface DataCollectionFormProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  indicatorId?: number
}

export default function DataCollectionForm({
  visible,
  onClose,
  onSuccess,
  indicatorId
}: DataCollectionFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [indicators, setIndicators] = useState<any[]>([])
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null)

  useEffect(() => {
    if (visible) {
      fetchIndicators()
    }
  }, [visible])

  useEffect(() => {
    if (indicatorId && indicators.length > 0) {
      const indicator = indicators.find(ind => ind.id === indicatorId)
      if (indicator) {
        setSelectedIndicator(indicator)
        form.setFieldValue('indicator_id', indicatorId)
      }
    }
  }, [indicatorId, indicators])

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/me/indicators')
      if (response.ok) {
        const data = await response.json()
        setIndicators(data.indicators || [])
      }
    } catch (error) {
      console.error('Error fetching indicators:', error)
    }
  }

  const handleIndicatorChange = (value: number) => {
    const indicator = indicators.find(ind => ind.id === value)
    setSelectedIndicator(indicator)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const formattedValues = {
        ...values,
        collection_date: values.collection_date?.format('YYYY-MM-DD'),
        collected_by: values.collected_by || 'System'
      }

      const response = await fetch('/api/me/data-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedValues)
      })

      if (!response.ok) {
        throw new Error('Failed to save data collection')
      }

      message.success('ទិន្នន័យបានរក្សាទុកដោយជោគជ័យ')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving data collection:', error)
      message.error('មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="បញ្ចូលទិន្នន័យសូចនាករ"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          collection_date: dayjs(),
          data_type: 'system'
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="indicator_id"
          label="សូចនាករ"
          rules={[{ required: true, message: 'សូមជ្រើសរើសសូចនាករ' }]}
        >
          <Select
            placeholder="ជ្រើសរើសសូចនាករ"
            onChange={handleIndicatorChange}
          >
            {indicators.map(ind => (
              <Option key={ind.id} value={ind.id}>
                {ind.indicator_code} - {ind.indicator_name_khmer}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedIndicator && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">តម្លៃមូលដ្ឋាន:</span>{' '}
                <span className="font-medium">{selectedIndicator.baseline_value || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">គោលដៅ:</span>{' '}
                <span className="font-medium">{selectedIndicator.target_value}</span>
              </div>
              <div>
                <span className="text-gray-500">តម្លៃបច្ចុប្បន្ន:</span>{' '}
                <span className="font-medium">{selectedIndicator.current || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">វឌ្ឍនភាព:</span>{' '}
                <span className="font-medium">{selectedIndicator.progress || 0}%</span>
              </div>
            </div>
          </div>
        )}

        <Form.Item
          name="collection_date"
          label="កាលបរិច្ឆេទប្រមូល"
          rules={[{ required: true, message: 'សូមជ្រើសរើសកាលបរិច្ឆេទ' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="data_type"
          label="ប្រភពទិន្នន័យ"
          rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភព' }]}
        >
          <Select>
            <Option value="survey">Survey / ស្ទង់មតិ</Option>
            <Option value="observation">Observation / ការសង្កេត</Option>
            <Option value="document">Document / ឯកសារ</Option>
            <Option value="system">System / ប្រព័ន្ធ</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="value_numeric"
          label="តម្លៃជាលេខ"
          rules={[{ required: true, message: 'សូមបញ្ចូលតម្លៃ' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="0"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="value_text"
          label="តម្លៃជាអក្សរ (ប្រសិនបើមាន)"
        >
          <Input placeholder="ពណ៌នាបន្ថែម" />
        </Form.Item>

        <Form.Item
          name="collected_by"
          label="អ្នកប្រមូលទិន្នន័យ"
        >
          <Input placeholder="ឈ្មោះអ្នកប្រមូល" />
        </Form.Item>

        <Form.Item
          name="notes"
          label="កំណត់ចំណាំ"
        >
          <TextArea
            rows={3}
            placeholder="បញ្ចូលកំណត់ចំណាំបន្ថែម"
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
              icon={<SaveOutlined />}
            >
              រក្សាទុកទិន្នន័យ
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}