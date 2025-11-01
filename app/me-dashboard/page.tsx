'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Tabs, Table, Progress, Tag, Space, Button, DatePicker, Select, Timeline, Alert, Badge, Tooltip, Empty, Checkbox, Popconfirm, message, Dropdown, Avatar, Modal, Form, Input, Spin } from 'antd'
import { DashboardOutlined, RiseOutlined, TeamOutlined, FundProjectionScreenOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, CalendarOutlined, ProjectOutlined, AlertOutlined, SyncOutlined, FieldTimeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, UserOutlined, LogoutOutlined, KeyOutlined, ReloadOutlined, DownloadOutlined, TrophyOutlined, CloseCircleOutlined, SettingOutlined, BellOutlined, FormOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { PROJECT_PLANS, getProjectPlanByContract, calculateProjectProgress, getUpcomingMilestones, getDelayedDeliverables } from '@/lib/project-deliverables'
import { UserRole } from '@/lib/roles'
import IndicatorForm from './components/IndicatorForm'
import ActivityForm from './components/ActivityForm'
import DataCollectionForm from './components/DataCollectionForm'
import PersonalInfoForm from './personal-info-form'
import { useContent } from '@/lib/hooks/useContent'

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
  const { t } = useContent()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])
  const [selectedContract, setSelectedContract] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [projectPlans, setProjectPlans] = useState<any[]>([])
  const [indicators, setIndicators] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loadingIndicators, setLoadingIndicators] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [showIndicatorForm, setShowIndicatorForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [showDataCollectionForm, setShowDataCollectionForm] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<any>(null)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [selectedIndicatorForData, setSelectedIndicatorForData] = useState<number | undefined>(undefined)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [passwordForm] = Form.useForm()
  const [changingPassword, setChangingPassword] = useState(false)
  const [resettingDemo, setResettingDemo] = useState(false)
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [loadingDeliverables, setLoadingDeliverables] = useState(false)
  const [hasDeliverables, setHasDeliverables] = useState(false)
  const [contractMilestones, setContractMilestones] = useState<any[]>([])
  const [loadingContractMilestones, setLoadingContractMilestones] = useState(false)
  const [userContractId, setUserContractId] = useState<number | null>(null)
  const [allContracts, setAllContracts] = useState<any[]>([])
  const [loadingContracts, setLoadingContracts] = useState(false)
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    // Load project plans based on user role and selected contract
    if (user) {
      loadProjectPlans()
      fetchIndicators()
      fetchActivities()
      fetchDeliverables()
      fetchContractMilestones()
      // Fetch all contracts for SUPER_ADMIN/ADMIN
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        fetchAllContracts()
      }
    }
  }, [user, selectedContract])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Check if PARTNER user has signed contract
        if (userData.role === UserRole.PARTNER && !userData.contract_signed) {
          message.warning(t('dashboard_contract_warning'))
          router.push('/contract/sign')
          return
        }

        // Note: Configuration check removed - sign page now enforces proper configuration
        // Users can no longer bypass deliverable selection, so this check is no longer needed

        setUser(userData)
        // Set initial contract filter for PARTNER users
        if (userData.role === UserRole.PARTNER && userData.contract_type) {
          setSelectedContract(userData.contract_type)
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


  // Fetch indicators from database
  const fetchIndicators = async () => {
    setLoadingIndicators(true)
    try {
      const params = selectedContract ? `?contractType=${selectedContract}` : ''
      const response = await fetch(`/api/me/indicators${params}`)
      if (response.ok) {
        const data = await response.json()
        setIndicators(data.indicators)
      }
    } catch (error) {
      console.error('Failed to fetch indicators:', error)
    } finally {
      setLoadingIndicators(false)
    }
  }

  // Fetch activities from database
  const fetchActivities = async () => {
    setLoadingActivities(true)
    try {
      const params = selectedContract ? `?contractType=${selectedContract}` : ''
      const response = await fetch(`/api/me/activities${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const fetchDeliverables = async () => {
    setLoadingDeliverables(true)
    try {
      const response = await fetch('/api/me/deliverables')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.hasDeliverables) {
          setHasDeliverables(true)
          setDeliverables(data.data.deliverables || [])
          setUserContractId(data.data.contractId) // Store contract ID for milestones fetch
        } else {
          setHasDeliverables(false)
          setDeliverables([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
      setHasDeliverables(false)
    } finally {
      setLoadingDeliverables(false)
    }
  }

  const fetchContractMilestones = async () => {
    // Fetch milestones for ALL contract types (no restrictions)
    if (!user) {
      setContractMilestones([])
      return
    }

    // Wait for userContractId to be available if needed
    if (!userContractId) {
      // Contract ID will be fetched via deliverables API
      return
    }

    setLoadingContractMilestones(true)
    try {
      const response = await fetch(`/api/milestones?contract_id=${userContractId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setContractMilestones(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch contract milestones:', error)
    } finally {
      setLoadingContractMilestones(false)
    }
  }

  // Fetch milestones when userContractId becomes available
  useEffect(() => {
    if (userContractId && user) {
      fetchContractMilestones()
    }
  }, [userContractId])

  // Fetch all contracts for SUPER_ADMIN/ADMIN
  const fetchAllContracts = async () => {
    setLoadingContracts(true)
    try {
      const response = await fetch('/api/contracts/all')
      if (response.ok) {
        const data = await response.json()
        setAllContracts(data.contracts || [])
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setLoadingContracts(false)
    }
  }

  const handleEditIndicator = (indicator: any) => {
    setEditingIndicator(indicator)
    setShowIndicatorForm(true)
  }

  const handleDeleteIndicator = async (id: number) => {
    try {
      const response = await fetch(`/api/me/indicators/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        message.success(t('dashboard_indicator_deleted'))
        fetchIndicators()
      } else {
        message.error(t('dashboard_indicator_delete_error'))
      }
    } catch (error) {
      message.error(t('dashboard_indicator_delete_error'))
    }
  }

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity)
    setShowActivityForm(true)
  }

  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(`/api/me/activities/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        message.success(t('dashboard_activity_deleted'))
        fetchActivities()
      } else {
        message.error(t('dashboard_activity_delete_error'))
      }
    } catch (error) {
      message.error(t('dashboard_activity_delete_error'))
    }
  }

  const handleAddDataCollection = (indicatorId: number) => {
    setSelectedIndicatorForData(indicatorId)
    setShowDataCollectionForm(true)
  }

  const loadProjectPlans = () => {
    // Contract 4 & 5 use REAL data from database, NOT fake PROJECT_PLANS
    if (user.role === UserRole.PARTNER && (user.contract_type === 4 || user.contract_type === 5)) {
      setProjectPlans([])
      return
    }

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

  // Calculate dashboard statistics using REAL data from database for ALL contract types
  const calculateDashboardStats = () => {
    // Use REAL indicators data for ALL contract types (no more fake PROJECT_PLANS)
    const totalIndicators = indicators.length
    const achievedIndicators = indicators.filter((ind: any) => ind.status === 'achieved').length
    const onTrackIndicators = indicators.filter((ind: any) => ind.status === 'on-track').length
    const atRiskIndicators = indicators.filter((ind: any) => ind.status === 'at-risk' || ind.status === 'delayed').length

    const totalProgress = indicators.reduce((sum: number, ind: any) => sum + (ind.progress || 0), 0)
    const overallProgress = totalIndicators > 0 ? Math.round(totalProgress / totalIndicators) : 0

    return {
      totalDeliverables: totalIndicators,
      completedDeliverables: achievedIndicators,
      inProgressDeliverables: onTrackIndicators,
      overallProgress,
      upcomingMilestones: 0,
      delayedDeliverables: atRiskIndicators,
      totalBudget: 0
    }
  }

  const dashboardData = calculateDashboardStats()

  // Format indicators data for table
  const indicatorsData = indicators.map((ind) => ({
    key: ind.id,
    code: ind.indicator_code,
    name: ind.indicator_name_khmer,
    name_english: ind.indicator_name_english,
    type: ind.indicator_type,
    baseline: ind.baseline_value,
    target: ind.target_value,
    current: ind.current,
    unit: ind.measurement_unit,
    frequency: ind.frequency,
    progress: ind.progress,
    status: ind.status,
    activities: ind.activities
  }))

  // Format activities data for table
  const activitiesData = activities.map((act) => ({
    key: act.id,
    code: act.activity_code,
    name: act.activity_name_khmer,
    name_english: act.activity_name_english,
    status: act.status,
    startDate: act.planned_start,
    endDate: act.planned_end,
    progress: act.progress,
    budget: act.budget_allocated,
    spent: act.budget_spent,
    budgetUtilization: act.budgetUtilization,
    responsible: act.responsible_person || 'មិនបានកំណត់',
    location: act.location,
    indicator: act.indicator
  }))

  // Get milestones from project plans
  const getMilestonesData = () => {
    const milestones: any[] = []
    projectPlans.forEach(plan => {
      plan.deliverables.forEach((deliverable: any) => {
        if (deliverable.milestones) {
          deliverable.milestones.forEach((milestone: any) => {
            milestones.push({
              key: milestone.id,
              name: milestone.name,
              dueDate: milestone.date,
              status: milestone.completed ? 'achieved' :
                      (dayjs(milestone.date).isBefore(dayjs()) ? 'overdue' : 'pending'),
              activity: deliverable.id,
              contractType: plan.contractType,
              deliverableName: deliverable.name
            })
          })
        }
      })
    })
    return milestones
  }

  const milestonesData = getMilestonesData()

  const indicatorColumns = [
    {
      title: t('dashboard_table_code'),
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: t('dashboard_table_indicator'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('dashboard_table_type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const colors: any = {
          'លទ្ធផល': 'blue',       // OUTPUT
          'កាត់បន្ថយ': 'orange',   // REDUCTION
          'outcome': 'green',
          'impact': 'purple'
        }
        return <Tag color={colors[type] || 'blue'}>{type}</Tag>
      }
    },
    {
      title: t('dashboard_table_target'),
      dataIndex: 'target',
      key: 'target',
      width: 100,
      render: (target: any) => {
        return typeof target === 'string' ? target : target?.toLocaleString()
      }
    },
    {
      title: t('dashboard_table_current'),
      dataIndex: 'current',
      key: 'current',
      width: 80,
      render: (current: any) => current?.toLocaleString() || 'គ្មាន'
    },
    {
      title: 'ឯកតា',
      dataIndex: 'unit',
      key: 'unit',
      width: 80
    },
    {
      title: t('dashboard_table_progress'),
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
      title: t('dashboard_table_status'),
      key: 'status',
      width: 100,
      render: (record: any) => {
        const statusConfig = {
          'on-track': { color: 'green', text: t('dashboard_on_track') },
          'delayed': { color: 'orange', text: 'យឺត' },
          'at-risk': { color: 'red', text: 'មានហានិភ័យ' },
          'achieved': { color: 'blue', text: t('dashboard_achieved') }
        }
        const config = statusConfig[record.status as keyof typeof statusConfig] || { color: 'default', text: record.status }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: t('dashboard_table_actions'),
      key: 'actions',
      width: 150,
      render: (record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<SaveOutlined />}
            onClick={() => handleAddDataCollection(record.key)}
          >
            {t('dashboard_input_data')}
          </Button>
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditIndicator(record)}
              />
              {user?.role === UserRole.SUPER_ADMIN && (
                <Popconfirm
                  title={t('dashboard_delete_indicator_confirm')}
                  onConfirm={() => handleDeleteIndicator(record.key)}
                  okText={t('dashboard_confirm_yes')}
                  cancelText={t('dashboard_confirm_no')}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  const activityColumns = [
    {
      title: t('dashboard_table_code'),
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'សកម្មភាព',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <Text strong>{name}</Text>
          {record.description && (
            <div className="text-gray-500 text-sm">{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'ទទួលខុសត្រូវ',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 150
    },
    {
      title: t('dashboard_table_status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          planned: { color: 'default', text: 'គម្រោង' },
          ongoing: { color: 'processing', text: t('dashboard_in_progress') },
          completed: { color: 'success', text: t('dashboard_completed') },
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
      title: t('dashboard_table_progress'),
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
    },
    {
      title: t('dashboard_table_actions'),
      key: 'actions',
      width: 120,
      render: (record: any) => (
        <Space size="small">
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditActivity(record)}
              />
              {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
                <Popconfirm
                  title={t('dashboard_delete_activity_confirm')}
                  onConfirm={() => handleDeleteActivity(record.key)}
                  okText={t('dashboard_confirm_yes')}
                  cancelText={t('dashboard_confirm_no')}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )}
            </>
          )}
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
      dataIndex: 'deliverableName',
      key: 'deliverableName',
      width: 200,
      render: (name: string) => name || 'មិនបានកំណត់'
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

  // Timeline component for a single project plan
  const renderSingleProjectTimeline = (plan: any) => {
    if (!plan) {
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
        <div className="mb-4">
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
    )
  }

  // Create sub-tabs for project timelines
  const renderProjectTimelineTabs = () => {
    // For PARTNER users, show only their contract type
    if (user?.role === UserRole.PARTNER && user?.contract_type) {
      const plan = projectPlans.find((p: any) => p.contractType === user.contract_type)
      return renderSingleProjectTimeline(plan)
    }

    // For ADMIN/SUPER_ADMIN, show tabs for all available contracts
    if (projectPlans.length === 0) {
      return (
        <Empty
          description={
            <span className="font-hanuman">សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង</span>
          }
        />
      )
    }

    // Create sub-tabs for each contract type
    const timelineTabItems = projectPlans.map((plan: any) => {
      const contractTypeNames: any = {
        1: 'PMU-PCU',
        2: 'PCU-PM',
        3: 'PM-Regional',
        4: 'DoE-District',
        5: 'DoE-School'
      }

      return {
        key: `contract-${plan.contractType}`,
        label: (
          <span className="font-hanuman text-sm">
            {contractTypeNames[plan.contractType]}
          </span>
        ),
        children: renderSingleProjectTimeline(plan)
      }
    })

    return (
      <Tabs
        defaultActiveKey={`contract-${projectPlans[0]?.contractType}`}
        size="small"
        type="card"
        items={timelineTabItems}
      />
    )
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        message.success(t('dashboard_logout_success'))
        router.push('/login')
      }
    } catch (error) {
      message.error(t('dashboard_logout_error'))
    }
  }

  // Handle change password
  const handleChangePassword = async (values: any) => {
    setChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      })

      if (response.ok) {
        message.success(t('dashboard_password_success'))
        setShowChangePasswordModal(false)
        passwordForm.resetFields()
      } else {
        message.error(t('dashboard_password_incorrect'))
      }
    } catch (error) {
      message.error(t('dashboard_password_error'))
    } finally {
      setChangingPassword(false)
    }
  }

  // Handle force reset for demo users
  const handleForceReset = async () => {
    setResettingDemo(true)
    try {
      const response = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      })

      if (response.ok) {
        message.success(t('dashboard_reset_success'))
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        message.error(t('dashboard_reset_error'))
      }
    } catch (error) {
      message.error(t('dashboard_reset_error'))
    } finally {
      setResettingDemo(false)
    }
  }


  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Modern Header with Ant Design styling */}
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        marginBottom: 24
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 48px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <Avatar
                  size={64}
                  icon={<DashboardOutlined />}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                />
                <div>
                  <Title level={2} style={{ color: '#fff', marginBottom: 4, fontFamily: 'Hanuman' }}>
                    {t('dashboard_title')}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontFamily: 'Hanuman' }}>
                    {t('dashboard_subtitle')}
                  </Text>
                </div>
              </Space>
            </Col>

            {/* User Profile Dropdown */}
            <Col>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_profile')}</span>,
                      onClick: () => setShowPersonalInfoForm(true)
                    },
                    {
                      key: 'change-password',
                      icon: <KeyOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_password')}</span>,
                      onClick: () => setShowChangePasswordModal(true)
                    },
                    // Show Configure Deliverables only for Contract Type 4 & 5
                    ...(user?.contract_type === 4 || user?.contract_type === 5 ? [{
                      key: 'configure-deliverables',
                      icon: <SettingOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_configure')}</span>,
                      onClick: () => router.push('/contract/configure')
                    }] : []),
                    { type: 'divider' },
                    // Admin menu items for SUPER_ADMIN, ADMIN, COORDINATOR
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'manage-users',
                      icon: <TeamOutlined />,
                      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
                      onClick: () => router.push('/admin/users')
                    }] : []),
                    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
                      key: 'content-management',
                      icon: <FileTextOutlined />,
                      label: 'គ្រប់គ្រងខ្លឹមសារ (CMS)',
                      onClick: () => router.push('/admin/content-management')
                    }] : []),
                    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
                      key: 'deliverables-management',
                      icon: <FormOutlined />,
                      label: 'គ្រប់គ្រងសមិទ្ធកម្ម',
                      onClick: () => router.push('/admin/deliverables-management')
                    }] : []),
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'reconfig-requests',
                      icon: <BellOutlined />,
                      label: 'សំណើផ្លាស់ប្តូរសមិទ្ធកម្ម',
                      onClick: () => router.push('/admin/reconfiguration-requests')
                    }] : []),
                    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'COORDINATOR' ? [{ type: 'divider' as const }] : []),
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
                <Card
                  hoverable
                  size="small"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  styles={{ body: { padding: '12px 16px' } }}
                >
                  <Space>
                    <Avatar icon={<UserOutlined />} size={48} style={{ background: '#fff', color: '#1890ff' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, fontFamily: 'Hanuman' }}>
                        {user?.full_name}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Hanuman' }}>
                        {user?.role}
                      </div>
                    </div>
                  </Space>
                </Card>
              </Dropdown>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px 48px' }}>

      {/* Filters - Ant Design Style */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }} styles={{ body: { padding: 24 } }}>
        <Row gutter={[24, 16]} align="bottom">
          <Col flex="1" style={{ minWidth: 240 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 15, fontFamily: 'Hanuman' }}>
              {t('dashboard_contract_type_filter')}
            </Text>
            <Select
              style={{ width: '100%' }}
              placeholder="ជ្រើសរើសប្រភេទ"
              size="large"
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
          </Col>
          <Col flex="1" style={{ minWidth: 320 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 15, fontFamily: 'Hanuman' }}>
              {t('dashboard_duration_filter')}
            </Text>
            <RangePicker
              style={{ width: '100%' }}
              size="large"
              value={dateRange as any}
              onChange={(dates) => setDateRange(dates as any)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Space size="middle">
              {user?.role === UserRole.PARTNER && user?.contract_signed && userContractId && (
                <Button
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    // Open print page in new tab
                    window.open(`/contract/print/${userContractId}`, '_blank')
                  }}
                  style={{ fontFamily: 'Hanuman' }}
                >
                  {t('dashboard_download_contract')}
                </Button>
              )}

              {/* Force Reset Button for Demo Users */}
              {user?.phone && ['077806680', '077806681', '077806682', '077806683', '077806684', '077806685'].includes(user.phone) && (
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleForceReset}
                  loading={resettingDemo}
                  style={{ fontFamily: 'Hanuman' }}
                >
                  {t('dashboard_reset_demo')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards - Ant Design with Beautiful Colors */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={12} lg={6}>
          <Badge.Ribbon text={<span style={{ fontFamily: 'Hanuman' }}>សរុប</span>} color="blue">
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                borderRadius: 12,
                minHeight: 160
              }}
              styles={{ body: { padding: 24, height: '100%' } }}
            >
              <Row justify="space-between" align="middle" style={{ height: '100%' }}>
                <Col>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Hanuman', display: 'block', marginBottom: 8 }}>
                    {hasDeliverables ? t('dashboard_total_indicators') : t('dashboard_total_activities')}
                  </Text>
                  <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 36 }}>
                    {dashboardData.totalDeliverables}
                  </Title>
                </Col>
                <Col>
                  <Avatar
                    size={64}
                    icon={<ProjectOutlined />}
                    style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
                  />
                </Col>
              </Row>
            </Card>
          </Badge.Ribbon>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Badge.Ribbon text={<span style={{ fontFamily: 'Hanuman' }}>បញ្ចប់</span>} color="green">
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                borderRadius: 12,
                minHeight: 160
              }}
              styles={{ body: { padding: 24, height: '100%' } }}
            >
              <Row justify="space-between" align="middle" style={{ height: '100%' }}>
                <Col>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Hanuman', display: 'block', marginBottom: 8 }}>
                    {hasDeliverables ? t('dashboard_achieved') : t('dashboard_completed')}
                  </Text>
                  <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 36 }}>
                    {dashboardData.completedDeliverables}
                  </Title>
                </Col>
                <Col>
                  <Avatar
                    size={64}
                    icon={<CheckCircleOutlined />}
                    style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
                  />
                </Col>
              </Row>
            </Card>
          </Badge.Ribbon>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Badge.Ribbon text={<span style={{ fontFamily: 'Hanuman' }}>កំពុងដំណើរការ</span>} color="orange">
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                border: 'none',
                borderRadius: 12,
                minHeight: 160
              }}
              styles={{ body: { padding: 24, height: '100%' } }}
            >
              <Row justify="space-between" align="middle" style={{ height: '100%' }}>
                <Col>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Hanuman', display: 'block', marginBottom: 8 }}>
                    {hasDeliverables ? t('dashboard_on_track') : t('dashboard_in_progress')}
                  </Text>
                  <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 36 }}>
                    {dashboardData.inProgressDeliverables}
                  </Title>
                </Col>
                <Col>
                  <Avatar
                    size={64}
                    icon={<SyncOutlined spin />}
                    style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
                  />
                </Col>
              </Row>
            </Card>
          </Badge.Ribbon>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Badge.Ribbon text={<span style={{ fontFamily: 'Hanuman' }}>វឌ្ឍនភាព</span>} color="purple">
            <Card
              hoverable
              style={{
                background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                border: 'none',
                borderRadius: 12,
                minHeight: 160
              }}
              styles={{ body: { padding: 24, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
            >
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Hanuman', display: 'block', marginBottom: 8 }}>
                  {t('dashboard_overall_progress')}
                </Text>
                <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 36, marginBottom: 16 }}>
                  {dashboardData.overallProgress}%
                </Title>
              </div>
              <Progress
                percent={dashboardData.overallProgress}
                showInfo={false}
                strokeColor="#fff"
                trailColor="rgba(255, 255, 255, 0.25)"
                size={['100%', 8]}
              />
            </Card>
          </Badge.Ribbon>
        </Col>
      </Row>

      {/* Show alert for delayed deliverables */}
      {dashboardData.delayedDeliverables > 0 && (
        <Alert
          message={
            <Text strong style={{ fontFamily: 'Hanuman' }}>
              {`មានសកម្មភាពចំនួន ${dashboardData.delayedDeliverables} ហួសកាលកំណត់`}
            </Text>
          }
          description={
            <Text style={{ fontFamily: 'Hanuman' }}>
              សូមពិនិត្យ និងធ្វើបច្ចុប្បន្នភាពស្ថានភាពសកម្មភាព
            </Text>
          }
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          style={{ marginBottom: 24, borderRadius: 8 }}
          closable
        />
      )}

      {/* Data Tabs - Ant Design Style - Simplified to 3 Tabs for ALL Users */}
      <Card style={{ borderRadius: 8 }}>
        <Tabs
          defaultActiveKey="indicators"
          size="large"
          tabBarStyle={{ marginBottom: 0, paddingLeft: 0, paddingRight: 0 }}
          items={[
            // Tab 1: Indicators (ALWAYS visible for ALL contract types)
            {
              key: 'indicators',
              label: (
                <span className="font-hanuman text-base">
                  <FundProjectionScreenOutlined className="mr-2" />
                  {t('dashboard_tab_indicators')}
                </span>
              ),
              children: (
                <div>
                  {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
                    <div className="mb-6">
                      <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingIndicator(null)
                          setShowIndicatorForm(true)
                        }}
                      >
                        {t('dashboard_create_indicator')}
                      </Button>
                    </div>
                  )}

                  {/* Unified Table View - Optimized for Tablet/Desktop */}
                  {loadingIndicators ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                    </div>
                  ) : indicatorsData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table
                        columns={indicatorColumns}
                        dataSource={indicatorsData}
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `សរុប ${total} ធាតុ` }}
                        loading={loadingIndicators}
                        scroll={{ x: 1400 }}
                        size="middle"
                      />
                    </div>
                  ) : (
                    <Empty description={t('dashboard_no_indicators')} />
                  )}
                </div>
              )
            },
            // Tab 2: Deliverables (ALWAYS visible for ALL contract types)
            {
              key: 'deliverables',
              label: (
                <span className="font-hanuman text-base">
                  <TrophyOutlined className="mr-2" />
                  {t('dashboard_tab_deliverables')}
                </span>
              ),
              children: (
                <div>
                  {loadingDeliverables ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                    </div>
                  ) : deliverables.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table
                        columns={[
                          {
                            title: <span className="font-hanuman">ល.រ</span>,
                            dataIndex: 'deliverable_number',
                            key: 'number',
                            width: 80,
                            render: (_, record) => (
                              <Text className="font-hanuman">{record.deliverable_number}</Text>
                            )
                          },
                          {
                            title: <span className="font-hanuman">{t('dashboard_table_deliverable')}</span>,
                            key: 'deliverable',
                            render: (_, record) => (
                              <Text className="font-hanuman">{record.deliverable_title_khmer}</Text>
                            )
                          },
                          {
                            title: <span className="font-hanuman">{t('dashboard_table_indicator')}</span>,
                            key: 'indicator',
                            render: (_, record) => (
                              <div className="font-hanuman space-y-3">
                                {record.options
                                  .filter((option: any) => record.selected_option_id === option.id)
                                  .map((option: any) => (
                                    <div
                                      key={option.id}
                                      className="p-2 rounded bg-blue-50 border-l-4 border-blue-500"
                                    >
                                      <div className="flex items-start gap-2">
                                        <Text strong className="text-blue-600">
                                          {option.option_number}/
                                        </Text>
                                        <Text className="text-blue-700 font-medium">
                                          {option.option_text_khmer}
                                        </Text>
                                        <Tag color="blue">{t('dashboard_table_selected')}</Tag>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )
                          },
                          {
                            title: <span className="font-hanuman">{t('dashboard_table_timeline')}</span>,
                            key: 'timeline',
                            width: 200,
                            render: (_, record) => (
                              <Text className="font-hanuman">{record.timeline}</Text>
                            )
                          }
                        ]}
                        dataSource={deliverables}
                        pagination={false}
                        rowKey="id"
                        size="middle"
                      />
                    </div>
                  ) : (
                    <Empty
                      description={
                        <Text className="font-hanuman text-gray-500">
                          {t('dashboard_no_deliverables')}
                        </Text>
                      }
                    />
                  )}
                </div>
              )
            },
            // Tab 3: Milestone Tracking (ALWAYS visible for ALL contract types)
            {
              key: 'milestones',
              label: (
                <span className="font-hanuman text-base">
                  <CheckCircleOutlined className="mr-2" />
                  {t('dashboard_tab_milestones')}
                </span>
              ),
              children: (
                <div>
                  <div className="mb-4 pb-2 border-b">
                    <Title level={4} className="font-hanuman mb-2">តារាងតាមដានសមិទ្ធកម្ម (Milestone Tracking)</Title>
                    <Text className="text-gray-600 font-hanuman">តាមដានវឌ្ឍនភាពនៃការអនុវត្តសមិទ្ធកម្មនីមួយៗ</Text>
                  </div>

                  {loadingContractMilestones ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                    </div>
                  ) : contractMilestones.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table
                        columns={[
                          {
                            title: <span className="font-hanuman">កូដ</span>,
                            dataIndex: 'milestone_code',
                            key: 'code',
                            width: 100
                          },
                          {
                            title: <span className="font-hanuman">ឈ្មោះសមិទ្ធកម្ម</span>,
                            dataIndex: 'milestone_name_km',
                            key: 'name'
                          },
                          {
                            title: <span className="font-hanuman">រយៈពេល</span>,
                            key: 'timeline',
                            width: 200,
                            render: (record: any) => (
                              <div className="font-hanuman text-sm">
                                <div>{dayjs(record.planned_start_date).format('DD/MM/YYYY')}</div>
                                <div>ដល់ {dayjs(record.planned_end_date).format('DD/MM/YYYY')}</div>
                              </div>
                            )
                          },
                          {
                            title: <span className="font-hanuman">វឌ្ឍនភាព</span>,
                            key: 'progress',
                            width: 150,
                            render: (record: any) => (
                              <div>
                                <Progress
                                  percent={Math.round(record.achievement_percentage)}
                                  size="small"
                                  status={
                                    record.health_indicator === 'critical' ? 'exception' :
                                    record.health_indicator === 'at_risk' ? 'active' :
                                    'success'
                                  }
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {record.current_value || record.baseline_value} / {record.target_value} {record.measurement_unit}
                                </div>
                              </div>
                            )
                          },
                          {
                            title: <span className="font-hanuman">ស្ថានភាព</span>,
                            key: 'status',
                            width: 120,
                            render: (record: any) => {
                              const statusConfig: any = {
                                not_started: { color: 'default', text: 'មិនទាន់ចាប់ផ្តើម' },
                                in_progress: { color: 'processing', text: 'កំពុងដំណើរការ' },
                                completed: { color: 'success', text: 'បានបញ្ចប់' },
                                delayed: { color: 'error', text: 'យឺតយ៉ាវ' }
                              }
                              const config = statusConfig[record.overall_status] || { color: 'default', text: record.overall_status }
                              return <Tag color={config.color}>{config.text}</Tag>
                            }
                          },
                          {
                            title: <span className="font-hanuman">សុខភាព</span>,
                            key: 'health',
                            width: 120,
                            render: (record: any) => {
                              const healthConfig: any = {
                                on_track: { color: 'green', text: 'តាមគម្រោង', icon: <CheckCircleOutlined /> },
                                at_risk: { color: 'orange', text: 'មានហានិភ័យ', icon: <AlertOutlined /> },
                                critical: { color: 'red', text: 'គ្រិះថ្នាក់', icon: <CloseCircleOutlined /> }
                              }
                              const config = healthConfig[record.health_indicator] || { color: 'default', text: record.health_indicator }
                              return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
                            }
                          }
                        ]}
                        dataSource={contractMilestones}
                        pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `សរុប ${total} ធាតុ` }}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                        size="middle"
                        expandable={{
                          expandedRowRender: (record: any) => (
                            <div className="p-4 bg-gray-50 font-hanuman">
                              {record.milestone_description_km && (
                                <div className="mb-3">
                                  <Text strong>ការពិពណ៌នា: </Text>
                                  <Text>{record.milestone_description_km}</Text>
                                </div>
                              )}

                              {record.activities && record.activities.length > 0 && (
                                <div className="mb-3">
                                  <Text strong>សកម្មភាព ({record.activities.length}):</Text>
                                  <div className="mt-2 space-y-1">
                                    {record.activities.map((activity: any) => (
                                      <div key={activity.id} className="flex items-center gap-2">
                                        <Tag color={activity.status === 'completed' ? 'success' : 'processing'}>
                                          {activity.activity_name_km}
                                        </Tag>
                                        <Progress
                                          percent={activity.completion_percentage}
                                          size="small"
                                          style={{ width: '150px' }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {record.deliverables && record.deliverables.length > 0 && (
                                <div>
                                  <Text strong>ផលិតផល ({record.deliverables.length}):</Text>
                                  <div className="mt-2 space-y-1">
                                    {record.deliverables.map((deliverable: any) => (
                                      <div key={deliverable.id} className="flex items-center gap-2">
                                        <Tag color={deliverable.status === 'approved' ? 'success' : 'warning'}>
                                          {deliverable.deliverable_name_km}
                                        </Tag>
                                        <Text type="secondary" className="text-xs">
                                          កាលបរិច្ឆេទ: {dayjs(deliverable.due_date).format('DD/MM/YYYY')}
                                        </Text>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        }}
                      />
                    </div>
                  ) : (
                    <Empty
                      description={
                        <Text className="font-hanuman text-gray-500">
                          {t('dashboard_no_milestones')}
                        </Text>
                      }
                    />
                  )}
                </div>
              )
            },
            // Tab 4: Contracts List (ONLY visible for SUPER_ADMIN/ADMIN)
            ...((user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) ? [{
              key: 'contracts',
              label: (
                <span className="font-hanuman text-base">
                  <FileTextOutlined className="mr-2" />
                  {t('dashboard_tab_contracts')}
                </span>
              ),
              children: (
                <div>
                  {loadingContracts ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                    </div>
                  ) : allContracts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table
                        columns={[
                          {
                            title: <span className="font-hanuman">លេខកិច្ចសន្យា</span>,
                            dataIndex: 'contract_number',
                            key: 'contract_number',
                            width: 150
                          },
                          {
                            title: <span className="font-hanuman">ឈ្មោះអ្នកប្រើប្រាស់</span>,
                            key: 'user_name',
                            render: (record: any) => (
                              <Text className="font-hanuman">{record.created_by_user?.full_name || '-'}</Text>
                            )
                          },
                          {
                            title: <span className="font-hanuman">លេខទូរស័ព្ទ</span>,
                            key: 'phone',
                            width: 120,
                            render: (record: any) => (
                              <Text className="font-hanuman">{record.created_by_user?.phone_number || '-'}</Text>
                            )
                          },
                          {
                            title: <span className="font-hanuman">ប្រភេទកិច្ចសន្យា</span>,
                            dataIndex: 'contract_type_id',
                            key: 'contract_type',
                            width: 150,
                            render: (type: number) => (
                              <Tag color="blue">{CONTRACT_TYPES[type as keyof typeof CONTRACT_TYPES]}</Tag>
                            )
                          },
                          {
                            title: <span className="font-hanuman">កាលបរិច្ឆេទចុះហត្ថលេខា</span>,
                            dataIndex: 'created_at',
                            key: 'created_at',
                            width: 150,
                            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
                          },
                          {
                            title: <span className="font-hanuman">សកម្មភាព</span>,
                            key: 'actions',
                            width: 200,
                            fixed: 'right' as const,
                            render: (record: any) => (
                              <Space size="small">
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={() => {
                                    window.open(`/contract/print/${record.id}`, '_blank')
                                  }}
                                >
                                  ទាញយក PDF
                                </Button>
                                {user?.role === UserRole.SUPER_ADMIN && (
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                      // TODO: Implement edit functionality
                                      message.info(t('dashboard_edit_coming_soon'))
                                    }}
                                  >
                                    {t('common_edit')}
                                  </Button>
                                )}
                              </Space>
                            )
                          }
                        ]}
                        dataSource={allContracts}
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `សរុប ${total} កិច្ចសន្យា` }}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                        size="middle"
                      />
                    </div>
                  ) : (
                    <Empty
                      description={
                        <Text className="font-hanuman text-gray-500">
                          {t('dashboard_no_contracts')}
                        </Text>
                      }
                    />
                  )}
                </div>
              )
            }] : [])
          ]}
        />
      </Card>

      {/* Forms */}
      <IndicatorForm
        visible={showIndicatorForm}
        onClose={() => {
          setShowIndicatorForm(false)
          setEditingIndicator(null)
        }}
        onSuccess={() => {
          fetchIndicators()
          setShowIndicatorForm(false)
          setEditingIndicator(null)
        }}
        indicator={editingIndicator}
      />

      <ActivityForm
        visible={showActivityForm}
        onClose={() => {
          setShowActivityForm(false)
          setEditingActivity(null)
        }}
        onSuccess={() => {
          fetchActivities()
          setShowActivityForm(false)
          setEditingActivity(null)
        }}
        activity={editingActivity}
      />

      <DataCollectionForm
        visible={showDataCollectionForm}
        onClose={() => {
          setShowDataCollectionForm(false)
          setSelectedIndicatorForData(undefined)
        }}
        onSuccess={() => {
          fetchIndicators()
          setShowDataCollectionForm(false)
          setSelectedIndicatorForData(undefined)
        }}
        indicatorId={selectedIndicatorForData}
      />

      {/* Personal Information Form */}
      <PersonalInfoForm
        visible={showPersonalInfoForm}
        onClose={() => {
          setShowPersonalInfoForm(false)
        }}
        onSuccess={() => {
          // Refresh user data after successful update
          checkSession()
          setShowPersonalInfoForm(false)
        }}
        user={user}
      />

      {/* Change Password Modal */}
      <Modal
        title={<span className="font-hanuman">{t('dashboard_password_modal_title')}</span>}
        open={showChangePasswordModal}
        onCancel={() => {
          setShowChangePasswordModal(false)
          passwordForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            name="currentPassword"
            label={<span className="font-hanuman">{t('dashboard_current_password')}</span>}
            rules={[{ required: true, message: 'សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន' }]}
          >
            <Input.Password placeholder={t('dashboard_current_password')} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span className="font-hanuman">{t('dashboard_new_password')}</span>}
            rules={[
              { required: true, message: 'សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី' },
              { min: 6, message: t('dashboard_password_min_length') }
            ]}
          >
            <Input.Password placeholder={t('dashboard_new_password')} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span className="font-hanuman">{t('dashboard_confirm_password')}</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'សូមបញ្ជាក់ពាក្យសម្ងាត់ថ្មី' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(t('dashboard_password_mismatch')))
                }
              })
            ]}
          >
            <Input.Password placeholder={t('dashboard_confirm_password')} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setShowChangePasswordModal(false)
                  passwordForm.resetFields()
                }}
              >
                បោះបង់
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                className="font-hanuman"
              >
                ផ្លាស់ប្តូរ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  )
}