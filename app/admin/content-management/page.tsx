'use client'

import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Table, Button, Input, Select, Space, Modal, Form, message, Spin, Tag, Typography, Alert, Popconfirm, Dropdown, Avatar, Row, Col } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, SearchOutlined, ReloadOutlined, DashboardOutlined, FundProjectionScreenOutlined, UserOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography
const { TextArea } = Input

interface ContentText {
  id: number
  key: string
  text_khmer: string
  text_english: string | null
  category: string
  description: string | null
  created_at: string
  updated_at: string
}

export default function ContentManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [texts, setTexts] = useState<ContentText[]>([])
  const [filteredTexts, setFilteredTexts] = useState<ContentText[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingText, setEditingText] = useState<ContentText | null>(null)
  const [processing, setProcessing] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const [form] = Form.useForm()
  const [createForm] = Form.useForm()

  useEffect(() => {
    checkAuth()
    fetchTexts()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    filterTexts()
  }, [texts, selectedCategory, searchText])

  const fetchTexts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content-texts')
      if (response.ok) {
        const data = await response.json()
        setTexts(data.texts)
        setCategories(data.categories)
      } else if (response.status === 403) {
        message.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ')
        router.push('/dashboard')
      } else {
        message.error('មិនអាចទាញយកទិន្នន័យបាន')
      }
    } catch (error) {
      console.error('Failed to fetch texts:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  const filterTexts = () => {
    let filtered = texts

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(t =>
        t.key.toLowerCase().includes(search) ||
        t.text_khmer.includes(searchText) ||
        t.text_english?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      )
    }

    setFilteredTexts(filtered)
  }

  const handleEdit = (text: ContentText) => {
    setEditingText(text)
    form.setFieldsValue({
      text_khmer: text.text_khmer,
      text_english: text.text_english,
      category: text.category,
      description: text.description
    })
    setShowEditModal(true)
  }

  const handleCreate = () => {
    createForm.resetFields()
    setShowCreateModal(true)
  }

  const handleUpdate = async (values: any) => {
    if (!editingText) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/content-texts/${encodeURIComponent(editingText.key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success('បានកែប្រែខ្លឹមសារដោយជោគជ័យ')
        setShowEditModal(false)
        setEditingText(null)
        form.resetFields()
        fetchTexts()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការកែប្រែ')
      }
    } catch (error) {
      console.error('Update error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateSubmit = async (values: any) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/content-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success('បានបង្កើតខ្លឹមសារថ្មីដោយជោគជ័យ')
        setShowCreateModal(false)
        createForm.resetFields()
        fetchTexts()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការបង្កើត')
      }
    } catch (error) {
      console.error('Create error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (key: string) => {
    try {
      const response = await fetch(`/api/content-texts/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        message.success('បានលុបខ្លឹមសារដោយជោគជ័យ')
        fetchTexts()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការលុប')
      }
    } catch (error) {
      console.error('Delete error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      message.error('មានបញ្ហាក្នុងការចាកចេញ')
    }
  }

  const getSidebarMenuItems = () => {
    const items: MenuProps['items'] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'ទំព័រដើម',
      },
      {
        key: 'contracts',
        icon: <FileTextOutlined />,
        label: 'កិច្ចសន្យា',
      },
    ]

    if (user?.role === UserRole.SUPER_ADMIN) {
      items.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'គ្រប់គ្រងប្រព័ន្ធ',
        children: [
          {
            key: 'users',
            icon: <TeamOutlined />,
            label: 'អ្នកប្រើប្រាស់',
          },
          {
            key: 'content-management',
            icon: <FileTextOutlined />,
            label: 'ខ្លឹមសារអត្ថបទ',
          },
          {
            key: 'deliverables-content',
            icon: <FundProjectionScreenOutlined />,
            label: 'ខ្លឹមសារការងារ',
          },
        ],
      })
    }

    return items
  }

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'contracts':
        router.push('/contracts')
        break
      case 'users':
        router.push('/admin/users')
        break
      case 'content-management':
        router.push('/admin/content-management')
        break
      case 'deliverables-content':
        router.push('/admin/deliverables-content')
        break
      default:
        break
    }
  }

  const getCategoryTag = (category: string) => {
    const colors: Record<string, string> = {
      'contract_sign': 'blue',
      'contract_configure': 'green',
      'contract_submit': 'purple',
      'signature': 'orange',
      'reconfiguration': 'red',
      'common': 'default'
    }
    return <Tag color={colors[category] || 'default'}>{category}</Tag>
  }

  const columns = [
    {
      title: 'ពាក្យកូដ (Key)',
      dataIndex: 'key',
      key: 'key',
      width: 300,
      render: (key: string) => <Text code copyable>{key}</Text>
    },
    {
      title: 'អត្ថបទខ្មែរ',
      dataIndex: 'text_khmer',
      key: 'text_khmer',
      render: (text: string) => (
        <div style={{ maxWidth: 300, wordWrap: 'break-word' }}>
          <Text className="font-hanuman">{text}</Text>
        </div>
      )
    },
    {
      title: 'អត្ថបទអង់គ្លេស',
      dataIndex: 'text_english',
      key: 'text_english',
      render: (text: string | null) => (
        <div style={{ maxWidth: 300, wordWrap: 'break-word' }}>
          <Text type="secondary">{text || '-'}</Text>
        </div>
      )
    },
    {
      title: 'ប្រភេទ',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => getCategoryTag(category)
    },
    {
      title: 'សកម្មភាព',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ContentText) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            កែប្រែ
          </Button>
          <Popconfirm
            title="តើអ្នកពិតជាចង់លុបខ្លឹមសារនេះ?"
            onConfirm={() => handleDelete(record.key)}
            okText="យល់ព្រម"
            cancelText="បោះបង់"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              លុប
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'ប្រវត្តិរូប',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'ការកំណត់',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ចាកចេញ',
      danger: true,
    },
  ]

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout()
    } else if (key === 'profile') {
      router.push('/me-dashboard')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Hanuman',
          }}
        >
          {collapsed ? 'PLP' : 'PLP គ្រប់គ្រង'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={['content-management']}
          mode="inline"
          items={getSidebarMenuItems()}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Row justify="space-between" style={{ width: '100%' }}>
            <Col>
              <Button
                type="text"
                onClick={() => router.push('/dashboard')}
                style={{ fontFamily: 'Hanuman' }}
              >
                ត្រឡប់ទៅ Dashboard
              </Button>
            </Col>
            <Col>
              <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <Text style={{ fontFamily: 'Hanuman' }}>{user?.full_name || 'អ្នកប្រើប្រាស់'}</Text>
                </Space>
              </Dropdown>
            </Col>
          </Row>
        </Header>

        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          <Card style={{ marginBottom: 24 }}>
            <Title level={2}>
              <FileTextOutlined style={{ marginRight: 12 }} />
              គ្រប់គ្រងខ្លឹមសារអត្ថបទ (Content Management)
            </Title>
            <Text type="secondary">
              គ្រប់គ្រងអត្ថបទទាំងអស់នៅក្នុងប្រព័ន្ធ - សរុប {texts.length} ខ្លឹមសារ
            </Text>
          </Card>

      <Alert
        message="ការណែនាំ"
        description="ប្រើទំព័រនេះដើម្បីកែប្រែអត្ថបទខ្មែរ និងអង្គ្លេសទាំងអស់ដែលបង្ហាញនៅក្នុងប្រព័ន្ធ។ ការផ្លាស់ប្តូរនឹងត្រូវបានអនុវត្តភ្លាមៗនៅលើគេហទំព័រ។"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Filters and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <Space wrap>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 200 }}
                options={[
                  { label: 'ប្រភេទទាំងអស់', value: 'all' },
                  ...categories.map(cat => ({ label: cat, value: cat }))
                ]}
              />
              <Input
                placeholder="ស្វែងរកតាមពាក្យ ឬអត្ថបទ..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchTexts}
              >
                ផ្ទុកឡើងវិញ
              </Button>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              បង្កើតខ្លឹមសារថ្មី
            </Button>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredTexts}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `សរុប ${total} ខ្លឹមសារ`,
              onShowSizeChange: (current, size) => setPageSize(size)
            }}
          />
        </Space>
      </Card>

      {/* Edit Modal */}
      <Modal
        title={<span className="font-hanuman">កែប្រែខ្លឹមសារ</span>}
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false)
          setEditingText(null)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        {editingText && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
          >
            <Alert
              message={<Text code copyable>{editingText.key}</Text>}
              description={editingText.description}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="text_khmer"
              label="អត្ថបទខ្មែរ"
              rules={[{ required: true, message: 'សូមបញ្ចូលអត្ថបទខ្មែរ' }]}
            >
              <TextArea rows={3} className="font-hanuman" />
            </Form.Item>

            <Form.Item
              name="text_english"
              label="អត្ថបទអង់គ្លេស (ស្រេចចិត្ត)"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="category"
              label="ប្រភេទ"
              rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទ' }]}
            >
              <Select options={categories.map(cat => ({ label: cat, value: cat }))} />
            </Form.Item>

            <Form.Item
              name="description"
              label="ការពិពណ៌នា (ស្រេចចិត្ត)"
            >
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => {
                  setShowEditModal(false)
                  setEditingText(null)
                  form.resetFields()
                }}>
                  បោះបង់
                </Button>
                <Button type="primary" htmlType="submit" loading={processing}>
                  រក្សាទុក
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title={<span className="font-hanuman">បង្កើតខ្លឹមសារថ្មី</span>}
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false)
          createForm.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="key"
            label="ពាក្យកូដ (Key)"
            rules={[
              { required: true, message: 'សូមបញ្ចូលពាក្យកូដ' },
              { pattern: /^[a-z0-9_]+$/, message: 'ប្រើតែអក្សរតូច លេខ និង underscore' }
            ]}
          >
            <Input placeholder="contract_page_title" />
          </Form.Item>

          <Form.Item
            name="text_khmer"
            label="អត្ថបទខ្មែរ"
            rules={[{ required: true, message: 'សូមបញ្ចូលអត្ថបទខ្មែរ' }]}
          >
            <TextArea rows={3} className="font-hanuman" />
          </Form.Item>

          <Form.Item
            name="text_english"
            label="អត្ថបទអង់គ្លេស (ស្រេចចិត្ត)"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="category"
            label="ប្រភេទ"
            rules={[{ required: true, message: 'សូមជ្រើសរើសប្រភេទ' }]}
          >
            <Select
              showSearch
              options={[
                ...categories.map(cat => ({ label: cat, value: cat })),
                { label: '+ បង្កើតប្រភេទថ្មី', value: '__new__', disabled: true }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="ការពិពណ៌នា (ស្រេចចិត្ត)"
          >
            <TextArea rows={2} placeholder="ពិពណ៌នាអំពីការប្រើប្រាស់ខ្លឹមសារនេះ" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setShowCreateModal(false)
                createForm.resetFields()
              }}>
                បោះបង់
              </Button>
              <Button type="primary" htmlType="submit" loading={processing}>
                បង្កើត
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}
