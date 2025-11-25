'use client'

import { useState, useEffect, use } from 'react'
import { Card, Button, Typography, Divider, Spin, Alert, Space, Tag, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, HomeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { contractTemplates } from '@/lib/contractTemplates'
import { useContent } from '@/lib/hooks/useContent'
import { EditableContent } from '@/components/EditableContent'
import { UserRole } from '@/lib/roles'

const { Title, Text } = Typography

export default function AdminAgreementPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { t, refresh } = useContent()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)

  const contractType = parseInt(resolvedParams.type)
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (user) {
      loadContract()
    }
  }, [user])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user

        // Only SUPER_ADMIN can access
        if (userData.role !== UserRole.SUPER_ADMIN) {
          router.push('/')
          return
        }

        setUser(userData)
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

  const loadContract = () => {
    const template = contractTemplates.find(t => t.id === contractType)
    if (template) {
      setContract(template)
    }
  }

  const handleContentUpdate = () => {
    refresh() // Reload content from hook
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
      <div className="min-h-screen p-6">
        <Alert
          message="កំហុស"
          description="រកមិនឃើញកិច្ចព្រមព្រៀងនេះទេ"
          type="error"
          showIcon
        />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen p-6">
        <Alert
          message="មិនមានសិទ្ធិចូលប្រើ"
          description="មានតែ SUPER_ADMIN ទេដែលអាចចូលប្រើទំព័រនេះបាន"
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            {
              title: (
                <a onClick={() => router.push('/')}>
                  <HomeOutlined /> ទំព័រដើម
                </a>
              )
            },
            {
              title: 'កែសម្រួលកិច្ចព្រមព្រៀង'
            },
            {
              title: `ប្រភេទ ${contractType}`
            }
          ]}
        />

        {/* Header */}
        <Card className="mb-6 shadow-md">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="flex items-center justify-between">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/')}
              >
                ត្រលប់ក្រោយ
              </Button>
              <Tag color="blue">SUPER ADMIN - កែសម្រួលបាន</Tag>
            </div>

            <div className="text-center">
              <Title level={2} className="font-hanuman text-blue-800 mb-3">
                <FileTextOutlined className="mr-3" />
                {contract.title}
              </Title>
              <Text className="font-hanuman text-gray-600">
                ចុចលើខ្លឹមសារណាមួយដើម្បីកែសម្រួល (សូមរង់ចាំ hover ឃើញពណ៌លឿង)
              </Text>
            </div>

            <Alert
              message="របៀបប្រើប្រាស់"
              description={
                <ul className="font-hanuman list-disc ml-5 mt-2">
                  <li>ចង្អុលទៅលើខ្លឹមសារ → ឃើញពណ៌លឿង និងរូបតារ ✏️</li>
                  <li>ចុចលើខ្លឹមសារ → បើកផ្ទាំងកែសម្រួល</li>
                  <li>កែខ្លឹមសារ → ចុច "រក្សាទុក"</li>
                  <li>ទំព័រនឹងផ្ទុកឡើងវិញដោយស្វ័យប្រវត្តិដើម្បីបង្ហាញការផ្លាស់ប្តូរ</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Space>
        </Card>

        {/* Contract Content with Inline Editing */}
        <Card className="shadow-md">
          <div className="p-6 lg:p-8 bg-white">
            <div className="prose max-w-none font-hanuman">
              <h3 className="text-center text-lg font-bold mb-6">{contract.title}</h3>

              {/* Party A */}
              <div className="mb-6">
                <strong>
                  <EditableContent
                    contentKey="sign_party_a_label"
                    isAdmin={isSuperAdmin}
                    label="ភាគី ក"
                    onUpdate={handleContentUpdate}
                  >
                    {t('sign_party_a_label')}
                  </EditableContent>
                </strong>
                <div className="ml-4">
                  <p>{contract.partyA}</p>
                  {contract.partyASignatory && (
                    <>
                      <p className="text-sm text-gray-600">
                        <EditableContent
                          contentKey="sign_representative_label"
                          isAdmin={isSuperAdmin}
                          label="តំណាង"
                          onUpdate={handleContentUpdate}
                        >
                          {t('sign_representative_label')}
                        </EditableContent> {contract.partyASignatory}
                      </p>
                      <p className="text-sm text-gray-600">
                        <EditableContent
                          contentKey="sign_position_label"
                          isAdmin={isSuperAdmin}
                          label="តួនាទី"
                          onUpdate={handleContentUpdate}
                        >
                          {t('sign_position_label')}
                        </EditableContent> {contract.partyAPosition}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Party B */}
              <div className="mb-6">
                <strong>
                  <EditableContent
                    contentKey="sign_party_b_label"
                    isAdmin={isSuperAdmin}
                    label="ភាគី ខ"
                    onUpdate={handleContentUpdate}
                  >
                    {t('sign_party_b_label')}
                  </EditableContent>
                </strong> {contract.partyB}
              </div>

              <Divider />

              {/* Article 1 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_1_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ១"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_1_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_1_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ១ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_1_content')}
                </EditableContent>
              </p>

              {/* Article 2 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_2_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ២"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_2_title')}
                </EditableContent>
              </h4>
              <ul className="mb-6">
                {contract.responsibilities?.map((resp: string, idx: number) => (
                  <li key={idx} className="mb-2">{resp}</li>
                ))}
              </ul>

              {/* Article 3 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_3_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៣"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_3_title')}
                </EditableContent>
              </h4>
              <div dangerouslySetInnerHTML={{ __html: contract.content }} className="mb-6" />

              {/* Article 4 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_4_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៤"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_4_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_4_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៤ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_4_content')}
                </EditableContent>
              </p>

              {/* Article 5 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_5_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៥"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_5_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_5_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៥ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_5_content')}
                </EditableContent>
              </p>

              {/* Article 6 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_6_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៦"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_6_title')}
                </EditableContent>
              </h4>
              <p className="mb-6">
                <EditableContent
                  contentKey="sign_article_6_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៦ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_6_content')}
                </EditableContent>
              </p>

              {/* Article 7 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_7_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៧"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_7_title')}
                </EditableContent>
              </h4>
              <p className="mb-8">
                <EditableContent
                  contentKey="sign_article_7_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៧ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_7_content')}
                </EditableContent>
              </p>

              <Divider />

              {/* Article 8 */}
              <h4 className="font-bold">
                <EditableContent
                  contentKey="sign_article_8_title"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៨"
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_8_title')}
                </EditableContent>
              </h4>
              <p className="mb-8">
                <EditableContent
                  contentKey="sign_article_8_content"
                  isAdmin={isSuperAdmin}
                  label="មាត្រា ៨ - ខ្លឹមសារ"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('sign_article_8_content')}
                </EditableContent>
              </p>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <p className="font-bold mb-2">ភាគី ក</p>
                  {contract.partyASignatory && (
                    <>
                      <p className="text-sm">{contract.partyASignatory}</p>
                      <p className="text-sm text-gray-600">{contract.partyAPosition}</p>
                    </>
                  )}
                  <div className="mt-4 h-20 border-b-2 border-gray-400"></div>
                  <p className="text-sm mt-2">
                    <EditableContent
                      contentKey="sign_signature_seal_label"
                      isAdmin={isSuperAdmin}
                      label="ហត្ថលេខា"
                      onUpdate={handleContentUpdate}
                    >
                      {t('sign_signature_seal_label')}
                    </EditableContent>
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-2">ភាគី ខ</p>
                  <p className="text-sm">{contract.partyB}</p>
                  <div className="mt-4 h-20 border-b-2 border-gray-400"></div>
                  <p className="text-sm mt-2">
                    <EditableContent
                      contentKey="sign_signature_seal_label"
                      isAdmin={isSuperAdmin}
                      label="ហត្ថលេខា"
                      onUpdate={handleContentUpdate}
                    >
                      {t('sign_signature_seal_label')}
                    </EditableContent>
                  </p>
                </div>
              </div>

              <Divider />

              {/* End Section */}
              <div className="mt-8 text-center text-gray-500">
                <p className="font-bold">
                  <EditableContent
                    contentKey="sign_end_of_contract"
                    isAdmin={isSuperAdmin}
                    label="ចុងបញ្ចប់"
                    onUpdate={handleContentUpdate}
                  >
                    {t('sign_end_of_contract')}
                  </EditableContent>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
