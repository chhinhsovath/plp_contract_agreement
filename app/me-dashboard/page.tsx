'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Tabs, Table, Progress, Tag, Space, Button, DatePicker, Select, Timeline, Alert, Badge, Tooltip, Empty, Checkbox } from 'antd'
import { DashboardOutlined, RiseOutlined, TeamOutlined, FundProjectionScreenOutlined, CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined, FileTextOutlined, CalendarOutlined, ProjectOutlined, AlertOutlined, CheckOutlined, SyncOutlined, FieldTimeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { PROJECT_PLANS, getProjectPlanByContract, calculateProjectProgress, getUpcomingMilestones, getDelayedDeliverables } from '@/lib/project-deliverables'
import { UserRole } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker

// Contract type mapping
const CONTRACT_TYPES = {
  1: 'PMU-PCU',
  2: 'PCU-Project Manager',
  3: 'Project Manager-Regional',
  4: 'DoE-District Office',
  5: 'DoE-School'
}

export default function MEDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])
  const [selectedContract, setSelectedContract] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [projectPlans, setProjectPlans] = useState<any[]>([])

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    // Load project plans based on user role and selected contract
    if (user) {
      loadProjectPlans()
    }
  }, [user, selectedContract])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        // Set initial contract filter for PARTNER users
        if (data.user.role === UserRole.PARTNER && data.user.contract_type) {
          setSelectedContract(data.user.contract_type)
        }
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

  const loadProjectPlans = () => {
    // Filter project plans based on user role
    let filteredPlans = []

    if (user.role === UserRole.PARTNER && user.contract_type) {
      // Partners only see their contract type
      filteredPlans = getProjectPlanByContract(user.contract_type)
    } else if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      // Admins can see all or filtered
      filteredPlans = getProjectPlanByContract(selectedContract)
    } else {
      // Other roles see selected contract
      filteredPlans = getProjectPlanByContract(selectedContract || user.contract_type)
    }

    setProjectPlans(filteredPlans)
  }

  // Calculate dashboard statistics from project plans
  const calculateDashboardStats = () => {
    let totalDeliverables = 0
    let completedDeliverables = 0
    let inProgressDeliverables = 0
    let totalProgress = 0

    projectPlans.forEach((plan: any) => {
      plan.deliverables.forEach((d: any) => {
        totalDeliverables++
        if (d.status === 'completed') completedDeliverables++
        if (d.status === 'in-progress') inProgressDeliverables++
        totalProgress += d.progress
      })
    })

    const upcomingMilestones = getUpcomingMilestones(projectPlans, 30)
    const delayedDeliverables = getDelayedDeliverables(projectPlans)

    return {
      totalDeliverables,
      completedDeliverables,
      inProgressDeliverables,
      overallProgress: totalDeliverables > 0 ? Math.round(totalProgress / totalDeliverables) : 0,
      upcomingMilestones: upcomingMilestones.length,
      delayedDeliverables: delayedDeliverables.length,
      totalBudget: projectPlans.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
    }
  }

  const dashboardData = calculateDashboardStats()

  // Sample indicators data
  const indicatorsData = [
    {
      key: '1',
      code: 'IND-001',
      name: 'ចំនួនគ្រូបង្រៀនដែលបានទទួលការបណ្តុះបណ្តាល',
      type: 'output',
      baseline: 0,
      target: 500,
      current: 320,
      progress: 64,
      status: 'on-track'
    },
    {
      key: '2',
      code: 'IND-002',
      name: 'ភាគរយសាលារៀនដែលបានទទួលសម្ភារៈថ្មី',
      type: 'outcome',
      baseline: 20,
      target: 80,
      current: 55,
      progress: 58,
      status: 'on-track'
    },
    {
      key: '3',
      code: 'IND-003',
      name: 'អត្រាសិស្សចូលរៀនបឋមសិក្សា',
      type: 'impact',
      baseline: 85,
      target: 95,
      current: 88,
      progress: 30,
      status: 'delayed'
    }
  ]

  // Sample activities data
  const activitiesData = [
    {
      key: '1',
      code: 'ACT-001',
      name: 'វគ្គបណ្តុះបណ្តាលគ្រូបង្រៀនថ្នាក់ទី១-៣',
      status: 'ongoing',
      startDate: '2024-01-15',
      endDate: '2024-03-30',
      progress: 75,
      budget: 50000,
      spent: 37500
    },
    {
      key: '2',
      code: 'ACT-002',
      name: 'ចែកចាយសម្ភារៈសិក្សាដល់សាលា',
      status: 'completed',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      progress: 100,
      budget: 75000,
      spent: 72000
    }
  ]

  // Sample milestones data
  const milestonesData = [
    {
      key: '1',
      name: 'បញ្ចប់វគ្គបណ្តុះបណ្តាលដំណាក់កាលទី១',
      dueDate: '2024-01-31',
      status: 'achieved',
      activity: 'ACT-001'
    },
    {
      key: '2',
      name: 'ការវាយតម្លៃពាក់កណ្តាលគម្រោង',
      dueDate: '2024-02-15',
      status: 'pending',
      activity: 'ACT-003'
    },
    {
      key: '3',
      name: 'របាយការណ៍ត្រីមាសទី១',
      dueDate: '2024-03-31',
      status: 'overdue',
      activity: 'ACT-004'
    }
  ]

  const indicatorColumns = [
    {
      title: 'កូដ',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'សូចនាករ',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'ប្រភេទ',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const colors = {
          output: 'blue',
          outcome: 'green',
          impact: 'purple'
        }
        return <Tag color={colors[type as keyof typeof colors]}>{type.toUpperCase()}</Tag>
      }
    },
    {
      title: 'គោលដៅ',
      dataIndex: 'target',
      key: 'target',
      width: 80
    },
    {
      title: 'បច្ចុប្បន្ន',
      dataIndex: 'current',
      key: 'current',
      width: 80
    },
    {
      title: 'វឌ្ឍនភាព',
      key: 'progress',
      width: 150,
      render: (record: any) => (
        <Progress
          percent={record.progress}
          size="small"
          status={record.status === 'delayed' ? 'exception' : 'active'}
        />
      )
    },
    {
      title: 'ស្ថានភាព',
      key: 'status',
      width: 100,
      render: (record: any) => {
        const statusConfig = {
          'on-track': { color: 'green', text: 'តាមគម្រោង' },
          'delayed': { color: 'orange', text: 'យឺត' },
          'at-risk': { color: 'red', text: 'មានហានិភ័យ' }
        }
        const config = statusConfig[record.status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    }
  ]

  const activityColumns = [
    {
      title: 'កូដ',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'សកម្មភាព',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'ស្ថានភាព',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          planned: { color: 'default', text: 'គម្រោង' },
          ongoing: { color: 'processing', text: 'កំពុងដំណើរការ' },
          completed: { color: 'success', text: 'បានបញ្ចប់' },
          delayed: { color: 'warning', text: 'យឺតយ៉ាវ' },
          cancelled: { color: 'error', text: 'បានលុបចោល' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: 'រយៈពេល',
      key: 'duration',
      width: 200,
      render: (record: any) => (
        <Text type="secondary">
          {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
        </Text>
      )
    },
    {
      title: 'វឌ្ឍនភាព',
      key: 'progress',
      width: 150,
      render: (record: any) => (
        <Progress percent={record.progress} size="small" />
      )
    },
    {
      title: 'ថវិកា',
      key: 'budget',
      width: 150,
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <Text>${record.spent.toLocaleString()} / ${record.budget.toLocaleString()}</Text>
          <Progress
            percent={Math.round((record.spent / record.budget) * 100)}
            size="small"
            strokeColor="#52c41a"
          />
        </Space>
      )
    }
  ]

  const milestoneColumns = [
    {
      title: 'ចំណុចសំខាន់',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'សកម្មភាព',
      dataIndex: 'activity',
      key: 'activity',
      width: 120
    },
    {
      title: 'កាលបរិច្ឆេទ',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'ស្ថានភាព',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'default', text: 'រង់ចាំ', icon: <ClockCircleOutlined /> },
          achieved: { color: 'success', text: 'សម្រេច', icon: <CheckCircleOutlined /> },
          overdue: { color: 'error', text: 'ហួសកាលកំណត់', icon: <ClockCircleOutlined /> }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    }
  ]

  // Timeline component for project plan
  const renderProjectTimeline = () => {
    if (projectPlans.length === 0) {
      return (
        <Empty
          description={
            <span className="font-hanuman">គ្មានផែនការគម្រោង</span>
          }
        />
      )
    }

    return (
      <div>
        {projectPlans.map((plan: any, planIndex: number) => (
          <div key={planIndex} className="mb-8">
            <div className="mb-4">
              <Title level={4} className="font-hanuman text-blue-800">
                {plan.contractName}
              </Title>
              <Space className="font-hanuman text-gray-600">
                <FieldTimeOutlined />
                <Text>រយៈពេល: {plan.projectDuration}</Text>
                {plan.totalBudget && (
                  <>
                    <Text>|</Text>
                    <Text>ថវិកា: ${plan.totalBudget.toLocaleString()}</Text>
                  </>
                )}
                <Text>|</Text>
                <Text>វឌ្ឍនភាព: {calculateProjectProgress(plan.deliverables)}%</Text>
              </Space>
            </div>

            <Timeline mode="left">
              {plan.deliverables.map((deliverable: any) => {
                const statusIcons: any = {
                  'completed': <CheckCircleOutlined className="text-green-500" />,
                  'in-progress': <SyncOutlined className="text-blue-500" spin />,
                  'delayed': <ClockCircleOutlined className="text-red-500" />,
                  'planned': <ClockCircleOutlined className="text-gray-400" />
                }
                const statusIcon = statusIcons[deliverable.status]

                const isDelayed = dayjs(deliverable.endDate).isBefore(dayjs()) && deliverable.progress < 100

                return (
                  <Timeline.Item
                    key={deliverable.id}
                    dot={statusIcon}
                    color={isDelayed ? 'red' : deliverable.status === 'completed' ? 'green' : deliverable.status === 'in-progress' ? 'blue' : 'gray'}
                  >
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Text strong className="font-hanuman text-lg">
                            {deliverable.name}
                          </Text>
                          {deliverable.description && (
                            <Paragraph className="font-hanuman text-gray-600 text-sm mt-1">
                              {deliverable.description}
                            </Paragraph>
                          )}
                        </div>
                        <Badge
                          status={
                            isDelayed ? 'error' :
                            deliverable.status === 'completed' ? 'success' :
                            deliverable.status === 'in-progress' ? 'processing' :
                            'default'
                          }
                          text={
                            <span className="font-hanuman">
                              {isDelayed ? 'ហួសកាលកំណត់' :
                               deliverable.status === 'completed' ? 'បានបញ្ចប់' :
                               deliverable.status === 'in-progress' ? 'កំពុងដំណើរការ' :
                               'គម្រោង'}
                            </span>
                          }
                        />
                      </div>

                      <Space className="font-hanuman text-sm text-gray-600 mb-3">
                        <CalendarOutlined />
                        <Text>
                          {dayjs(deliverable.startDate).format('DD/MM/YYYY')} -
                          {dayjs(deliverable.endDate).format('DD/MM/YYYY')}
                        </Text>
                        <Text>|</Text>
                        <TeamOutlined />
                        <Text>{deliverable.responsible}</Text>
                      </Space>

                      <Progress
                        percent={deliverable.progress}
                        status={isDelayed ? 'exception' : deliverable.progress === 100 ? 'success' : 'active'}
                        strokeColor={isDelayed ? '#ff4d4f' : undefined}
                      />

                      {deliverable.milestones && deliverable.milestones.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200">
                          <Text type="secondary" className="font-hanuman text-sm">ចំណុចសំខាន់:</Text>
                          {deliverable.milestones.map((milestone: any) => (
                            <div key={milestone.id} className="mt-2">
                              <Checkbox
                                checked={milestone.completed}
                                disabled
                                className="font-hanuman"
                              >
                                <Space>
                                  <Text className={milestone.completed ? 'line-through text-gray-400' : ''}>
                                    {milestone.name}
                                  </Text>
                                  <Text type="secondary" className="text-xs">
                                    ({dayjs(milestone.date).format('DD/MM/YYYY')})
                                  </Text>
                                </Space>
                              </Checkbox>
                            </div>
                          ))}
                        </div>
                      )}

                      {deliverable.dependencies && deliverable.dependencies.length > 0 && (
                        <div className="mt-3">
                          <Text type="secondary" className="font-hanuman text-sm">
                            ពឹងផ្អែកលើ: {deliverable.dependencies.join(', ')}
                          </Text>
                        </div>
                      )}
                    </Card>
                  </Timeline.Item>
                )
              })}
            </Timeline>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2} className="font-hanuman text-blue-800 mb-2">
          <DashboardOutlined className="mr-2" />
          ផ្ទាំងគ្រប់គ្រង M&E និងផែនការគម្រោង
        </Title>
        <Text className="text-gray-600 font-hanuman">
          តាមដានវឌ្ឍនភាព វាយតម្លៃលទ្ធផល និងផែនការគម្រោង
        </Text>
      </div>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Space size="large" wrap>
          <div>
            <Text className="font-hanuman mr-2">ប្រភេទកិច្ចព្រមព្រៀង:</Text>
            <Select
              style={{ width: 200 }}
              placeholder="ជ្រើសរើសប្រភេទ"
              value={selectedContract}
              allowClear={user?.role !== UserRole.PARTNER}
              disabled={user?.role === UserRole.PARTNER}
              onChange={setSelectedContract}
            >
              {Object.entries(CONTRACT_TYPES).map(([key, value]) => (
                <Select.Option key={key} value={Number(key)}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <Text className="font-hanuman mr-2">រយៈពេល:</Text>
            <RangePicker
              value={dateRange as any}
              onChange={(dates) => setDateRange(dates as any)}
              format="DD/MM/YYYY"
            />
          </div>
          <Button type="primary" icon={<BarChartOutlined />}>
            បង្កើតរបាយការណ៍
          </Button>
        </Space>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="font-hanuman">សកម្មភាពសរុប</span>}
              value={dashboardData.totalDeliverables}
              prefix={<ProjectOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="font-hanuman">បានបញ្ចប់</span>}
              value={dashboardData.completedDeliverables}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="font-hanuman">កំពុងដំណើរការ</span>}
              value={dashboardData.inProgressDeliverables}
              prefix={<SyncOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="font-hanuman">វឌ្ឍនភាពរួម</span>}
              value={dashboardData.overallProgress}
              suffix="%"
              valueStyle={{ color: dashboardData.overallProgress >= 70 ? '#52c41a' : '#faad14' }}
            />
            <Progress
              percent={dashboardData.overallProgress}
              showInfo={false}
              strokeColor={dashboardData.overallProgress >= 70 ? '#52c41a' : '#faad14'}
            />
          </Card>
        </Col>
      </Row>

      {/* Show alert for delayed deliverables */}
      {dashboardData.delayedDeliverables > 0 && (
        <Alert
          message={`មានសកម្មភាពចំនួន ${dashboardData.delayedDeliverables} ហួសកាលកំណត់`}
          description="សូមពិនិត្យ និងធ្វើបច្ចុប្បន្នភាពស្ថានភាពសកម្មភាព"
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          className="mb-4 font-hanuman"
          closable
        />
      )}

      {/* Data Tabs */}
      <Card className="shadow-sm">
        <Tabs
          defaultActiveKey="timeline"
          size="large"
          items={[
            {
              key: 'timeline',
              label: (
                <span className="font-hanuman">
                  <CalendarOutlined className="mr-2" />
                  ផែនការគម្រោង
                </span>
              ),
              children: renderProjectTimeline()
            },
            {
              key: 'indicators',
              label: (
                <span className="font-hanuman">
                  <FundProjectionScreenOutlined className="mr-2" />
                  សូចនាករ
                </span>
              ),
              children: (
                <Table
                  columns={indicatorColumns}
                  dataSource={indicatorsData}
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                />
              )
            },
            {
              key: 'activities',
              label: (
                <span className="font-hanuman">
                  <RiseOutlined className="mr-2" />
                  សកម្មភាព
                </span>
              ),
              children: (
                <Table
                  columns={activityColumns}
                  dataSource={activitiesData}
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                />
              )
            },
            {
              key: 'milestones',
              label: (
                <span className="font-hanuman">
                  <CheckCircleOutlined className="mr-2" />
                  ចំណុចសំខាន់
                </span>
              ),
              children: (
                <Table
                  columns={milestoneColumns}
                  dataSource={milestonesData}
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                />
              )
            },
            {
              key: 'reports',
              label: (
                <span className="font-hanuman">
                  <FileTextOutlined className="mr-2" />
                  របាយការណ៍
                </span>
              ),
              children: (
                <div className="text-center py-8">
                  <Text className="font-hanuman text-gray-500">
                    មុខងារនេះនឹងមានក្នុងពេលឆាប់ៗនេះ
                  </Text>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}