'use client'

import { useState, useEffect, use } from 'react'
import { Card, Button, Typography, Divider, Spin, Alert, Tag, Space, Descriptions } from 'antd'
import { FileTextOutlined, DownloadOutlined, PrinterOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { contractTemplates } from '@/lib/contractTemplates'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

export default function ViewContractPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        setUser(userData)

        // Load contract based on type parameter
        const contractType = parseInt(resolvedParams.type)
        const userContract = contractTemplates.find(c => c.id === contractType)

        if (userContract) {
          setContract(userContract)
        } else {
          router.push('/me-dashboard')
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

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          message="មិនមានកិច្ចសន្យា"
          description="មិនអាចរកឃើញកិច្ចសន្យា"
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <Title level={2} className="font-hanuman text-blue-800 mb-2">
                <FileTextOutlined className="mr-2" />
                កិច្ចព្រមព្រៀងរបស់ខ្ញុំ
              </Title>
              <Space>
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  បានចុះហត្ថលេខា
                </Tag>
                {user?.contract_signed_date && (
                  <Text type="secondary" className="font-hanuman">
                    ថ្ងៃទី {dayjs(user.contract_signed_date).format('DD/MM/YYYY')}
                  </Text>
                )}
              </Space>
            </div>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/me-dashboard')}
              >
                ត្រឡប់ក្រោយ
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                បោះពុម្ព
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                ទាញយក PDF
              </Button>
            </Space>
          </div>
        </Card>

        {/* Contract Information */}
        <Card className="mb-4 shadow-md">
          <Descriptions
            title="ព័ត៌មានកិច្ចសន្យា"
            bordered
            column={2}
            className="font-hanuman"
          >
            <Descriptions.Item label="ប្រភេទកិច្ចសន្យា">
              {contract.title}
            </Descriptions.Item>
            <Descriptions.Item label="លេខកិច្ចសន្យា">
              PLP-{String(contract.id).padStart(3, '0')}-2025
            </Descriptions.Item>
            <Descriptions.Item label="ភាគី ក">
              {contract.partyA}
            </Descriptions.Item>
            <Descriptions.Item label="ភាគី ខ">
              {contract.partyB}
            </Descriptions.Item>
            <Descriptions.Item label="អ្នកចុះហត្ថលេខា">
              {user?.full_name}
            </Descriptions.Item>
            <Descriptions.Item label="តួនាទី">
              {user?.position || user?.role}
            </Descriptions.Item>
            <Descriptions.Item label="ស្ថានភាព" span={2}>
              <Tag color="success">សកម្ម</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Contract Content */}
        <Card className="mb-4 shadow-md" id="contract-content">
          <div className="prose prose-sm max-w-none font-hanuman">
            <h3 className="text-center text-lg font-bold mb-4">{contract.title}</h3>

            <div className="mb-4">
              <strong>ភាគី ក:</strong> {contract.partyA}
            </div>
            <div className="mb-4">
              <strong>ភាគី ខ:</strong> {contract.partyB}
            </div>

            <Divider />

            <h4 className="font-bold">មុខងារនិងទំនួលខុសត្រូវ:</h4>
            <ul>
              {contract.responsibilities?.map((resp: string, idx: number) => (
                <li key={idx}>{resp}</li>
              ))}
            </ul>

            <h4 className="font-bold mt-4">លក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង:</h4>
            <div dangerouslySetInnerHTML={{ __html: contract.content }} />

            <Divider />

            {/* Signature Section */}
            {user?.signature_data && (
              <div className="mt-8">
                <h4 className="font-bold">ហត្ថលេខា:</h4>
                <div className="flex justify-around mt-4">
                  <div className="text-center">
                    <img
                      src={user.signature_data}
                      alt="Signature"
                      className="border p-2 mb-2"
                      style={{ maxWidth: '200px', height: '80px' }}
                    />
                    <Text className="font-hanuman">{user.full_name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {dayjs(user.contract_signed_date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-gray-500">
              <p>*** ចុងបញ្ចប់នៃកិច្ចសន្យា ***</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Card className="text-center bg-gray-50">
          <Text type="secondary" className="font-hanuman">
            កិច្ចសន្យានេះត្រូវបានចុះហត្ថលេខាតាមប្រព័ន្ធឌីជីថល
          </Text>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .ant-btn,
          .ant-card:first-child,
          .ant-card:last-child {
            display: none !important;
          }
          #contract-content {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}