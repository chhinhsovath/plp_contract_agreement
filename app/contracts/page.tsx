'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Typography, Input, message, Modal } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'
import ContractPreview from '@/components/ContractPreview'
import { CONTRACT_TYPES } from '@/types/contract'

const { Title } = Typography
const { Search } = Input

export default function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [previewContract, setPreviewContract] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contracts')
      if (response.ok) {
        const data = await response.json()
        setContracts(data)
      } else {
        message.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការតភ្ជាប់')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (record: any) => {
    const contractType = CONTRACT_TYPES.find(t => t.id === record.contract_type_id)
    setPreviewContract({ ...record, contractType })
    setShowPreview(true)
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'បញ្ជាក់ការលុប',
      content: 'តើអ្នកពិតជាចង់លុបកិច្ចព្រមព្រៀងនេះមែនទេ?',
      okText: 'លុប',
      cancelText: 'បោះបង់',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/contracts/${id}`, {
            method: 'DELETE',
          })
          if (response.ok) {
            message.success('កិច្ចព្រមព្រៀងត្រូវបានលុប')
            fetchContracts()
          } else {
            message.error('មានបញ្ហាក្នុងការលុប')
          }
        } catch (error) {
          message.error('កំហុសក្នុងការលុប')
        }
      },
    })
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'default',
      pending_signature: 'warning',
      signed: 'success',
      completed: 'green',
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: any = {
      draft: 'ព្រាងទុក',
      pending_signature: 'រង់ចាំចុះហត្ថលេខា',
      signed: 'បានចុះហត្ថលេខា',
      completed: 'បានបញ្ចប់',
    }
    return texts[status] || status
  }

  const columns = [
    {
      title: 'លេខកិច្ចព្រមព្រៀង',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 150,
    },
    {
      title: 'ប្រភេទ',
      dataIndex: 'contract_type',
      key: 'contract_type',
      render: (type: any) => type?.type_name_khmer || 'N/A',
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
      title: 'ថ្ងៃចាប់ផ្តើម',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => new Date(date).toLocaleDateString('km-KH'),
    },
    {
      title: 'ថ្ងៃបញ្ចប់',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => new Date(date).toLocaleDateString('km-KH'),
    },
    {
      title: 'ស្ថានភាព',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'សកម្មភាព',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Link href={`/contract/edit/${record.id}`}>
            <Button
              type="text"
              icon={<EditOutlined />}
            />
          </Link>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]

  const filteredContracts = contracts.filter((contract: any) =>
    contract.contract_number.toLowerCase().includes(searchText.toLowerCase()) ||
    contract.party_a_name.toLowerCase().includes(searchText.toLowerCase()) ||
    contract.party_b_name.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Title level={2}>បញ្ជីកិច្ចព្រមព្រៀង</Title>
          <Link href="/">
            <Button icon={<HomeOutlined />}>
              ត្រឡប់ទៅទំព័រដើម
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <Search
            placeholder="ស្វែងរកតាមលេខកិច្ចព្រមព្រៀង ឬឈ្មោះភាគី"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredContracts}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} នៃ ${total} កិច្ចព្រមព្រៀង`,
          }}
        />
      </div>

      <Modal
        title="មើលកិច្ចព្រមព្រៀង"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={null}
        width={900}
      >
        {previewContract && (
          <ContractPreview
            contract={previewContract}
            contractType={previewContract.contractType}
          />
        )}
      </Modal>
    </div>
  )
}