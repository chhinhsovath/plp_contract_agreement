'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, Button, DatePicker, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface ActivityFormProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  activity?: any
}

export default function ActivityForm({
  visible,
  onClose,
  onSuccess,
  activity
}: ActivityFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [indicators, setIndicators] = useState<any[]>([])

  useEffect(() => {
    if (visible) {
      fetchIndicators()
      // Pre-populate form when editing
      if (activity) {
        form.setFieldsValue({
          activity_code: activity.activity_code,
          indicator_id: activity.indicator_id,
          activity_name_khmer: activity.activity_name_khmer,
          activity_name_english: activity.activity_name_english,
          planned_start: activity.planned_start ? dayjs(activity.planned_start) : null,
          planned_end: activity.planned_end ? dayjs(activity.planned_end) : null,
          actual_start: activity.actual_start ? dayjs(activity.actual_start) : null,
          actual_end: activity.actual_end ? dayjs(activity.actual_end) : null,
          status: activity.status || 'planned',
          budget_allocated: activity.budget_allocated,
          budget_spent: activity.budget_spent || 0,
          responsible_person: activity.responsible_person,
          location: activity.location
        })
      } else {
        // Creating mode - reset to defaults
        form.setFieldsValue({
          status: 'planned',
          budget_spent: 0
        })
      }
    }
  }, [visible, activity, form])

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

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const formattedValues = {
        ...values,
        planned_start: values.planned_start?.format('YYYY-MM-DD'),
        planned_end: values.planned_end?.format('YYYY-MM-DD'),
        actual_start: values.actual_start?.format('YYYY-MM-DD'),
        actual_end: values.actual_end?.format('YYYY-MM-DD')
      }

      const url = activity
        ? `/api/me/activities/${activity.id}`
        : '/api/me/activities'

      const method = activity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity ? { id: activity.id, ...formattedValues } : formattedValues)
      })

      if (!response.ok) {
        throw new Error('Failed to save activity')
      }

      message.success(activity ? 'សកម្មភាពបានធ្វើបច្ចុប្បន្នភាព' : 'សកម្មភាពបានបង្កើត')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving activity:', error)
      message.error('មានបញ្ហាក្នុងការរក្សាទុកសកម្មភាព')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={activity ? 'កែប្រែសកម្មភាព' : 'បង្កើតសកម្មភាពថ្មី'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="activity_code"
            label="លេខកូដសកម្មភាព"
            rules={[{ required: true, message: 'សូមបញ្ចូលលេខកូដ' }]}
          >
            <Input placeholder="ឧ. ACT-PMU-001" />
          </Form.Item>

          <Form.Item
            name="indicator_id"
            label="សូចនាករភ្ជាប់"
            rules={[{ required: true, message: 'សូមជ្រើសរើសសូចនាករ' }]}
          >
            <Select placeholder="ជ្រើសរើសសូចនាករ">
              {indicators.map(ind => (
                <Option key={ind.id} value={ind.id}>
                  {ind.indicator_code} - {ind.indicator_name_khmer}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="activity_name_khmer"
          label="ឈ្មោះសកម្មភាព (ភាសាខ្មែរ)"
          rules={[{ required: true, message: 'សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ' }]}
        >
          <Input placeholder="ការបណ្តុះបណ្តាល គបក" />
        </Form.Item>

        <Form.Item
          name="activity_name_english"
          label="ឈ្មោះសកម្មភាព (English)"
        >
          <Input placeholder="PCU Training" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="planned_start"
            label="កាលបរិច្ឆេទចាប់ផ្តើមគម្រោង"
            rules={[{ required: true, message: 'សូមជ្រើសរើសកាលបរិច្ឆេទ' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="planned_end"
            label="កាលបរិច្ឆេទបញ្ចប់គម្រោង"
            rules={[{ required: true, message: 'សូមជ្រើសរើសកាលបរិច្ឆេទ' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="actual_start"
            label="កាលបរិច្ឆេទចាប់ផ្តើមជាក់ស្តែង"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="actual_end"
            label="កាលបរិច្ឆេទបញ្ចប់ជាក់ស្តែង"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label="ស្ថានភាព"
          rules={[{ required: true, message: 'សូមជ្រើសរើសស្ថានភាព' }]}
        >
          <Select>
            <Option value="planned">គម្រោង / Planned</Option>
            <Option value="ongoing">កំពុងដំណើរការ / Ongoing</Option>
            <Option value="completed">បានបញ្ចប់ / Completed</Option>
            <Option value="delayed">យឺតយ៉ាវ / Delayed</Option>
            <Option value="cancelled">បានលុបចោល / Cancelled</Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="budget_allocated"
            label="ថវិកាដែលបានផ្តល់ ($)"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            name="budget_spent"
            label="ថវិកាដែលបានចំណាយ ($)"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="responsible_person"
          label="អ្នកទទួលខុសត្រូវ"
        >
          <Input placeholder="ឈ្មោះអ្នកទទួលខុសត្រូវ" />
        </Form.Item>

        <Form.Item
          name="location"
          label="ទីតាំង"
        >
          <Input placeholder="ខេត្ត/ក្រុង/ស្រុក" />
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
              {activity ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតសកម្មភាព'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}