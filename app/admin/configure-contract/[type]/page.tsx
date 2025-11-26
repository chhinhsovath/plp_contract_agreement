'use client'

import { useState, useEffect, use } from 'react'
import { Card, Button, Typography, Spin, Alert, Space, Tag, Breadcrumb, Divider } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, HomeOutlined, EditOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useContent } from '@/lib/hooks/useContent'
import { EditableContent } from '@/components/EditableContent'
import { UserRole } from '@/lib/roles'

const { Title, Text, Paragraph } = Typography

export default function AdminConfigureContractPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { t, refresh } = useContent()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const contractType = parseInt(resolvedParams.type)
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  // Only Types 4 and 5 are supported
  const isValidType = contractType === 4 || contractType === 5

  useEffect(() => {
    checkSession()
  }, [])

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

  if (!isValidType) {
    return (
      <div className="min-h-screen p-6">
        <Alert
          message="កំហុស"
          description={`ប្រភេទកិច្ចសន្យាមិនត្រឹមត្រូវ។ មានតែប្រភេទ 4 និង 5 ទេដែលអាចកែសម្រួលបាន។`}
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

  const contractTypeName = contractType === 4
    ? 'កិច្ចព្រមព្រៀងនាយកដ្ឋាន-ស្រុក (Provincial-District)'
    : 'កិច្ចព្រមព្រៀងនាយកដ្ឋាន-សាលា (Provincial-School)'

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
              title: 'កែសម្រួលទំព័រកំណត់រចនាសម្ព័ន្ធ'
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
                <EditOutlined className="mr-3" />
                កែសម្រួលទំព័រកំណត់រចនាសម្ព័ន្ធ
              </Title>
              <Text className="font-hanuman text-gray-600 text-lg">
                {contractTypeName}
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

        {/* Configuration Page Content Preview */}
        <Card className="shadow-md">
          <div className="p-6 lg:p-8 bg-white">
            <div className="prose max-w-none font-hanuman">

              {/* Page Title and Subtitle */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <Title level={3} className="text-center mb-4">
                  <EditableContent
                    contentKey="contract_configure_page_title"
                    isAdmin={isSuperAdmin}
                    label="ចំណងជើងទំព័រ"
                    onUpdate={handleContentUpdate}
                  >
                    {t('contract_configure_page_title')}
                  </EditableContent>
                </Title>
                <Paragraph className="text-center text-base">
                  <EditableContent
                    contentKey="contract_configure_subtitle"
                    isAdmin={isSuperAdmin}
                    label="ចំណងជើងរង"
                    multiline
                    onUpdate={handleContentUpdate}
                  >
                    {t('contract_configure_subtitle')}
                  </EditableContent>
                </Paragraph>
              </div>

              <Divider orientation="left">ព័ត៌មានផ្សេងៗ / Alert Messages</Divider>

              {/* Alert Message */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Text strong className="block mb-2">ការណែនាំ:</Text>
                <EditableContent
                  contentKey="contract_configure_alert_message"
                  isAdmin={isSuperAdmin}
                  label="សារព្រមាន"
                  multiline
                  onUpdate={handleContentUpdate}
                >
                  {t('contract_configure_alert_message')}
                </EditableContent>
              </div>

              <Divider orientation="left">ស្លាកសមិទ្ធកម្ម / Deliverable Labels</Divider>

              {/* Deliverable Labels */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag color="blue">Label 1</Tag>
                    <EditableContent
                      contentKey="contract_configure_deliverable_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកសមិទ្ធកម្ម"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_deliverable_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="green">Label 2</Tag>
                    <EditableContent
                      contentKey="contract_configure_activities_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកសកម្មភាព"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_activities_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="purple">Label 3</Tag>
                    <EditableContent
                      contentKey="contract_configure_timeline_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកពេលវេលា"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_timeline_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="orange">Label 4</Tag>
                    <EditableContent
                      contentKey="contract_configure_select_option_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកជ្រើសរើសជម្រើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_select_option_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="red">Label 5</Tag>
                    <EditableContent
                      contentKey="contract_configure_option_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកជម្រើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_option_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="cyan">Label 6</Tag>
                    <EditableContent
                      contentKey="contract_configure_target_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកគោលដៅ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_target_label')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              <Divider orientation="left">ស្លាកទិន្នន័យមូលដ្ឋាន / Baseline Labels</Divider>

              {/* Baseline Information Labels */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag>Title</Tag>
                    <EditableContent
                      contentKey="configure_baseline_info_title"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងព័ត៌មានមូលដ្ឋាន"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_info_title')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 1</Tag>
                    <EditableContent
                      contentKey="configure_baseline_percentage_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកភាគរយមូលដ្ឋាន"
                      multiline
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_percentage_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 2</Tag>
                    <EditableContent
                      contentKey="configure_baseline_source_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកប្រភពមូលដ្ឋាន"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_source_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 3</Tag>
                    <EditableContent
                      contentKey="configure_baseline_date_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកកាលបរិច្ឆេទមូលដ្ឋាន"
                      multiline
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_date_label')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Input 4</Tag>
                    <EditableContent
                      contentKey="configure_baseline_notes_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកចំណាំមូលដ្ឋាន"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_baseline_notes_label')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              {contractType === 5 && (
                <>
                  <Divider orientation="left">សំណួរ Yes/No (សម្រាប់ប្រភេទ 5 ប៉ុណ្ណោះ)</Divider>

                  <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Tag color="magenta">Question</Tag>
                        <EditableContent
                          contentKey="configure_yesno_question"
                          isAdmin={isSuperAdmin}
                          label="សំណួរ Yes/No"
                          onUpdate={handleContentUpdate}
                        >
                          {t('configure_yesno_question')}
                        </EditableContent>
                      </div>

                      <div>
                        <Tag color="green">Yes Option</Tag>
                        <EditableContent
                          contentKey="configure_yes_option"
                          isAdmin={isSuperAdmin}
                          label="ជម្រើស បាទ/ចាស"
                          onUpdate={handleContentUpdate}
                        >
                          {t('configure_yes_option')}
                        </EditableContent>
                      </div>

                      <div>
                        <Tag color="red">No Option</Tag>
                        <EditableContent
                          contentKey="configure_no_option"
                          isAdmin={isSuperAdmin}
                          label="ជម្រើស ទេ"
                          onUpdate={handleContentUpdate}
                        >
                          {t('configure_no_option')}
                        </EditableContent>
                      </div>
                    </Space>
                  </div>
                </>
              )}

              <Divider orientation="left">ប៊ូតុងផ្សេងៗ / Button Labels</Divider>

              {/* Button Labels */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag color="default">Button 1</Tag>
                    <EditableContent
                      contentKey="contract_configure_back_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងត្រលប់ក្រោយ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_back_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="blue">Button 2</Tag>
                    <EditableContent
                      contentKey="contract_configure_next_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងបន្ទាប់"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_next_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="green">Button 3</Tag>
                    <EditableContent
                      contentKey="contract_configure_submit_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងដាក់ស្នើ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_submit_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="orange">Button 4</Tag>
                    <EditableContent
                      contentKey="contract_configure_request_change_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងស្នើសុំផ្លាស់ប្តូរ"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_request_change_button')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag color="purple">Button 5</Tag>
                    <EditableContent
                      contentKey="contract_configure_return_dashboard_button"
                      isAdmin={isSuperAdmin}
                      label="ប៊ូតុងត្រលប់ទៅផ្ទាំងគ្រប់គ្រង"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_return_dashboard_button')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              <Divider orientation="left">ទិដ្ឋភាពមើល / View Mode Labels</Divider>

              {/* View Mode Labels */}
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Tag>Title</Tag>
                    <EditableContent
                      contentKey="contract_configure_view_title"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងទិដ្ឋភាពមើល"
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_view_title')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Subtitle</Tag>
                    <EditableContent
                      contentKey="contract_configure_view_subtitle"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងរងទិដ្ឋភាពមើល"
                      multiline
                      onUpdate={handleContentUpdate}
                    >
                      {t('contract_configure_view_subtitle')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Section Title</Tag>
                    <EditableContent
                      contentKey="configure_selected_deliverables_title"
                      isAdmin={isSuperAdmin}
                      label="ចំណងជើងសមិទ្ធកម្មដែលបានជ្រើសរើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_selected_deliverables_title')}
                    </EditableContent>
                  </div>

                  <div>
                    <Tag>Selected Label</Tag>
                    <EditableContent
                      contentKey="configure_selected_option_label"
                      isAdmin={isSuperAdmin}
                      label="ស្លាកជម្រើសដែលបានជ្រើស"
                      onUpdate={handleContentUpdate}
                    >
                      {t('configure_selected_option_label')}
                    </EditableContent>
                  </div>
                </Space>
              </div>

              {/* Info Note */}
              <Alert
                message="ចំណាំសំខាន់"
                description={
                  <div className="font-hanuman">
                    <p>ខ្លឹមសារទាំងអស់ខាងលើនឹងត្រូវបានបង្ហាញនៅលើទំព័រកំណត់រចនាសម្ព័ន្ធ (/contract/configure) សម្រាប់អ្នកប្រើប្រាស់ដែលមានកិច្ចសន្យាប្រភេទ {contractType}។</p>
                    <p className="mt-2 mb-0">ការផ្លាស់ប្តូរដែលអ្នកធ្វើនៅទីនេះនឹងមានប្រសិទ្ធភាពភ្លាមៗ។</p>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginTop: 24 }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
