'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Tabs, Table, Progress, Tag, Space, Button, DatePicker, Select } from 'antd'
import { DashboardOutlined, RiseOutlined, TeamOutlined, FundProjectionScreenOutlined, CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TabPane } = Tabs
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

  // Mock data for demonstration
  const [dashboardData, setDashboardData] = useState({
    totalIndicators: 25,
    activeActivities: 12,
    completedActivities: 8,
    totalBeneficiaries: 1250,
    overallProgress: 65,
    dataCollectionRate: 78,
    upcomingMilestones: 5,
    pendingReports: 3
  })

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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2} className="font-hanuman text-blue-800 mb-2">
          <DashboardOutlined className="mr-2" />
          ផ្ទាំងគ្រប់គ្រង M&E
        </Title>
        <Text className="text-gray-600 font-hanuman">
          តាមដានវឌ្ឍនភាព និងវាយតម្លៃលទ្ធផលគម្រោង
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
              allowClear
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
              title={<span className="font-hanuman">សូចនាករសរុប</span>}
              value={dashboardData.totalIndicators}
              prefix={<FundProjectionScreenOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="font-hanuman">សកម្មភាពសកម្ម</span>}
              value={dashboardData.activeActivities}
              prefix={<RiseOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="font-hanuman">អ្នកទទួលផលសរុប</span>}
              value={dashboardData.totalBeneficiaries}
              prefix={<TeamOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
              suffix="នាក់"
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

      {/* Data Tabs */}
      <Card className="shadow-sm">
        <Tabs defaultActiveKey="indicators" size="large">
          <TabPane
            tab={
              <span className="font-hanuman">
                <FundProjectionScreenOutlined className="mr-2" />
                សូចនាករ
              </span>
            }
            key="indicators"
          >
            <Table
              columns={indicatorColumns}
              dataSource={indicatorsData}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </TabPane>

          <TabPane
            tab={
              <span className="font-hanuman">
                <RiseOutlined className="mr-2" />
                សកម្មភាព
              </span>
            }
            key="activities"
          >
            <Table
              columns={activityColumns}
              dataSource={activitiesData}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </TabPane>

          <TabPane
            tab={
              <span className="font-hanuman">
                <CheckCircleOutlined className="mr-2" />
                ចំណុចសំខាន់
              </span>
            }
            key="milestones"
          >
            <Table
              columns={milestoneColumns}
              dataSource={milestonesData}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </TabPane>

          <TabPane
            tab={
              <span className="font-hanuman">
                <FileTextOutlined className="mr-2" />
                របាយការណ៍
              </span>
            }
            key="reports"
          >
            <div className="text-center py-8">
              <Text className="font-hanuman text-gray-500">
                មុខងារនេះនឹងមានក្នុងពេលឆាប់ៗនេះ
              </Text>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}