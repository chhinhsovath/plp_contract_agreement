'use client'

import { useState } from 'react'
import { Form, Input, InputNumber, DatePicker, Button, Space, Card, Divider, message, Collapse, Tag } from 'antd'
import { SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Panel } = Collapse

interface ContractJSONEditorProps {
  contractData: any
  onSave: (updatedData: any) => Promise<void>
  onCancel: () => void
}

export function ContractJSONEditor({ contractData, onSave, onCancel }: ContractJSONEditorProps) {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [deliverables, setDeliverables] = useState(contractData.deliverables || [])
  const [indicators, setIndicators] = useState(contractData.indicators || [])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      setSaving(true)

      const updatedData = {
        ...values,
        deliverables,
        indicators,
        start_date: values.start_date ? values.start_date.toISOString() : contractData.start_date,
        end_date: values.end_date ? values.end_date.toISOString() : contractData.end_date
      }

      await onSave(updatedData)
      message.success('បានរក្សាទុកទាំងអស់')
    } catch (error) {
      message.error('សូមបំពេញប្រអប់ចាំបាច់')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDeliverable = (index: number, field: string, value: any) => {
    const updated = [...deliverables]
    updated[index] = { ...updated[index], [field]: value }
    setDeliverables(updated)
  }

  const handleUpdateIndicator = (index: number, field: string, value: any) => {
    const updated = [...indicators]
    updated[index] = { ...updated[index], [field]: value }
    setIndicators(updated)
  }

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: 16 }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          contract_number: contractData.contract_number,
          party_a_name: contractData.party_a_name,
          party_b_name: contractData.party_b_name,
          party_b_organization: contractData.party_b_organization,
          party_b_position: contractData.party_b_position,
          start_date: contractData.start_date ? dayjs(contractData.start_date) : null,
          end_date: contractData.end_date ? dayjs(contractData.end_date) : null
        }}
      >
        <Card title="ព័ត៌មានកិច្ចសន្យាមូលដ្ឋាន" size="small" style={{ marginBottom: 16 }}>
          <Form.Item label="លេខកិច្ចសន្យា" name="contract_number">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="ភាគី ក (Party A Name)"
            name="party_a_name"
            rules={[{ required: true, message: 'ចាំបាច់' }]}
          >
            <Input className="font-hanuman" />
          </Form.Item>

          <Form.Item
            label="ភាគី ខ - ឈ្មោះ (Party B Name)"
            name="party_b_name"
            rules={[{ required: true, message: 'ចាំបាច់' }]}
          >
            <Input className="font-hanuman" />
          </Form.Item>

          <Form.Item label="ភាគី ខ - ស្ថាប័ន/សាលា (Organization)" name="party_b_organization">
            <Input className="font-hanuman" placeholder="ឈ្មោះសាលា ឬការិយាល័យ" />
          </Form.Item>

          <Form.Item label="ភាគី ខ - មុខតំណែង (Position)" name="party_b_position">
            <Input className="font-hanuman" placeholder="នាយក, ប្រធាន, ជំនួយការ..." />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item label="ថ្ងៃចាប់ផ្តើម" name="start_date">
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item label="ថ្ងៃបញ្ចប់" name="end_date">
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Space>
        </Card>

        {/* Deliverables Editor */}
        <Card title={`សមិទ្ធកម្ម (${deliverables.length})`} size="small" style={{ marginBottom: 16 }}>
          <Collapse accordion>
            {deliverables.map((deliverable: any, index: number) => (
              <Panel
                key={index}
                header={
                  <Space>
                    <Tag color="blue">{deliverable.deliverable_number}</Tag>
                    <span className="font-hanuman">{deliverable.deliverable_title_khmer?.substring(0, 50)}...</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <label>ចំណងជើងខ្មែរ:</label>
                    <TextArea
                      rows={3}
                      value={deliverable.deliverable_title_khmer}
                      onChange={(e) => handleUpdateDeliverable(index, 'deliverable_title_khmer', e.target.value)}
                      className="font-hanuman"
                    />
                  </div>

                  <div>
                    <label>ចំណងជើង English:</label>
                    <TextArea
                      rows={2}
                      value={deliverable.deliverable_title_english}
                      onChange={(e) => handleUpdateDeliverable(index, 'deliverable_title_english', e.target.value)}
                    />
                  </div>

                  <div>
                    <label>ពេលវេលា (Timeline):</label>
                    <Input
                      value={deliverable.timeline}
                      onChange={(e) => handleUpdateDeliverable(index, 'timeline', e.target.value)}
                      className="font-hanuman"
                    />
                  </div>

                  <div>
                    <label>អត្ថបទជម្រើសដែលបានជ្រើស:</label>
                    <TextArea
                      rows={3}
                      value={deliverable.selected_indicator_text}
                      onChange={(e) => handleUpdateDeliverable(index, 'selected_indicator_text', e.target.value)}
                      className="font-hanuman"
                    />
                  </div>

                  <Space>
                    <div>
                      <label>Baseline %:</label>
                      <InputNumber
                        min={0}
                        max={100}
                        value={deliverable.baseline_percentage}
                        onChange={(val) => handleUpdateDeliverable(index, 'baseline_percentage', val)}
                      />
                    </div>

                    <div>
                      <label>Target %:</label>
                      <InputNumber
                        min={0}
                        max={100}
                        value={deliverable.target_percentage}
                        onChange={(val) => handleUpdateDeliverable(index, 'target_percentage', val)}
                      />
                    </div>
                  </Space>
                </Space>
              </Panel>
            ))}
          </Collapse>
        </Card>

        {/* Indicators Editor */}
        <Card title={`សូចនាករ (${indicators.length})`} size="small" style={{ marginBottom: 16 }}>
          <Collapse accordion>
            {indicators.map((indicator: any, index: number) => (
              <Panel
                key={index}
                header={
                  <Space>
                    <Tag color="green">{indicator.indicator_code}</Tag>
                    <span className="font-hanuman">{indicator.indicator_name_km?.substring(0, 40)}...</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <label>លេខកូដ (Code):</label>
                    <Input
                      value={indicator.indicator_code}
                      onChange={(e) => handleUpdateIndicator(index, 'indicator_code', e.target.value)}
                    />
                  </div>

                  <div>
                    <label>ឈ្មោះសូចនាករ:</label>
                    <TextArea
                      rows={2}
                      value={indicator.indicator_name_km}
                      onChange={(e) => handleUpdateIndicator(index, 'indicator_name_km', e.target.value)}
                      className="font-hanuman"
                    />
                  </div>

                  <Space>
                    <div>
                      <label>Baseline %:</label>
                      <InputNumber
                        min={0}
                        max={100}
                        value={indicator.baseline_percentage}
                        onChange={(val) => handleUpdateIndicator(index, 'baseline_percentage', val)}
                      />
                    </div>

                    <div>
                      <label>Target %:</label>
                      <InputNumber
                        min={0}
                        max={100}
                        value={indicator.target_percentage}
                        onChange={(val) => handleUpdateIndicator(index, 'target_percentage', val)}
                      />
                    </div>

                    <div>
                      <label>Selected Rule:</label>
                      <InputNumber
                        min={1}
                        max={3}
                        value={indicator.selected_rule}
                        onChange={(val) => handleUpdateIndicator(index, 'selected_rule', val)}
                      />
                    </div>
                  </Space>
                </Space>
              </Panel>
            ))}
          </Collapse>
        </Card>
      </Form>

      {/* Action Buttons */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        borderTop: '1px solid #d9d9d9',
        padding: '12px 0',
        marginTop: 16
      }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} size="large">
            បោះបង់
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            size="large"
          >
            រក្សាទុកទាំងអស់
          </Button>
        </Space>
      </div>
    </div>
  )
}
