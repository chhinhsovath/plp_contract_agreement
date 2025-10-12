'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, Typography, Space, Dropdown, Avatar, message, Tabs, Badge, Statistic, Tag, Table, Empty, Spin } from 'antd'
import { FileTextOutlined, EditOutlined, FileAddOutlined, FolderOpenOutlined, UserOutlined, LogoutOutlined, TeamOutlined, DashboardOutlined, CheckCircleOutlined, ClockCircleOutlined, FileDoneOutlined, FormOutlined, BankOutlined, SolutionOutlined, BookOutlined, HomeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { getAvailableContractIds, getContractTemplate } from '@/lib/contract-templates'
import { UserRole, getRoleLabel, hasPermission } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography

// Contract type detailed descriptions
const CONTRACT_DETAILS = [
  {
    id: 1,
    icon: <BankOutlined style={{ fontSize: 48 }} />,
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
    icon: <SolutionOutlined style={{ fontSize: 48 }} />,
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
    icon: <TeamOutlined style={{ fontSize: 48 }} />,
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
    icon: <BookOutlined style={{ fontSize: 48 }} />,
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
    icon: <HomeOutlined style={{ fontSize: 48 }} />,
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

        // Auto-redirect PARTNER users (Contract 4 & 5)
        if (userData.role === UserRole.PARTNER && (userData.contract_type === 4 || userData.contract_type === 5)) {
          // If not signed, go to configuration
          if (!userData.contract_signed) {
            router.push('/contract/configure')
            return
          }
          // If already signed, go to ME Dashboard
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
        <div>
          <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
          <div style={{ fontSize: 14, color: '#8c8c8c' }}>{user?.phone_number}</div>
          <div style={{ fontSize: 14, color: '#1890ff' }}>{getRoleLabel(user?.role as UserRole)}</div>
          {user?.organization && (
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>{user.organization}</div>
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
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <Title level={1} style={{ color: '#0047AB', marginBottom: 16 }}>
          ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#595959', maxWidth: 800, margin: '0 auto' }}>
          សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសម្រាប់គម្រោង PLP។
          {user?.role === UserRole.PARTNER && user?.contract_type && (
            <div style={{ marginTop: 8, color: '#faad14' }}>
              អ្នកអាចបង្កើតតែកិច្ចព្រមព្រៀង {CONTRACT_DETAILS.find(d => d.id === user.contract_type)?.title} ប៉ុណ្ណោះ
            </div>
          )}
        </Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        {contractsToShow.map((detail) => (
          <Col xs={24} md={12} lg={8} key={detail.id}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderTop: `4px solid ${detail.color}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ textAlign: 'center', color: detail.color }}>
                  {detail.icon}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Badge count={detail.id} style={{ backgroundColor: detail.color }}>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {detail.title}
                    </Title>
                  </Badge>
                  <Text type="secondary">
                    {detail.subtitle}
                  </Text>
                </div>

                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                  <Paragraph style={{ fontSize: 14, marginBottom: 16 }}>
                    {detail.description}
                  </Paragraph>

                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong>ភាគី:</Text>
                      <ul style={{ marginTop: 4, fontSize: 14, paddingLeft: 20 }}>
                        {detail.parties.map((party, idx) => (
                          <li key={idx}>{party}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Text strong>គោលបំណង:</Text>
                      <Paragraph style={{ fontSize: 14, marginTop: 4, marginBottom: 0 }}>{detail.purpose}</Paragraph>
                    </div>

                    <div>
                      <Text strong>រយៈពេល:</Text>
                      <Text style={{ fontSize: 14, marginLeft: 8 }}>{detail.duration}</Text>
                    </div>
                  </Space>
                </div>

                <Button
                  type="primary"
                  icon={<FileAddOutlined />}
                  size="large"
                  block
                  onClick={() => router.push(`/contract/${detail.id}`)}
                >
                  បង្កើតកិច្ចព្រមព្រៀង
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 80 }}>
        <Card style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
          <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>
            អំពីប្រព័ន្ធកិច្ចព្រមព្រៀង PLP
          </Title>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <FileDoneOutlined style={{ fontSize: 72, color: '#FFD700', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#fff', fontSize: 18 }}>ងាយស្រួលប្រើប្រាស់</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>
                  ទម្រង់សាមញ្ញ និងច្បាស់លាស់សម្រាប់បង្កើតកិច្ចព្រមព្រៀង
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 72, color: '#FFD700', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#fff', fontSize: 18 }}>តាមដានងាយស្រួល</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>
                  តាមដានស្ថានភាពកិច្ចព្រមព្រៀងនិងការចុះហត្ថលេខា
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ fontSize: 72, color: '#FFD700', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#fff', fontSize: 18 }}>គ្រប់គ្រងតួនាទី</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>
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
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>
          <DashboardOutlined /> ផ្ទាំងគ្រប់គ្រងកិច្ចព្រមព្រៀង
        </Title>
        {user?.role === UserRole.PARTNER && (
          <Text type="secondary">
            អ្នកអាចមើលតែកិច្ចព្រមព្រៀងដែលបានចុះហត្ថលេខារបស់អ្នកប៉ុណ្ណោះ
          </Text>
        )}
      </div>

      {/* Statistics Cards - Optimized for Tablet/Desktop */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s' }}>
            <Statistic
              title={<span style={{ fontSize: 15 }}>កិច្ចព្រមព្រៀងសរុប</span>}
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s' }}>
            <Statistic
              title={<span style={{ fontSize: 15 }}>បានចុះហត្ថលេខា</span>}
              value={stats.signed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s' }}>
            <Statistic
              title={<span style={{ fontSize: 15 }}>រង់ចាំចុះហត្ថលេខា</span>}
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s' }}>
            <Statistic
              title={<span style={{ fontSize: 15 }}>ពង្រាង</span>}
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#8c8c8c', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Contracts Table */}
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          បញ្ជីកិច្ចព្រមព្រៀងរបស់អ្នក
        </Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Spin size="large" tip="កំពុងដំណើរការ..." />
          </div>
        ) : contracts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} នៃ ${total} កិច្ចព្រមព្រៀង`,
              }}
              scroll={{ x: 1000 }}
              size="middle"
            />
          </div>
        ) : (
          <Empty
            description={
              <span>
                មិនមានកិច្ចព្រមព្រៀង
              </span>
            }
          >
            <Button
              type="primary"
              onClick={() => setActiveTab('browse')}
            >
              បង្កើតកិច្ចព្រមព្រៀងថ្មី
            </Button>
          </Empty>
        )}
      </Card>

      {/* Quick Actions for Admin */}
      {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
        <Card style={{ marginTop: 32, background: '#e6f7ff' }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            សកម្មភាពរហ័ស
          </Title>
          <Space size="large" wrap>
            <Button
              type="primary"
              icon={<FolderOpenOutlined />}
              size="large"
              onClick={() => router.push('/contracts')}
            >
              មើលកិច្ចព្រមព្រៀងទាំងអស់
            </Button>
            {user?.role === UserRole.SUPER_ADMIN && (
              <Button
                icon={<TeamOutlined />}
                size="large"
                onClick={() => router.push('/admin/users')}
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
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header with user info */}
      <div style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#0047AB', fontSize: 24 }}>
            ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀង PLP
          </Title>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button type="text" size="large" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} size="large" />
                <span>{user.full_name}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px' }}>
        {/* Main content with tabs */}
        {user ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            style={{ marginBottom: 32 }}
          >
            <Tabs.TabPane
              tab={
                <span>
                  <FormOutlined />
                  ប្រភេទកិច្ចព្រមព្រៀង
                </span>
              }
              key="browse"
            >
              <BrowseContracts />
            </Tabs.TabPane>

            <Tabs.TabPane
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
            </Tabs.TabPane>
          </Tabs>
        ) : (
          <BrowseContracts />
        )}
      </div>
    </div>
  )
}
