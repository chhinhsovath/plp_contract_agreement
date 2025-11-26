'use client'

import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Input, message, Spin, Descriptions, Alert, Typography, Badge } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { AdminNav } from '@/components/admin/AdminNav'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface ReconfigRequest {
  id: number
  user_id: number
  contract_type: number
  request_reason: string
  current_selections: any
  requested_changes: string | null
  status: string
  reviewed_by_id: number | null
  reviewed_at: string | null
  reviewer_notes: string | null
  created_at: string
  updated_at: string
  user: {
    id: number
    full_name: string
    phone_number: string
    organization: string | null
    position: string | null
    contract_type: number | null
  }
  reviewed_by: {
    id: number
    full_name: string
  } | null
}

export default function ReconfigurationRequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<ReconfigRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ReconfigRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [reviewerNotes, setReviewerNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reconfiguration-requests?status=${filterStatus}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      } else if (response.status === 403) {
        message.error('អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ')
        router.push('/')
      } else {
        message.error('មិនអាចទាញយកទិន្នន័យបាន')
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (request: ReconfigRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const handleApprove = (request: ReconfigRequest) => {
    setSelectedRequest(request)
    setReviewerNotes('')
    setShowApproveModal(true)
  }

  const handleReject = (request: ReconfigRequest) => {
    setSelectedRequest(request)
    setReviewerNotes('')
    setShowRejectModal(true)
  }

  const confirmApprove = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/reconfiguration-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerNotes: reviewerNotes || 'Approved'
        })
      })

      if (response.ok) {
        message.success('បានអនុម័តសំណើដោយជោគជ័យ')
        setShowApproveModal(false)
        setSelectedRequest(null)
        setReviewerNotes('')
        fetchRequests()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការអនុម័ត')
      }
    } catch (error) {
      console.error('Approve error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setProcessing(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedRequest) return

    if (!reviewerNotes.trim()) {
      message.warning('សូមបញ្ចូលហេតុផលនៃការបដិសេធ')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/reconfiguration-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerNotes: reviewerNotes
        })
      })

      if (response.ok) {
        message.success('បានបដិសេធសំណើដោយជោគជ័យ')
        setShowRejectModal(false)
        setSelectedRequest(null)
        setReviewerNotes('')
        fetchRequests()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការបដិសេធ')
      }
    } catch (error) {
      console.error('Reject error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'gold', text: 'រង់ចាំ' },
      approved: { color: 'green', text: 'អនុម័ត' },
      rejected: { color: 'red', text: 'បដិសេធ' }
    }
    const config = statusConfig[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: 'លេខសំណើ',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => <Text strong>#{id}</Text>
    },
    {
      title: 'ឈ្មោះអ្នកស្នើសុំ',
      dataIndex: ['user', 'full_name'],
      key: 'user_name',
      render: (_: any, record: ReconfigRequest) => (
        <div>
          <Text strong>{record.user.full_name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user.phone_number}</Text>
        </div>
      )
    },
    {
      title: 'អង្គភាព',
      dataIndex: ['user', 'organization'],
      key: 'organization',
      render: (org: string | null) => org || '-'
    },
    {
      title: 'ប្រភេទកិច្ចសន្យា',
      dataIndex: 'contract_type',
      key: 'contract_type',
      width: 120,
      render: (type: number) => <Badge count={type} style={{ backgroundColor: '#1890ff' }} />
    },
    {
      title: 'ថ្ងៃស្នើសុំ',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('km-KH')
    },
    {
      title: 'ស្ថានភាព',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'សកម្មភាព',
      key: 'actions',
      width: 200,
      render: (_: any, record: ReconfigRequest) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            មើលលម្អិត
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                អនុម័ត
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                បដិសេធ
              </Button>
            </>
          )}
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

  return (
    <div style={{ padding: 24 }}>
      <AdminNav />

      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: 12 }} />
          សំណើផ្លាស់ប្តូរការជ្រើសរើសសមិទ្ធកម្ម
        </Title>
        <Text type="secondary">ពិនិត្យ និងគ្រប់គ្រងសំណើផ្លាស់ប្តូរការជ្រើសរើសពីអ្នកប្រើប្រាស់</Text>
      </Card>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type={filterStatus === 'pending' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('pending')}
          >
            រង់ចាំ ({requests.filter(r => r.status === 'pending').length})
          </Button>
          <Button
            type={filterStatus === 'approved' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('approved')}
          >
            អនុម័ត
          </Button>
          <Button
            type={filterStatus === 'rejected' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('rejected')}
          >
            បដិសេធ
          </Button>
          <Button
            type={filterStatus === 'all' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('all')}
          >
            ទាំងអស់
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `សរុប ${total} សំណើ`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<span className="font-hanuman">លម្អិតសំណើ</span>}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            បិទ
          </Button>
        ]}
      >
        {selectedRequest && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions title="ព័ត៌មានអ្នកស្នើសុំ" bordered column={2}>
              <Descriptions.Item label="ឈ្មោះ">{selectedRequest.user.full_name}</Descriptions.Item>
              <Descriptions.Item label="លេខទូរស័ព្ទ">{selectedRequest.user.phone_number}</Descriptions.Item>
              <Descriptions.Item label="អង្គភាព">{selectedRequest.user.organization || '-'}</Descriptions.Item>
              <Descriptions.Item label="មុខតំណែង">{selectedRequest.user.position || '-'}</Descriptions.Item>
              <Descriptions.Item label="ប្រភេទកិច្ចសន្យា">{selectedRequest.contract_type}</Descriptions.Item>
              <Descriptions.Item label="ស្ថានភាព">{getStatusTag(selectedRequest.status)}</Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>ហេតុផលនៃការស្នើសុំ:</Title>
              <Alert message={selectedRequest.request_reason} type="info" />
            </div>

            <div>
              <Title level={5}>ការជ្រើសរើសបច្ចុប្បន្ន:</Title>
              <Card>
                {Array.isArray(selectedRequest.current_selections) && selectedRequest.current_selections.map((sel: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <Text strong>{sel.deliverable_title_khmer}</Text>
                    <br />
                    <Text type="secondary">ជម្រើសទី {sel.option_number}: {sel.option_text_khmer}</Text>
                  </div>
                ))}
              </Card>
            </div>

            {selectedRequest.reviewed_at && (
              <div>
                <Title level={5}>លទ្ធផលពិនិត្យ:</Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="អ្នកពិនិត្យ">{selectedRequest.reviewed_by?.full_name}</Descriptions.Item>
                  <Descriptions.Item label="ថ្ងៃពិនិត្យ">{new Date(selectedRequest.reviewed_at).toLocaleDateString('km-KH')}</Descriptions.Item>
                  <Descriptions.Item label="កំណត់ចំណាំ">{selectedRequest.reviewer_notes || '-'}</Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title={<span className="font-hanuman">អនុម័តសំណើ</span>}
        open={showApproveModal}
        onCancel={() => setShowApproveModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowApproveModal(false)}>
            បោះបង់
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={processing}
            onClick={confirmApprove}
          >
            បញ្ជាក់ការអនុម័ត
          </Button>
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            message="ការអនុម័តសំណើនេះនឹងអនុញ្ញាតឱ្យអ្នកប្រើប្រាស់អាចកំណត់រចនាសម្ព័ន្ធសមិទ្ធកម្មឡើងវិញ"
            type="warning"
            showIcon
          />

          {selectedRequest && (
            <div>
              <Text strong>អ្នកស្នើសុំ: </Text>
              <Text>{selectedRequest.user.full_name}</Text>
            </div>
          )}

          <div>
            <Text strong>កំណត់ចំណាំ (ស្រេចចិត្ត):</Text>
            <TextArea
              rows={3}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="បញ្ចូលកំណត់ចំណាំរបស់អ្នក..."
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={<span className="font-hanuman">បដិសេធសំណើ</span>}
        open={showRejectModal}
        onCancel={() => setShowRejectModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowRejectModal(false)}>
            បោះបង់
          </Button>,
          <Button
            key="reject"
            danger
            loading={processing}
            onClick={confirmReject}
          >
            បញ្ជាក់ការបដិសេធ
          </Button>
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            message="សូមបញ្ជាក់ហេតុផលច្បាស់លាស់នៃការបដិសេធ"
            type="error"
            showIcon
          />

          {selectedRequest && (
            <div>
              <Text strong>អ្នកស្នើសុំ: </Text>
              <Text>{selectedRequest.user.full_name}</Text>
            </div>
          )}

          <div>
            <Text strong>ហេតុផលនៃការបដិសេធ (ទាមទារ):</Text>
            <TextArea
              rows={4}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="សូមបញ្ជាក់ហេតុផលដែលអ្នកបដិសេធសំណើនេះ..."
              maxLength={500}
              showCount
              required
            />
          </div>
        </Space>
      </Modal>
    </div>
  )
}
