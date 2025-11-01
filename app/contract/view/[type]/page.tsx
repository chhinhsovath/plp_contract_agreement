'use client'

import { useState, useEffect, use } from 'react'
import { Card, Button, Typography, Divider, Spin, Alert, Space, Switch, message, Tag } from 'antd'
import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { InlineEditText } from '@/components/InlineEditText'

const { Title, Text } = Typography

export default function ViewContractPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [deliverables, setDeliverables] = useState<any[]>([])

  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user) {
      loadContract()
      loadDeliverables()
    }
  }, [user])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadContract = async () => {
    try {
      const contractType = parseInt(resolvedParams.type)
      const response = await fetch(`/api/contract-templates/${contractType}`)
      if (response.ok) {
        const data = await response.json()
        setContract(data.template)
      }
    } catch (error) {
      console.error('Failed to load contract:', error)
    }
  }

  const loadDeliverables = async () => {
    try {
      const contractType = parseInt(resolvedParams.type)
      const response = await fetch(`/api/admin/deliverables?contract_type=${contractType}`)
      if (response.ok) {
        const data = await response.json()
        setDeliverables(data.deliverables)
      }
    } catch (error) {
      console.error('Failed to load deliverables:', error)
    }
  }

  const handleUpdateContent = async (key: string, newValue: string) => {
    try {
      const response = await fetch(`/api/content-texts/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_khmer: newValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      // Reload contract to show updated content
      await loadContract()
    } catch (error) {
      throw error
    }
  }

  const handleUpdateDeliverable = async (deliverableId: number, field: string, newValue: string) => {
    try {
      const response = await fetch(`/api/admin/deliverables/${deliverableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      await loadDeliverables()
    } catch (error) {
      throw error
    }
  }

  const handleUpdateOption = async (optionId: number, newValue: string) => {
    try {
      const response = await fetch(`/api/admin/deliverable-options/${optionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_text_khmer: newValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      await loadDeliverables()
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div style={{ padding: 40 }}>
        <Alert message="មិនមានកិច្ចសន្យា" type="error" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header Actions */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              ត្រឡប់ក្រោយ
            </Button>

            {isAdmin && (
              <Space>
                <Text>របៀបកែប្រែ:</Text>
                <Switch
                  checked={editMode}
                  onChange={setEditMode}
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren="បិទ"
                />
                {editMode && (
                  <Tag color="blue">ចុចលើអត្ថបទណាមួយដើម្បីកែប្រែ</Tag>
                )}
              </Space>
            )}
          </div>
        </Card>

        {/* Contract Header */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={3}>
            {editMode && isAdmin ? (
              <InlineEditText
                value={contract.title}
                onSave={(val) => handleUpdateContent(`contract_${contract.id}_title`, val)}
                className="font-hanuman"
              />
            ) : (
              contract.title
            )}
          </Title>
          <Space>
            <Tag color="green">ចុះហត្ថលេខារួចរាល់</Tag>
            <Text type="secondary">កិច្ចសន្យា: PLP-001-2025</Text>
          </Space>
        </Card>

        {/* Contract Content */}
        <Card title="ព័ត៌មានកិច្ចសនា" style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>ភាគី ក: </Text>
              {editMode && isAdmin ? (
                <InlineEditText
                  value={contract.partyA}
                  onSave={(val) => handleUpdateContent(`contract_${contract.id}_party_a`, val)}
                />
              ) : (
                <Text>{contract.partyA}</Text>
              )}
            </div>

            <div>
              <Text strong>តំណាងដោយ: </Text>
              <Text>{contract.partyASignatory}</Text>
            </div>

            <div>
              <Text strong>មុខតំណែង: </Text>
              <Text>{contract.partyAPosition}</Text>
            </div>

            <Divider />

            <div>
              <Text strong>ភាគី ខ: </Text>
              {editMode && isAdmin ? (
                <InlineEditText
                  value={contract.partyB}
                  onSave={(val) => handleUpdateContent(`contract_${contract.id}_party_b`, val)}
                />
              ) : (
                <Text>{contract.partyB}</Text>
              )}
            </div>
          </Space>
        </Card>

        {/* Responsibilities */}
        <Card title="មុខងារនិងទំនួលខុសត្រូវ" style={{ marginBottom: 16 }}>
          <ul style={{ paddingLeft: 20 }}>
            {contract.responsibilities?.map((resp: string, idx: number) => (
              <li key={idx} style={{ marginBottom: 12 }}>
                {editMode && isAdmin ? (
                  <InlineEditText
                    value={resp}
                    onSave={(val) => handleUpdateContent(`contract_${contract.id}_responsibility_${idx + 1}`, val)}
                    className="font-hanuman"
                  />
                ) : (
                  <Text>{resp}</Text>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* Contract Content/Conditions */}
        <Card title="លក្ខខណ្ឌកិច្ចសនា" style={{ marginBottom: 16 }}>
          <div
            className="font-hanuman"
            dangerouslySetInnerHTML={{ __html: contract.content }}
            style={{
              cursor: editMode && isAdmin ? 'pointer' : 'default'
            }}
          />
          {editMode && isAdmin && (
            <Alert
              message="កែប្រែខ្លឹមសារលម្អិត"
              description="សូមទៅកាន់ គ្រប់គ្រងខ្លឹមសារ (CMS) ដើម្បីកែប្រែផ្នែកនេះ"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
              action={
                <Button size="small" onClick={() => router.push('/admin/content-management')}>
                  ទៅកាន់ CMS
                </Button>
              }
            />
          )}
        </Card>

        {/* Deliverables & Options */}
        <Card title={`សមិទ្ធកម្ម (${deliverables.length})`}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {deliverables.map((deliverable, idx) => (
              <Card key={deliverable.id} type="inner" size="small">
                <div style={{ marginBottom: 12 }}>
                  <Text strong>សមិទ្ធកម្មទី {deliverable.deliverable_number}: </Text>
                  {editMode && isAdmin ? (
                    <InlineEditText
                      value={deliverable.deliverable_title_khmer}
                      onSave={(val) => handleUpdateDeliverable(deliverable.id, 'deliverable_title_khmer', val)}
                      className="font-hanuman"
                      multiline
                    />
                  ) : (
                    <Text className="font-hanuman">{deliverable.deliverable_title_khmer}</Text>
                  )}
                </div>

                {deliverable.timeline && (
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      ពេលវេលា: {deliverable.timeline}
                    </Text>
                  </div>
                )}

                {/* Options */}
                <div style={{ marginTop: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>ជម្រើស:</Text>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {deliverable.options?.map((option: any) => (
                      <div key={option.id} style={{ paddingLeft: 16, borderLeft: '2px solid #e8e8e8' }}>
                        <Tag color="purple">ជម្រើស {option.option_number}</Tag>
                        {editMode && isAdmin ? (
                          <InlineEditText
                            value={option.option_text_khmer}
                            onSave={(val) => handleUpdateOption(option.id, val)}
                            className="font-hanuman"
                            multiline
                          />
                        ) : (
                          <Text className="font-hanuman">{option.option_text_khmer}</Text>
                        )}
                        {option.baseline_percentage !== null && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              គោលដៅ: {option.baseline_percentage}% → {option.target_percentage}%
                            </Text>
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
        </Card>
      </div>
    </div>
  )
}
