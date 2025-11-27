'use client'

import { useState, useEffect } from 'react'
import { Card, Layout, Menu, Typography, Dropdown, Avatar, Row, Col, Empty, Spin, Button, Table, Tag, message, Select, Space, Popconfirm } from 'antd'
import { ArrowLeftOutlined, DashboardOutlined, FundProjectionScreenOutlined, ProjectOutlined, CalendarOutlined, FileTextOutlined, SettingOutlined, UserOutlined, LogoutOutlined, KeyOutlined, TeamOutlined, BellOutlined, FormOutlined, EditOutlined, EyeOutlined, DownloadOutlined, FilterOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'
import { useContent } from '@/lib/hooks/useContent'

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography

export default function ContractsPage() {
  const router = useRouter()
  const { t, loading: contentLoading } = useContent()
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [deleting, setDeleting] = useState(false)

  // Filter state
  const [contractType, setContractType] = useState<string | undefined>(undefined)
  const [province, setProvince] = useState<string | undefined>(undefined)
  const [district, setDistrict] = useState<string | undefined>(undefined)
  const [commune, setCommune] = useState<string | undefined>(undefined)
  const [school, setSchool] = useState<string | undefined>(undefined)

  // Filter options
  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [communes, setCommunes] = useState<string[]>([])
  const [schools, setSchools] = useState<string[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalContracts, setTotalContracts] = useState(0)

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)) {
      fetchContracts()
      fetchFilterOptions()
    } else {
      setLoading(false)
    }
  }, [user])

  // Refetch when filters or pagination change
  useEffect(() => {
    if (user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)) {
      fetchContracts()
    }
  }, [currentPage, pageSize, contractType, province, district, commune, school])

  // Load cascading filter options when parent filter changes
  useEffect(() => {
    if (province || district || commune) {
      fetchFilterOptions()
    }
  }, [province, district, commune])

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
    }
  }

  const fetchContracts = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('pageSize', pageSize.toString())

      if (contractType) params.append('contractType', contractType)
      if (province) params.append('province', province)
      if (district) params.append('district', district)
      if (commune) params.append('commune', commune)
      if (school) params.append('school', school)

      const response = await fetch(`/api/contracts/all?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setContracts(data.contracts || [])
        setTotalContracts(data.pagination?.total || 0)
      } else {
        message.error('មានបញ្ហាក្នុងការទាញកិច្ចសន្យា')
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
      message.error('មានបញ្ហាក្នុងការទាញកិច្ចសន្យា')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      // Build query for cascading filters
      const params = new URLSearchParams()
      if (province) params.append('province', province)
      if (district) params.append('district', district)
      if (commune) params.append('commune', commune)

      const response = await fetch(`/api/contracts/filter-options?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProvinces(data.provinces || [])
        setDistricts(data.districts || [])
        setCommunes(data.communes || [])
        setSchools(data.schools || [])
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error)
    }
  }

  const handleResetFilters = () => {
    setContractType(undefined)
    setProvince(undefined)
    setDistrict(undefined)
    setCommune(undefined)
    setSchool(undefined)
    setCurrentPage(1)
  }

  const handleDelete = async (contractId: number) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        message.success('កិច្ចសន្យាត្រូវបានលុបដោយជោគជ័យ')
        fetchContracts() // Refresh the list
      } else {
        const error = await response.json()
        message.error(error.error || 'មានបញ្ហាក្នុងការលុបកិច្ចសន្យា')
      }
    } catch (error) {
      console.error('Failed to delete contract:', error)
      message.error('មានបញ្ហាក្នុងការលុបកិច្ចសន្យា')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('សូមជ្រើសរើសកិច្ចសន្យាយ៉ាងហោចណាស់មួយ')
      return
    }

    try {
      setDeleting(true)
      let successCount = 0
      let failCount = 0

      // Delete each selected contract
      for (const id of selectedRowKeys) {
        try {
          const response = await fetch(`/api/contracts/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          failCount++
        }
      }

      // Show results
      if (successCount > 0) {
        message.success(`លុបកិច្ចសន្យាបានជោគជ័យ ${successCount} ចំនួន`)
      }
      if (failCount > 0) {
        message.error(`មិនអាចលុបកិច្ចសន្យា ${failCount} ចំនួន`)
      }

      // Clear selection and refresh
      setSelectedRowKeys([])
      fetchContracts()
    } catch (error) {
      console.error('Bulk delete failed:', error)
      message.error('មានបញ្ហាក្នុងការលុបកិច្ចសន្យា')
    } finally {
      setDeleting(false)
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys)
    },
  }

  const handleProvinceChange = (value: string | undefined) => {
    setProvince(value)
    setDistrict(undefined)
    setCommune(undefined)
    setSchool(undefined)
    setCurrentPage(1)
  }

  const handleDistrictChange = (value: string | undefined) => {
    setDistrict(value)
    setCommune(undefined)
    setSchool(undefined)
    setCurrentPage(1)
  }

  const handleCommuneChange = (value: string | undefined) => {
    setCommune(value)
    setSchool(undefined)
    setCurrentPage(1)
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
    ];

    const adminItems: any[] = [];

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'COORDINATOR') {
      adminItems.push({
        type: 'divider',
      });
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
      });
    }

    return [...baseItems, ...adminItems];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'overview') {
      router.push('/dashboard');
    } else if (key === 'indicators') {
      router.push('/indicators');
    } else if (key === 'activities') {
      router.push('/activities');
    } else if (key === 'milestones') {
      router.push('/milestones');
    } else if (key === 'contracts') {
      router.push('/contracts');
    } else if (key === 'manage-users') {
      router.push('/admin/users');
    } else if (key === 'content-management') {
      router.push('/admin/content-management');
    } else if (key === 'deliverables-content') {
      router.push('/admin/deliverables-content');
    } else if (key === 'deliverables-management') {
      router.push('/admin/deliverables-management');
    } else if (key === 'reconfig-requests') {
      router.push('/admin/reconfiguration-requests');
    } else if (key === 'edit-agreement-4') {
      router.push('/admin/agreement/4');
    } else if (key === 'edit-agreement-5') {
      router.push('/admin/agreement/5');
    } else if (key === 'edit-configure-4') {
      router.push('/admin/configure-contract/4');
    } else if (key === 'edit-configure-5') {
      router.push('/admin/configure-contract/5');
    }
  };

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
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px'
        }}>
          {collapsed ? (
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>P</div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>PLP M&E</div>
          )}
        </div>
        <Menu
          theme="light"
          selectedKeys={['contracts']}
          mode="inline"
          items={getSidebarMenuItems()}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            fontSize: 14
          }}
        />
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
                កិច្ចសន្យារបស់ខ្ញុំ
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
                    ...(user?.contract_type === 4 || user?.contract_type === 5 ? [{
                      key: 'configure-deliverables',
                      icon: <SettingOutlined />,
                      label: <span className="font-hanuman">{t('dashboard_menu_configure')}</span>,
                      onClick: () => router.push('/contract/configure')
                    }] : []),
                    { type: 'divider' },
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'manage-users',
                      icon: <TeamOutlined />,
                      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
                      onClick: () => router.push('/admin/users')
                    }] : []),
                    ...(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user?.role) ? [{
                      key: 'content-management',
                      icon: <FileTextOutlined />,
                      label: 'គ្រប់គ្រងខ្លឹមសារ',
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
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'edit-agreement-4',
                      icon: <EditOutlined />,
                      label: 'កែកិច្ចព្រមព្រៀង ៤',
                      onClick: () => router.push('/admin/agreement/4')
                    }] : []),
                    ...(user?.role === 'SUPER_ADMIN' ? [{
                      key: 'edit-agreement-5',
                      icon: <EditOutlined />,
                      label: 'កែកិច្ចព្រមព្រៀង ៥',
                      onClick: () => router.push('/admin/agreement/5')
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
            {/* Filter Section */}
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
              <Card
                size="small"
                style={{ marginBottom: 16, background: '#fafafa' }}
                title={
                  <Space>
                    <FilterOutlined />
                    <span style={{ fontFamily: 'Hanuman' }}>ស្វែងរក</span>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8} lg={4}>
                    <div style={{ marginBottom: 4, fontFamily: 'Hanuman', fontSize: 13 }}>ប្រភេទ</div>
                    <Select
                      placeholder="ជ្រើសរើសប្រភេទ"
                      style={{ width: '100%' }}
                      value={contractType}
                      onChange={(value) => {
                        setContractType(value)
                        setCurrentPage(1)
                      }}
                      allowClear
                      options={[
                        { label: 'ប្រភេទ 1', value: '1' },
                        { label: 'ប្រភេទ 2', value: '2' },
                        { label: 'ប្រភេទ 3', value: '3' },
                        { label: 'ប្រភេទ 4', value: '4' },
                        { label: 'ប្រភេទ 5', value: '5' },
                      ]}
                    />
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={5}>
                    <div style={{ marginBottom: 4, fontFamily: 'Hanuman', fontSize: 13 }}>ខេត្ត</div>
                    <Select
                      placeholder="ជ្រើសរើសខេត្ត"
                      style={{ width: '100%' }}
                      value={province}
                      onChange={handleProvinceChange}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={provinces.map(p => ({ label: p, value: p }))}
                    />
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={5}>
                    <div style={{ marginBottom: 4, fontFamily: 'Hanuman', fontSize: 13 }}>ស្រុក/ខណ្ឌ</div>
                    <Select
                      placeholder="ជ្រើសរើសស្រុក/ខណ្ឌ"
                      style={{ width: '100%' }}
                      value={district}
                      onChange={handleDistrictChange}
                      allowClear
                      showSearch
                      disabled={!province}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={districts.map(d => ({ label: d, value: d }))}
                    />
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={5}>
                    <div style={{ marginBottom: 4, fontFamily: 'Hanuman', fontSize: 13 }}>ឃុំ/សង្កាត់</div>
                    <Select
                      placeholder="ជ្រើសរើសឃុំ/សង្កាត់"
                      style={{ width: '100%' }}
                      value={commune}
                      onChange={handleCommuneChange}
                      allowClear
                      showSearch
                      disabled={!district}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={communes.map(c => ({ label: c, value: c }))}
                    />
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={5}>
                    <div style={{ marginBottom: 4, fontFamily: 'Hanuman', fontSize: 13 }}>សាលារៀន</div>
                    <Select
                      placeholder="ជ្រើសរើសសាលារៀន"
                      style={{ width: '100%' }}
                      value={school}
                      onChange={(value) => {
                        setSchool(value)
                        setCurrentPage(1)
                      }}
                      allowClear
                      showSearch
                      disabled={!commune}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={schools.map(s => ({ label: s, value: s }))}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: 12 }}>
                  <Col>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleResetFilters}
                        style={{ fontFamily: 'Hanuman' }}
                      >
                        កំណត់ឡើងវិញ
                      </Button>
                      <Text type="secondary" style={{ fontFamily: 'Hanuman', fontSize: 13 }}>
                        ចំនួនសរុប: {totalContracts.toLocaleString()} កិច្ចសន្យា
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Bulk Actions Bar */}
            {user?.role === UserRole.SUPER_ADMIN && selectedRowKeys.length > 0 && (
              <Card
                size="small"
                style={{
                  marginBottom: 16,
                  background: '#e6f7ff',
                  borderColor: '#1890ff'
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text style={{ fontFamily: 'Hanuman' }}>
                      បានជ្រើសរើស <strong>{selectedRowKeys.length}</strong> កិច្ចសន្យា
                    </Text>
                  </Col>
                  <Col>
                    <Space>
                      <Button
                        size="small"
                        onClick={() => setSelectedRowKeys([])}
                        style={{ fontFamily: 'Hanuman' }}
                      >
                        បោះបង់
                      </Button>
                      <Popconfirm
                        title="លុបកិច្ចសន្យា"
                        description={
                          <div style={{ fontFamily: 'Hanuman' }}>
                            តើអ្នកប្រាកដជាចង់លុបកិច្ចសន្យាទាំង {selectedRowKeys.length} នេះមែនទេ?
                          </div>
                        }
                        onConfirm={handleBulkDelete}
                        okText="លុប"
                        cancelText="បោះបង់"
                        okButtonProps={{ danger: true, loading: deleting }}
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          loading={deleting}
                          style={{ fontFamily: 'Hanuman' }}
                        >
                          លុបទាំងអស់
                        </Button>
                      </Popconfirm>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" />
              </div>
            ) : user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN ? (
              <Table
                dataSource={contracts}
                rowKey="id"
                rowSelection={user?.role === UserRole.SUPER_ADMIN ? rowSelection : undefined}
                columns={[
                  {
                    title: 'លេខ',
                    dataIndex: 'id',
                    key: 'id',
                    width: 70,
                  },
                  {
                    title: 'លេខកិច្ចសន្យា',
                    dataIndex: 'contract_number',
                    key: 'contract_number',
                    width: 180,
                    render: (text: string) => <Text code style={{ fontFamily: 'Hanuman' }}>{text || 'N/A'}</Text>
                  },
                  {
                    title: 'ប្រភេទ',
                    dataIndex: 'contract_type_id',
                    key: 'contract_type_id',
                    width: 80,
                    render: (type: number) => (
                      <Tag color={type === 4 ? 'blue' : type === 5 ? 'green' : 'default'} style={{ fontFamily: 'Hanuman' }}>
                        ប្រភេទ {type}
                      </Tag>
                    )
                  },
                  {
                    title: 'បង្កើតដោយ',
                    dataIndex: 'created_by_user',
                    key: 'created_by',
                    width: 180,
                    render: (user: any) => (
                      <div>
                        <div style={{ fontFamily: 'Hanuman', fontWeight: 500 }}>{user?.full_name || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: '#8c8c8c', fontFamily: 'Hanuman' }}>
                          {user?.school_name && <div>{user.school_name}</div>}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'ខេត្ត',
                    dataIndex: ['created_by_user', 'province_name'],
                    key: 'province',
                    width: 120,
                    ellipsis: true,
                    render: (text: string) => <span style={{ fontFamily: 'Hanuman', fontSize: 12 }}>{text || '-'}</span>
                  },
                  {
                    title: 'ស្រុក/ខណ្ឌ',
                    dataIndex: ['created_by_user', 'district_name'],
                    key: 'district',
                    width: 120,
                    ellipsis: true,
                    render: (text: string) => <span style={{ fontFamily: 'Hanuman', fontSize: 12 }}>{text || '-'}</span>
                  },
                  {
                    title: 'ឃុំ/សង្កាត់',
                    dataIndex: ['created_by_user', 'commune_name'],
                    key: 'commune',
                    width: 120,
                    ellipsis: true,
                    render: (text: string) => <span style={{ fontFamily: 'Hanuman', fontSize: 12 }}>{text || '-'}</span>
                  },
                  {
                    title: 'ស្ថានភាព',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (status: string) => {
                      const statusColors: Record<string, string> = {
                        'draft': 'default',
                        'pending': 'processing',
                        'signed': 'success',
                        'rejected': 'error',
                        'completed': 'success'
                      }
                      const statusLabels: Record<string, string> = {
                        'draft': 'សេចក្តីព្រាង',
                        'pending': 'រងចាំ',
                        'signed': 'ចុះហត្ថលេខា',
                        'rejected': 'បដិសេធ',
                        'completed': 'បានបញ្ចប់'
                      }
                      return (
                        <Tag color={statusColors[status] || 'default'} style={{ fontFamily: 'Hanuman', fontSize: 11 }}>
                          {statusLabels[status] || status}
                        </Tag>
                      )
                    }
                  },
                  {
                    title: 'កាលបរិច្ឆេទ',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    width: 100,
                    render: (date: string) => (
                      <span style={{ fontFamily: 'Hanuman', fontSize: 11 }}>
                        {new Date(date).toLocaleDateString('km-KH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )
                  },
                  {
                    title: 'សកម្មភាព',
                    key: 'actions',
                    width: user?.role === UserRole.SUPER_ADMIN ? 180 : 120,
                    fixed: 'right' as const,
                    render: (_: any, record: any) => (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => router.push(`/contract/print/${record.id}`)}
                          style={{ fontFamily: 'Hanuman', padding: '0 4px' }}
                        >
                          មើល
                        </Button>
                        {record.contract_html && (
                          <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(`/contract/print/${record.id}`, '_blank')}
                            style={{ fontFamily: 'Hanuman', padding: '0 4px' }}
                          >
                            បោះពុម្ព
                          </Button>
                        )}
                        {user?.role === UserRole.SUPER_ADMIN && (
                          <Popconfirm
                            title="លុបកិច្ចសន្យា"
                            description={
                              <div style={{ fontFamily: 'Hanuman' }}>
                                តើអ្នកប្រាកដជាចង់លុបកិច្ចសន្យានេះមែនទេ?<br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  លេខ: {record.contract_number || record.id}
                                </Text>
                              </div>
                            }
                            onConfirm={() => handleDelete(record.id)}
                            okText="លុប"
                            cancelText="បោះបង់"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="link"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              style={{ fontFamily: 'Hanuman', padding: '0 4px' }}
                            >
                              លុប
                            </Button>
                          </Popconfirm>
                        )}
                      </div>
                    )
                  }
                ]}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalContracts,
                  showTotal: (total) => (
                    <span style={{ fontFamily: 'Hanuman' }}>
                      ចំនួនសរុប: {total.toLocaleString()} កិច្ចសន្យា
                    </span>
                  ),
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  onChange: (page, size) => {
                    setCurrentPage(page)
                    setPageSize(size)
                  }
                }}
                scroll={{ x: 1400 }}
              />
            ) : (
              <Empty description="ទំព័រនេះកំពុងរៀបចំ" />
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
