'use client'

import { useState } from 'react'
import { Button, Card, Col, Row, Typography, Space, Modal } from 'antd'
import { FileAddOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons'
import { CONTRACT_TYPES } from '@/types/contract'
import ContractForm from '@/components/ContractForm'

const { Title, Text } = Typography

export default function HomePage() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState<number | null>(null)

  const handleCreateContract = (typeId: number) => {
    setSelectedType(typeId)
    setIsModalVisible(true)
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
    setSelectedType(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <Title level={1} className="text-blue-600">
            ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
          </Title>
          <Text className="text-lg text-gray-600">
            សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀងដែលអ្នកចង់បង្កើត
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {CONTRACT_TYPES.map((type) => (
            <Col xs={24} md={12} lg={8} key={type.id}>
              <Card
                hoverable
                className="h-full"
                actions={[
                  <Button
                    type="primary"
                    icon={<FileAddOutlined />}
                    onClick={() => handleCreateContract(type.id)}
                  >
                    បង្កើតកិច្ចព្រមព្រៀង
                  </Button>,
                ]}
              >
                <Space direction="vertical" className="w-full">
                  <FileTextOutlined className="text-4xl text-blue-500" />
                  <Title level={4} className="text-gray-800">
                    {type.type_name_khmer}
                  </Title>
                  {type.type_name_english && (
                    <Text className="text-gray-500 text-sm">
                      {type.type_name_english}
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
          ))}

          <Col xs={24} md={12} lg={8}>
            <Card hoverable className="h-full bg-gradient-to-br from-blue-50 to-indigo-50">
              <Space direction="vertical" className="w-full">
                <EditOutlined className="text-4xl text-indigo-500" />
                <Title level={4} className="text-gray-800">
                  កិច្ចព្រមព្រៀងដែលបានរក្សាទុក
                </Title>
                <Text className="text-gray-600">
                  មើលនិងកែសម្រួលកិច្ចព្រមព្រៀងដែលមានស្រាប់
                </Text>
                <Button type="link" href="/contracts">
                  ចូលទៅកាន់បញ្ជី →
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          selectedType
            ? CONTRACT_TYPES.find((t) => t.id === selectedType)?.type_name_khmer
            : ''
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {selectedType && (
          <ContractForm
            contractTypeId={selectedType}
            onSuccess={handleModalClose}
            onCancel={handleModalClose}
          />
        )}
      </Modal>
    </div>
  )
}