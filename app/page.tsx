'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, Typography, Space, Dropdown, Avatar, message, Tabs, Badge, Statistic, Tag, Table, Empty, Spin } from 'antd'
import { FileTextOutlined, EditOutlined, FileAddOutlined, FolderOpenOutlined, UserOutlined, LogoutOutlined, TeamOutlined, DashboardOutlined, CheckCircleOutlined, ClockCircleOutlined, FileDoneOutlined, FormOutlined, BankOutlined, SolutionOutlined, BookOutlined, HomeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { getAvailableContractIds, getContractTemplate } from '@/lib/contract-templates'
import { UserRole, getRoleLabel, hasPermission } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

// Contract type detailed descriptions
const CONTRACT_DETAILS = [
  {
    id: 1,
    icon: <BankOutlined className="text-4xl" />,
    color: '#0047AB',
    title: 'កិច្ចព្រមព្រៀង PMU-PCU',
    subtitle: 'គបស និង គបក',
    description: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង គណៈគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ (PMU) និង គណៈគ្រប់គ្រងគម្រោងតាមខេត្ត (PCU)',
    parties: ['គណៈគ្រប់គ្រងគម្រោងថ្នាក់ជាតិ', 'គណៈគ្រប់គ្រងគម្រោងតាមខេត្ត'],
    purpose: 'កំណត់ការទទួលខុសត្រូវ និងសមិទ្ធកម្មរវាងថ្នាក់ជាតិ និងខេត្ត',
    duration: '១ឆ្នាំ',
  },
  {
    id: 2,
    icon: <SolutionOutlined className="text-4xl" />,
    color: '#DC143C',
    title: 'កិច្ចព្រមព្រៀង PCU-Project Manager',
    subtitle: 'គបក និងប្រធានគម្រោង',
    description: 'កិច្ចព្រមព្រៀងរវាងប្រធាន គណៈគ្រប់គ្រងគម្រោងតាមខេត្ត និង ប្រធានគម្រោង',
    parties: ['ប្រធាន គបក', 'ប្រធានគម្រោង'],
    purpose: 'កំណត់ការអនុវត្តគម្រោងនៅថ្នាក់មូលដ្ឋាន',
    duration: '១ឆ្នាំ',
  },
  {
    id: 3,
    icon: <TeamOutlined className="text-4xl" />,
    color: '#FFD700',
    title: 'កិច្ចព្រមព្រៀង Project Manager-Regional',
    subtitle: 'ប្រធានគម្រោង និងមន្រ្តីតំបន់',
    description: 'កិច្ចព្រមព្រៀងរវាងប្រធានគម្រោង និង មន្រ្តីគម្រោងតាមតំបន់',
    parties: ['ប្រធានគម្រោង', 'មន្រ្តីគម្រោងតំបន់'],
    purpose: 'សម្របសម្រួលការងារគម្រោងនៅតាមតំបន់នីមួយៗ',
    duration: '១ឆ្នាំ',
  },
  {
    id: 4,
    icon: <BookOutlined className="text-4xl" />,
    color: '#52c41a',
    title: 'កិច្ចព្រមព្រៀង DoE-District Office',
    subtitle: 'នាយកដ្ឋានបឋម និងការិយាល័យស្រុក',
    description: 'កិច្ចព្រមព្រៀងរវាងនាយកដ្ឋានអប់រំបឋមសិក្សា និង ការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ',
    parties: ['នាយកដ្ឋានអប់រំបឋមសិក្សា', 'ការិយាល័យអប់រំស្រុក'],
    purpose: 'គាំទ្រការអប់រំបឋមសិក្សានៅថ្នាក់ស្រុក',
    duration: '១ឆ្នាំសិក្សា',
  },
  {
    id: 5,
    icon: <HomeOutlined className="text-4xl" />,
    color: '#1890ff',
    title: 'កិច្ចព្រមព្រៀង DoE-School',
    subtitle: 'នាយកដ្ឋានបឋម និងសាលា',
    description: 'កិច្ចព្រមព្រៀងរវាងនាយកដ្ឋានអប់រំបឋមសិក្សា និង សាលាបឋមសិក្សា',
    parties: ['នាយកដ្ឋានអប់រំបឋមសិក្សា', 'នាយកសាលា'],
    purpose: 'លើកកម្ពស់គុណភាពអប់រំនៅសាលាបឋមសិក្សា',
    duration: '១ឆ្នាំសិក្សា',
  },
]

export default function HomePage() {
  const router = useRouter()
  const contractIds = getAvailableContractIds()
  const [user, setUser] = useState<any>(null)
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    // Check session on mount
    checkSession()
  }, [])

  useEffect(() => {
    // Fetch contracts when user is available
    if (user) {
      fetchUserContracts()
    }
  }, [user])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Auto-redirect PARTNER users (Contract 4 & 5) to ME Dashboard
        if (userData.role === UserRole.PARTNER && (userData.contract_type === 4 || userData.contract_type === 5)) {
          // Contract 4 & 5 partners should use ME Dashboard, not contract management
          router.push('/me-dashboard')
          return
        }

        setUser(userData)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserContracts = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/contracts')
      if (response.ok) {
        const data = await response.json()
        // Filter contracts based on user role
        if (user.role === UserRole.PARTNER) {
          // Partners only see their own signed contracts
          const filtered = data.filter((contract: any) =>
            contract.created_by_id === user.id &&
            (contract.party_a_signature || contract.party_b_signature)
          )
          setContracts(filtered)
        } else if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
          // Admins see all contracts
          setContracts(data)
        } else {
          // Other roles see contracts they created
          const filtered = data.filter((contract: any) =>
            contract.created_by_id === user.id
          )
          setContracts(filtered)
        }
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        message.success('ចាកចេញបានជោគជ័យ')
        router.push('/login')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការចាកចេញ')
    }
  }

  const handleNavigateToContract = (contractId: number) => {
    router.push(`/contract/${contractId}`)
  }

  const handleNavigateToList = () => {
    router.push('/contracts')
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="font-hanuman">
          <div className="font-semibold">{user?.full_name}</div>
          <div className="text-sm text-gray-500">{user?.phone_number}</div>
          <div className="text-sm text-blue-600">{getRoleLabel(user?.role as UserRole)}</div>
          {user?.organization && (
            <div className="text-sm text-gray-500">{user.organization}</div>
          )}
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    ...(hasPermission(user?.role as UserRole, 'contracts.read') ? [{
      key: 'me-dashboard',
      label: 'ផ្ទាំងគ្រប់គ្រង M&E',
      icon: <DashboardOutlined />,
      onClick: () => router.push('/me-dashboard'),
    }] : []),
    ...(hasPermission(user?.role as UserRole, 'users.read') ? [{
      key: 'manage-users',
      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
      icon: <TeamOutlined />,
      onClick: () => router.push('/admin/users'),
    }] : []),
    {
      key: 'logout',
      label: 'ចាកចេញ',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  // Dashboard statistics
  const getStatistics = () => {
    const total = contracts.length
    const signed = contracts.filter((c: any) => c.party_a_signature && c.party_b_signature).length
    const pending = contracts.filter((c: any) => !c.party_a_signature || !c.party_b_signature).length
    const draft = contracts.filter((c: any) => c.status === 'draft').length

    return { total, signed, pending, draft }
  }

  const stats = getStatistics()

  // Contract status tag
  const getStatusTag = (contract: any) => {
    if (contract.party_a_signature && contract.party_b_signature) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>បានចុះហត្ថលេខា</Tag>
    } else if (contract.party_a_signature || contract.party_b_signature) {
      return <Tag color="warning" icon={<ClockCircleOutlined />}>រង់ចាំចុះហត្ថលេខា</Tag>
    } else {
      return <Tag color="default">ពង្រាង</Tag>
    }
  }

  // Table columns for dashboard
  const columns = [
    {
      title: 'លេខកិច្ចព្រមព្រៀង',
      dataIndex: 'contract_number',
      key: 'contract_number',
      render: (text: string, record: any) => (
        <a onClick={() => router.push(`/contract/edit/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: 'ប្រភេទ',
      dataIndex: 'contract_type_id',
      key: 'contract_type_id',
      render: (id: number) => {
        const detail = CONTRACT_DETAILS.find(d => d.id === id)
        return detail?.title || `ប្រភេទ ${id}`
      },
    },
    {
      title: 'ភាគី ក',
      dataIndex: 'party_a_name',
      key: 'party_a_name',
    },
    {
      title: 'ភាគី ខ',
      dataIndex: 'party_b_name',
      key: 'party_b_name',
    },
    {
      title: 'ស្ថានភាព',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record),
    },
    {
      title: 'សកម្មភាព',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/contract/edit/${record.id}`)}
          >
            មើល/កែសម្រួល
          </Button>
        </Space>
      ),
    },
  ]

  // Browse Contracts Component
  const BrowseContracts = () => {
    // Filter contracts based on user's contract type if they're a PARTNER
    let contractsToShow = CONTRACT_DETAILS

    if (user?.role === UserRole.PARTNER && user?.contract_type) {
      // Partners only see their assigned contract type
      contractsToShow = CONTRACT_DETAILS.filter(detail => detail.id === user.contract_type)
    } else if (user?.contract_type && user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.ADMIN) {
      // Other users see their primary contract type first, then others
      const primaryContract = CONTRACT_DETAILS.find(d => d.id === user.contract_type)
      const otherContracts = CONTRACT_DETAILS.filter(d => d.id !== user.contract_type)
      contractsToShow = primaryContract ? [primaryContract, ...otherContracts] : CONTRACT_DETAILS
    }

    return (
    <>
      <div className="text-center mb-12">
        <Title level={1} className="text-blue-800 font-hanuman mb-4">
          ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
        </Title>
        <Paragraph className="text-xl text-gray-700 max-w-3xl mx-auto">
          សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសម្រាប់គម្រោង PLP។
          {user?.role === UserRole.PARTNER && user?.contract_type && (
            <div className="mt-2 text-amber-600">
              អ្នកអាចបង្កើតតែកិច្ចព្រមព្រៀង {CONTRACT_DETAILS.find(d => d.id === user.contract_type)?.title} ប៉ុណ្ណោះ
            </div>
          )}
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {contractsToShow.map((detail) => (
          <Col xs={24} md={12} lg={8} key={detail.id}>
            <Card
              hoverable
              className="h-full shadow-lg hover:shadow-xl transition-all duration-300 khmer-border"
              style={{ borderTop: `4px solid ${detail.color}` }}
            >
              <Space direction="vertical" className="w-full" size="large">
                <div className="text-center" style={{ color: detail.color }}>
                  {detail.icon}
                </div>

                <div className="text-center">
                  <Badge count={detail.id} style={{ backgroundColor: detail.color }}>
                    <Title level={4} className="font-hanuman mb-2">
                      {detail.title}
                    </Title>
                  </Badge>
                  <Text className="text-gray-600 font-hanuman">
                    {detail.subtitle}
                  </Text>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <Paragraph className="font-hanuman text-sm mb-3">
                    {detail.description}
                  </Paragraph>

                  <div className="space-y-2">
                    <div>
                      <Text strong className="font-hanuman">ភាគី:</Text>
                      <ul className="mt-1 text-sm">
                        {detail.parties.map((party, idx) => (
                          <li key={idx} className="lotus-decoration">{party}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Text strong className="font-hanuman">គោលបំណង:</Text>
                      <Paragraph className="text-sm mt-1">{detail.purpose}</Paragraph>
                    </div>

                    <div>
                      <Text strong className="font-hanuman">រយៈពេល:</Text>
                      <Text className="text-sm ml-2">{detail.duration}</Text>
                    </div>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<FileAddOutlined />}
                  size="large"
                  className="w-full btn-khmer-primary"
                  onClick={() => router.push(`/contract/${detail.id}`)}
                >
                  បង្កើតកិច្ចព្រមព្រៀង
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="mt-16">
        <Card className="khmer-header text-white">
          <Title level={3} className="text-white font-hanuman mb-4">
            អំពីប្រព័ន្ធកិច្ចព្រមព្រៀង PLP
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="text-center">
                <FileDoneOutlined className="text-5xl mb-3" style={{ color: '#FFD700' }} />
                <Title level={4} className="text-white font-hanuman">ងាយស្រួលប្រើប្រាស់</Title>
                <Text className="text-gray-200">
                  ទម្រង់សាមញ្ញ និងច្បាស់លាស់សម្រាប់បង្កើតកិច្ចព្រមព្រៀង
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center">
                <CheckCircleOutlined className="text-5xl mb-3" style={{ color: '#FFD700' }} />
                <Title level={4} className="text-white font-hanuman">តាមដានងាយស្រួល</Title>
                <Text className="text-gray-200">
                  តាមដានស្ថានភាពកិច្ចព្រមព្រៀងនិងការចុះហត្ថលេខា
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center">
                <TeamOutlined className="text-5xl mb-3" style={{ color: '#FFD700' }} />
                <Title level={4} className="text-white font-hanuman">គ្រប់គ្រងតួនាទី</Title>
                <Text className="text-gray-200">
                  ប្រព័ន្ធអនុញ្ញាតតាមតួនាទីសម្រាប់សុវត្ថិភាព
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  )
  }

  // Dashboard Component
  const Dashboard = () => (
    <>
      <div className="mb-8">
        <Title level={2} className="font-hanuman">
          <DashboardOutlined /> ផ្ទាំងគ្រប់គ្រងកិច្ចព្រមព្រៀង
        </Title>
        {user?.role === UserRole.PARTNER && (
          <Text className="text-gray-600 font-hanuman">
            អ្នកអាចមើលតែកិច្ចព្រមព្រៀងដែលបានចុះហត្ថលេខារបស់អ្នកប៉ុណ្ណោះ
          </Text>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="កិច្ចព្រមព្រៀងសរុប"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="បានចុះហត្ថលេខា"
              value={stats.signed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="រង់ចាំចុះហត្ថលេខា"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="ពង្រាង"
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Contracts Table */}
      <Card>
        <Title level={4} className="font-hanuman mb-4">
          បញ្ជីកិច្ចព្រមព្រៀងរបស់អ្នក
        </Title>
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" tip="កំពុងដំណើរការ..." />
          </div>
        ) : contracts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} នៃ ${total} កិច្ចព្រមព្រៀង`,
              }}
              className="font-hanuman"
              scroll={{ x: 800 }}
            />
          </div>
        ) : (
          <Empty
            description={
              <span className="font-hanuman">
                មិនមានកិច្ចព្រមព្រៀង
              </span>
            }
          >
            <Button
              type="primary"
              onClick={() => setActiveTab('browse')}
              className="font-hanuman"
            >
              បង្កើតកិច្ចព្រមព្រៀងថ្មី
            </Button>
          </Empty>
        )}
      </Card>

      {/* Quick Actions for Admin */}
      {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
        <Card className="mt-8 bg-blue-50">
          <Title level={4} className="font-hanuman mb-4">
            សកម្មភាពរហ័ស
          </Title>
          <Space size="large" wrap>
            <Button
              type="primary"
              icon={<FolderOpenOutlined />}
              size="large"
              onClick={() => router.push('/contracts')}
              className="font-hanuman"
            >
              មើលកិច្ចព្រមព្រៀងទាំងអស់
            </Button>
            {user?.role === UserRole.SUPER_ADMIN && (
              <Button
                icon={<TeamOutlined />}
                size="large"
                onClick={() => router.push('/admin/users')}
                className="font-hanuman"
              >
                គ្រប់គ្រងអ្នកប្រើប្រាស់
              </Button>
            )}
          </Space>
        </Card>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with user info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Title level={3} className="mb-0 text-blue-800 font-hanuman text-base md:text-xl">
            PLP Contract System
          </Title>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" className="flex items-center space-x-2">
                <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                <span className="font-hanuman hidden sm:inline">{user.full_name}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Main content with tabs */}
        {user ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            className="font-hanuman"
            tabBarStyle={{ marginBottom: 32 }}
          >
            <TabPane
              tab={
                <span>
                  <FormOutlined />
                  ប្រភេទកិច្ចព្រមព្រៀង
                </span>
              }
              key="browse"
            >
              <BrowseContracts />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <DashboardOutlined />
                  ផ្ទាំងគ្រប់គ្រង
                  {contracts.length > 0 && <Badge count={contracts.length} offset={[10, 0]} />}
                </span>
              }
              key="dashboard"
            >
              <Dashboard />
            </TabPane>
          </Tabs>
        ) : (
          <BrowseContracts />
        )}
      </div>
    </div>
  )
}