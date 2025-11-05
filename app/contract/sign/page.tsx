'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, Button, Typography, Checkbox, Progress, message, Spin, Alert, Divider, Space } from 'antd'
import { CheckCircleOutlined, FileTextOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { contractTemplates } from '@/lib/contractTemplates'
import { useContent } from '@/lib/hooks/useContent'

const { Title, Text, Paragraph } = Typography

export default function ContractSignPage() {
  const router = useRouter()
  const { t } = useContent() // Dynamic content hook
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [proceeding, setProceeding] = useState(false)
  const [readStartTime] = useState(Date.now())

  const contractRef = useRef<HTMLDivElement>(null)

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

        // Check if user already completed the workflow
        if (userData.contract_signed) {
          message.info(t('sign_already_signed_message'))
          router.push('/me-dashboard')
          return
        }

        // Check if user already read the contract - redirect to next step
        if (userData.contract_read) {
          message.info(t('sign_already_read_message'))
          router.push('/contract/configure')
          return
        }

        // Load contract based on user's contract type
        if (userData.contract_type) {
          // Fetch dynamic contract template from CMS
          const templateResponse = await fetch(`/api/contract-templates/${userData.contract_type}`)
          if (templateResponse.ok) {
            const templateData = await templateResponse.json()
            setContract(templateData.template)
          } else {
            // Fallback to static template if API fails
            const userContract = contractTemplates.find(c => c.id === userData.contract_type)
            setContract(userContract)
          }
        } else {
          message.error(t('sign_no_contract_type_error'))
          router.push('/login')
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

  const handleScroll = () => {
    if (!contractRef.current) return

    const element = contractRef.current
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight - element.clientHeight
    const progress = Math.round((scrollTop / scrollHeight) * 100)

    setScrollProgress(progress)

    if (progress >= 95) {
      setHasScrolledToBottom(true)
    }
  }

  const handleProceedToConfiguration = async () => {
    if (!agreed) {
      message.warning(t('sign_agree_warning'))
      return
    }

    setProceeding(true)
    const readTime = Math.round((Date.now() - readStartTime) / 1000)

    try {
      // Mark contract as read
      const response = await fetch('/api/contracts/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          readTime: readTime
        })
      })

      if (response.ok) {
        message.success(t('contract_sign_success_message'))
        // Redirect to configuration page
        router.push('/contract/configure')
      } else {
        const data = await response.json()
        message.error(data.error || t('sign_save_error'))
      }
    } catch (error) {
      console.error('Mark read error:', error)
      message.error(t('sign_connection_error'))
    } finally {
      setProceeding(false)
    }
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
          message={t('sign_no_contract_error_title')}
          description={t('sign_no_contract_error_description')}
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Workflow Progress */}
        <WorkflowProgress currentStep={1} />

        {/* Header */}
        <Card className="mb-8 shadow-md">
          <div className="text-center p-4">
            <Title level={2} className="font-hanuman text-blue-800 mb-3">
              <FileTextOutlined className="mr-3" />
              {t('contract_sign_page_title')} {contract.title}
            </Title>
            <Text className="font-hanuman text-gray-600 text-base">
              {t('contract_sign_subtitle')}
            </Text>
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Text className="font-hanuman">{t('contract_sign_progress_label')}</Text>
            <Text className="font-hanuman">{scrollProgress}%</Text>
          </div>
          <Progress
            percent={scrollProgress}
            status={hasScrolledToBottom ? 'success' : 'active'}
            showInfo={false}
            size={['100%', 10]}
          />
          {!hasScrolledToBottom && (
            <Text type="secondary" className="text-sm mt-3 font-hanuman">
              <ClockCircleOutlined className="mr-2" />
              {t('contract_sign_scroll_message')}
            </Text>
          )}
        </Card>

        {/* Contract Content */}
        <Card className="mb-8 shadow-md">
          <div
            ref={contractRef}
            onScroll={handleScroll}
            className="overflow-y-auto p-6 lg:p-8 bg-white border rounded"
            style={{ height: '600px', maxHeight: '600px', overflowY: 'scroll' }}
          >
            <div className="prose max-w-none font-hanuman" style={{ minHeight: '800px' }}>
              <h3 className="text-center text-lg font-bold mb-4">{contract.title}</h3>

              <div className="mb-4">
                <strong>{t('sign_party_a_label')}</strong>
                <div className="ml-4">
                  <p>{contract.partyA}</p>
                  {contract.partyASignatory && (
                    <>
                      <p className="text-sm text-gray-600">{t('sign_representative_label')} {contract.partyASignatory}</p>
                      <p className="text-sm text-gray-600">{t('sign_position_label')} {contract.partyAPosition}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <strong>{t('sign_party_b_label')}</strong> {contract.partyB} ({user?.full_name})
              </div>

              <Divider />

              <h4 className="font-bold">{t('sign_article_1_title')}</h4>
              <p className="mb-4">
                {t('sign_article_1_content')}
              </p>

              <h4 className="font-bold">{t('sign_article_2_title')}</h4>
              <ul className="mb-6">
                {contract.responsibilities?.map((resp: string, idx: number) => (
                  <li key={idx} className="mb-2">{resp}</li>
                ))}
              </ul>

              <h4 className="font-bold">{t('sign_article_3_title')}</h4>
              <div dangerouslySetInnerHTML={{ __html: contract.content }} className="mb-6" />

              <h4 className="font-bold">{t('sign_article_4_title')}</h4>
              <p className="mb-4">
                {t('sign_article_4_content')}
              </p>

              <h4 className="font-bold">{t('sign_article_5_title')}</h4>
              <p className="mb-4">
                {t('sign_article_5_content')}
              </p>

              <h4 className="font-bold">{t('sign_article_6_title')}</h4>
              <p className="mb-4">
                {t('sign_article_6_content')}
              </p>

              <h4 className="font-bold">{t('sign_article_7_title')}</h4>
              <p className="mb-8">
                {t('sign_article_7_content')}
              </p>

              <Divider />

              <h4 className="font-bold">{t('sign_article_8_title')}</h4>
              <p className="mb-8">
                {t('sign_article_8_content')}
              </p>

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
                  <p className="text-sm mt-2">{t('sign_signature_seal_label')}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-2">{t('sign_party_b_label').replace(':', '')}</p>
                  <p className="text-sm">{user?.full_name}</p>
                  <p className="text-sm text-gray-600">{user?.position || contract.partyB}</p>
                  <div className="mt-4 h-20 border-b-2 border-gray-400"></div>
                  <p className="text-sm mt-2">{t('sign_signature_seal_label')}</p>
                </div>
              </div>

              <Divider />

              <div className="mt-8 text-center text-gray-500">
                <p className="font-bold">{t('sign_end_of_contract')}</p>
                <p className="text-sm mt-4">{t('contract_sign_subtitle')}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Agreement Section - Read Only */}
        {hasScrolledToBottom && (
          <Card className="mb-8 shadow-md">
            <Space direction="vertical" size="large" className="w-full">
              <Alert
                message={<span className="font-hanuman text-base">{t('contract_sign_completed_title')}</span>}
                description={<span className="font-hanuman">{t('contract_sign_completed_description')}</span>}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                className="p-4"
              />

              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="font-hanuman text-base"
              >
                {t('contract_sign_agreement_checkbox')}
              </Checkbox>

              <div className="flex items-center justify-end">
                <Button
                  type="primary"
                  size="large"
                  loading={proceeding}
                  onClick={handleProceedToConfiguration}
                  disabled={!agreed}
                  icon={<RightOutlined />}
                  iconPosition="end"
                  className="font-hanuman px-8 py-6 h-auto text-base"
                >
                  {t('contract_sign_proceed_button')}
                </Button>
              </div>
            </Space>
          </Card>
        )}
      </div>
    </div>
  )
}