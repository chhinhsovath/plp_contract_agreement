'use client'

import { useState, useEffect } from 'react'
import { Card, Layout, Menu, Typography, Dropdown, Avatar, Row, Col, Spin, Button, Form, Input, message, Collapse, Space, Select } from 'antd'
import { DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, FileTextOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined, EditOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'
import { useContent } from '@/lib/hooks/useContent'

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography
const { Panel } = Collapse

interface CalculationRule {
  condition: string
  target_increase?: number | string
  target_decrease?: number
  description_km: string
  description_en: string
}

interface Indicator {
  id: number
  indicator_code: string
  indicator_number: number
  indicator_name_km: string
  indicator_name_en: string
  calculation_rules: CalculationRule[]
}

export default function IndicatorsRulesPage() {
  const router = useRouter()
  const { t, loading: contentLoading } = useContent()
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [filteredIndicators, setFilteredIndicators] = useState<Indicator[]>([])
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [editingIndicatorId, setEditingIndicatorId] = useState<number | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user && user.role === UserRole.SUPER_ADMIN) {
      fetchIndicators()
    }
  }, [user])

  useEffect(() => {
    // Filter indicators based on selected contract
    if (!selectedContract) {
      setFilteredIndicators(indicators)
    } else {
      const filtered = indicators.filter(ind => {
        const code = ind.indicator_code
        if (selectedContract === 'AGR1') return code.startsWith('AGR1-')
        if (selectedContract === 'AGR2') return code.startsWith('AGR2-')
        if (selectedContract === 'AGR3') return code.startsWith('AGR3-')
        if (selectedContract === 'IND') return code.startsWith('IND-') && !code.startsWith('AGR')
        return false
      })
      setFilteredIndicators(filtered)
    }
  }, [selectedContract, indicators])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== UserRole.SUPER_ADMIN) {
          message.error('Access denied. SUPER_ADMIN only.')
          router.push('/dashboard')
          return
        }
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/login')
    }
  }

  const fetchIndicators = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/indicators')
      if (response.ok) {
        const data = await response.json()
        // Ensure calculation_rules is always an array
        const processedIndicators = (data.indicators || []).map((ind: any) => ({
          ...ind,
          calculation_rules: Array.isArray(ind.calculation_rules)
            ? ind.calculation_rules
            : (typeof ind.calculation_rules === 'string'
                ? JSON.parse(ind.calculation_rules)
                : [])
        }))
        setIndicators(processedIndicators)
        setFilteredIndicators(processedIndicators)
      } else {
        message.error('Failed to fetch indicators')
      }
    } catch (error) {
      console.error('Failed to fetch indicators:', error)
      message.error('Failed to fetch indicators')
    } finally {
      setLoading(false)
    }
  }

  const handleEditIndicator = (indicator: Indicator) => {
    setEditingIndicatorId(indicator.id)
    // Ensure calculation_rules is an array
    const rules = Array.isArray(indicator.calculation_rules) ? indicator.calculation_rules : []

    // Set form values for the 3 rules
    form.setFieldsValue({
      rule1_condition: rules[0]?.condition || '',
      rule1_description_km: rules[0]?.description_km || '',
      rule1_description_en: rules[0]?.description_en || '',
      rule1_target: rules[0]?.target_increase || rules[0]?.target_decrease || '',

      rule2_condition: rules[1]?.condition || '',
      rule2_description_km: rules[1]?.description_km || '',
      rule2_description_en: rules[1]?.description_en || '',
      rule2_target: rules[1]?.target_increase || rules[1]?.target_decrease || '',

      rule3_condition: rules[2]?.condition || '',
      rule3_description_km: rules[2]?.description_km || '',
      rule3_description_en: rules[2]?.description_en || '',
      rule3_target: rules[2]?.target_increase || rules[2]?.target_decrease || '',
    })
  }

  const handleSaveRules = async () => {
    if (!editingIndicatorId) return

    try {
      const values = await form.validateFields()

      // Determine if this is a reduction target indicator
      const indicator = indicators.find(ind => ind.id === editingIndicatorId)
      const isReduction = indicator?.calculation_rules[0]?.hasOwnProperty('target_decrease')

      const calculation_rules = [
        {
          condition: values.rule1_condition,
          description_km: values.rule1_description_km,
          description_en: values.rule1_description_en,
          [isReduction ? 'target_decrease' : 'target_increase']: values.rule1_target
        },
        {
          condition: values.rule2_condition,
          description_km: values.rule2_description_km,
          description_en: values.rule2_description_en,
          [isReduction ? 'target_decrease' : 'target_increase']: values.rule2_target
        },
        {
          condition: values.rule3_condition,
          description_km: values.rule3_description_km,
          description_en: values.rule3_description_en,
          [isReduction ? 'target_decrease' : 'target_increase']: values.rule3_target
        }
      ]

      const response = await fetch(`/api/admin/indicators/${editingIndicatorId}/calculation-rules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculation_rules })
      })

      if (response.ok) {
        message.success('Calculation rules updated successfully')
        setEditingIndicatorId(null)
        form.resetFields()
        fetchIndicators()
      } else {
        const error = await response.json()
        message.error(error.error || 'Failed to update calculation rules')
      }
    } catch (error) {
      console.error('Failed to save rules:', error)
      message.error('Failed to save calculation rules')
    }
  }

  const handleCancelEdit = () => {
    setEditingIndicatorId(null)
    form.resetFields()
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getSidebarMenuItems = () => {
    const baseItems = [
      {
        key: 'overview',
        icon: <DashboardOutlined />,
        label: 'ទិដ្ឋភាពទូទៅ',
      },
      {
        key: 'indicators',
        icon: <FundProjectionScreenOutlined />,
        label: t('dashboard_tab_indicators') || 'សូចនាករ',
      },
      // Hidden: Activities page
      // {
      //   key: 'activities',
      //   icon: <ProjectOutlined />,
      //   label: 'សកម្មភាព',
      // },
      // Hidden: Milestones page
      // {
      //   key: 'milestones',
      //   icon: <CalendarOutlined />,
      //   label: t('dashboard_tab_milestones') || 'ចំណុចសំខាន់',
      // },
      {
        key: 'contracts',
        icon: <FileTextOutlined />,
        label: t('dashboard_tab_contracts') || 'កិច្ចសន្យារបស់ខ្ញុំ',
      },
    ]

    const adminItems: any[] = []

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'COORDINATOR') {
      adminItems.push({
        type: 'divider',
      })
      adminItems.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'ការគ្រប់គ្រង',
        children: [
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'manage-users',
            icon: <TeamOutlined />,
            label: 'អ្នកប្រើប្រាស់',
          }] : []),
          {
            key: 'content-management',
            icon: <FileTextOutlined />,
            label: 'ខ្លឹមសារ',
          },
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'deliverables-content',
            icon: <EditOutlined />,
            label: 'កែខ្លឹមសារសមិទ្ធកម្ម',
          }] : []),
          {
            key: 'deliverables-management',
            icon: <FormOutlined />,
            label: 'សមិទ្ធកម្ម',
          },
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'reconfig-requests',
            icon: <BellOutlined />,
            label: 'សំណើផ្លាស់ប្តូរ',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'indicators-rules',
            icon: <EditOutlined />,
            label: 'កែវិធីគណនាសូចនាករ',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-4',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៤',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-agreement-5',
            icon: <EditOutlined />,
            label: 'កែកិច្ចព្រមព្រៀង ៥',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-4',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៤',
          }] : []),
          ...(user?.role === 'SUPER_ADMIN' ? [{
            key: 'edit-configure-5',
            icon: <FileTextOutlined />,
            label: 'កែទំព័រកំណត់រចនា ៥',
          }] : []),
        ],
      })
    }

    return [...baseItems, ...adminItems]
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'overview') {
      router.push('/dashboard')
    } else if (key === 'indicators') {
      router.push('/indicators')
    } else if (key === 'activities') {
      router.push('/activities')
    } else if (key === 'milestones') {
      router.push('/milestones')
    } else if (key === 'contracts') {
      router.push('/contracts')
    } else if (key === 'manage-users') {
      router.push('/admin/users')
    } else if (key === 'content-management') {
      router.push('/admin/content-management')
    } else if (key === 'deliverables-content') {
      router.push('/admin/deliverables-content')
    } else if (key === 'deliverables-management') {
      router.push('/admin/deliverables-management')
    } else if (key === 'reconfig-requests') {
      router.push('/admin/reconfiguration-requests')
    } else if (key === 'indicators-rules') {
      router.push('/admin/indicators-rules')
    } else if (key === 'edit-agreement-4') {
      router.push('/admin/agreement/4')
    } else if (key === 'edit-agreement-5') {
      router.push('/admin/agreement/5')
    } else if (key === 'edit-configure-4') {
      router.push('/admin/configure-contract/4')
    } else if (key === 'edit-configure-5') {
      router.push('/admin/configure-contract/5')
    }
  }

  if (contentLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={64}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
          flexShrink: 0
        }}>
          {collapsed ? (
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>P</div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>PLP M&E</div>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Menu
            theme="light"
            selectedKeys={['indicators-rules']}
            mode="inline"
            items={getSidebarMenuItems()}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              fontSize: 14
            }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s', background: '#f5f5f5' }}>
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          height: 64,
          lineHeight: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <Row justify="space-between" align="middle" style={{ height: '100%' }}>
            <Col>
              <Title level={4} style={{ margin: 0, fontFamily: 'Hanuman', color: '#262626' }}>
                កែវិធីគណនាសូចនាករ
              </Title>
            </Col>

            <Col>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_profile')}</span>,
                    },
                    {
                      key: 'change-password',
                      icon: <KeyOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_password')}</span>,
                    },
                    { type: 'divider' },
                    {
                      key: 'manage-users',
                      icon: <TeamOutlined />,
                      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
                      onClick: () => router.push('/admin/users')
                    },
                    {
                      key: 'content-management',
                      icon: <FileTextOutlined />,
                      label: 'គ្រប់គ្រងខ្លឹមសារ (CMS)',
                      onClick: () => router.push('/admin/content-management')
                    },
                    { type: 'divider' as const },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_logout')}</span>,
                      onClick: handleLogout,
                      danger: true
                    }
                  ]
                }}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  style={{
                    height: 48,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Avatar icon={<UserOutlined />} size={32} style={{ background: '#1890ff' }} />
                  <div style={{ textAlign: 'left', display: collapsed ? 'none' : 'block' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', fontFamily: 'Hanuman' }}>
                      {user?.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', fontFamily: 'Hanuman' }}>
                      {user?.role}
                    </div>
                  </div>
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </Header>

        <Content style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/dashboard')}
                  style={{ marginBottom: 8 }}
                >
                  {t('dashboard_back')}
                </Button>
                <Title level={5} style={{ margin: 0, fontFamily: 'Hanuman' }}>
                  <EditOutlined style={{ marginRight: 8 }} />
                  កែវិធីគណនាសូចនាករ (Edit Indicator Calculation Rules)
                </Title>
                <Text type="secondary" style={{ fontFamily: 'Hanuman' }}>
                  កែសម្រួលអត្រាសិស (ជម្រើសទាំង ៣) សម្រាប់សូចនាករនីមួយៗ
                </Text>
              </div>

              {/* Contract Filter */}
              <div>
                <Space>
                  <Text strong style={{ fontFamily: 'Hanuman' }}>
                    ប្រភេទកិច្ចសន្យា:
                  </Text>
                  <Select
                    style={{ width: 300 }}
                    placeholder="ជ្រើសរើសប្រភេទកិច្ចសន្យា"
                    value={selectedContract}
                    onChange={setSelectedContract}
                    allowClear
                  >
                    <Select.Option value="AGR1">កិច្ចសន្យាទី១ - PMU-PCU</Select.Option>
                    <Select.Option value="AGR2">កិច្ចសន្យាទី២ - PCU-Project Manager</Select.Option>
                    <Select.Option value="AGR3">កិច្ចសន្យាទី៣ - Project Manager-Regional</Select.Option>
                    <Select.Option value="IND">កិច្ចសន្យាទី៤/៥ - DoE Agreements</Select.Option>
                  </Select>
                  <Text type="secondary">
                    សូចនាករសរុប: {filteredIndicators.length}
                  </Text>
                </Space>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : filteredIndicators.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary" style={{ fontFamily: 'Hanuman' }}>
                    មិនមានសូចនាករសម្រាប់កិច្ចសន្យានេះទេ
                  </Text>
                </div>
              ) : (
                <Collapse accordion>
                  {filteredIndicators.map((indicator) => (
                    <Panel
                      header={
                        <div>
                          <Text strong>{indicator.indicator_code}</Text>
                          <Text style={{ marginLeft: 16, fontFamily: 'Hanuman' }}>
                            {indicator.indicator_name_km}
                          </Text>
                        </div>
                      }
                      key={indicator.id}
                    >
                      {editingIndicatorId === indicator.id ? (
                        <Form form={form} layout="vertical">
                          {/* Rule 1 */}
                          <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                            <Title level={5} style={{ fontFamily: 'Hanuman' }}>អត្រាសិស ១ (Rule 1)</Title>
                            <Form.Item
                              label="លក្ខខណ្ឌ (Condition)"
                              name="rule1_condition"
                              rules={[{ required: true, message: 'Please enter condition' }]}
                            >
                              <Input placeholder="e.g., baseline < 93.7" />
                            </Form.Item>
                            <Form.Item
                              label="គោលដៅ (Target Increase/Decrease)"
                              name="rule1_target"
                              rules={[{ required: true, message: 'Please enter target' }]}
                            >
                              <Input placeholder="e.g., 1.3 or up_to_95" />
                            </Form.Item>
                            <Form.Item
                              label="ពិពណ៌នាខ្មែរ (Description KM)"
                              name="rule1_description_km"
                              rules={[{ required: true, message: 'Please enter Khmer description' }]}
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                            <Form.Item
                              label="ពិពណ៌នាអង់គ្លេស (Description EN)"
                              name="rule1_description_en"
                              rules={[{ required: true, message: 'Please enter English description' }]}
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                          </Card>

                          {/* Rule 2 */}
                          <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                            <Title level={5} style={{ fontFamily: 'Hanuman' }}>អត្រាសិស ២ (Rule 2)</Title>
                            <Form.Item
                              label="លក្ខខណ្ឌ (Condition)"
                              name="rule2_condition"
                              rules={[{ required: true, message: 'Please enter condition' }]}
                            >
                              <Input placeholder="e.g., baseline == 93.7" />
                            </Form.Item>
                            <Form.Item
                              label="គោលដៅ (Target Increase/Decrease)"
                              name="rule2_target"
                              rules={[{ required: true, message: 'Please enter target' }]}
                            >
                              <Input placeholder="e.g., up_to_95" />
                            </Form.Item>
                            <Form.Item
                              label="ពិពណ៌នាខ្មែរ (Description KM)"
                              name="rule2_description_km"
                              rules={[{ required: true, message: 'Please enter Khmer description' }]}
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                            <Form.Item
                              label="ពិពណ៌នាអង់គ្លេស (Description EN)"
                              name="rule2_description_en"
                              rules={[{ required: true, message: 'Please enter English description' }]}
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                          </Card>

                          {/* Rule 3 */}
                          <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                            <Title level={5} style={{ fontFamily: 'Hanuman' }}>អត្រាសិស ៣ (Rule 3)</Title>
                            <Form.Item
                              label="លក្ខខណ្ឌ (Condition)"
                              name="rule3_condition"
                              rules={[{ required: true, message: 'Please enter condition' }]}
                            >
                              <Input placeholder="e.g., baseline >= 95" />
                            </Form.Item>
                            <Form.Item
                              label="គោលដៅ (Target Increase/Decrease)"
                              name="rule3_target"
                              rules={[{ required: true, message: 'Please enter target' }]}
                            >
                              <Input placeholder="e.g., 0" />
                            </Form.Item>
                            <Form.Item
                              label="ពិពណ៌នាខ្មែរ (Description KM)"
                              name="rule3_description_km"
                              rules={[{ required: true, message: 'Please enter Khmer description' }]}
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                            <Form.Item
                              label="ពិពណ៌នាអង់គ្លេស (Description EN)"
                              name="rule3_description_en"
                              rules={[{ required: true, message: 'Please enter English description' }]}
                            >
                              <Input.TextArea rows={2} />
                            </Form.Item>
                          </Card>

                          <Space>
                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveRules}>
                              រក្សាទុក (Save)
                            </Button>
                            <Button onClick={handleCancelEdit}>
                              បោះបង់ (Cancel)
                            </Button>
                          </Space>
                        </Form>
                      ) : (
                        <div>
                          {Array.isArray(indicator.calculation_rules) && indicator.calculation_rules.length > 0 ? (
                            <>
                              {indicator.calculation_rules.map((rule, index) => (
                                <Card key={index} size="small" style={{ marginBottom: 8 }}>
                                  <Text strong style={{ fontFamily: 'Hanuman' }}>អត្រាសិស {index + 1}:</Text>
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Condition: </Text>
                                    <Text code>{rule.condition}</Text>
                                  </div>
                                  <div style={{ marginTop: 4 }}>
                                    <Text type="secondary">Target: </Text>
                                    <Text>{rule.target_increase || rule.target_decrease}</Text>
                                  </div>
                                  <div style={{ marginTop: 4, fontFamily: 'Hanuman' }}>
                                    <Text>{rule.description_km}</Text>
                                  </div>
                                  <div style={{ marginTop: 4 }}>
                                    <Text type="secondary">{rule.description_en}</Text>
                                  </div>
                                </Card>
                              ))}
                              <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleEditIndicator(indicator)}
                                style={{ marginTop: 16 }}
                              >
                                កែសម្រួល (Edit)
                              </Button>
                            </>
                          ) : (
                            <div>
                              <Text type="secondary">No calculation rules defined</Text>
                              <br />
                              <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleEditIndicator(indicator)}
                                style={{ marginTop: 16 }}
                              >
                                កែសម្រួល (Edit)
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Space>
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
