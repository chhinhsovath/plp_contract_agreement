'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, Button, Typography, message, Spin, Alert, Space, Modal, Tabs, Upload } from 'antd'
import { CheckCircleOutlined, FileTextOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import type { UploadFile } from 'antd'
import { useContent } from '@/lib/hooks/useContent'
import { WorkflowProgress } from '@/components/WorkflowProgress'

const { Title, Text } = Typography

export default function ContractSubmitPage() {
  const router = useRouter()
  const { t } = useContent()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signature, setSignature] = useState('')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw')
  const [uploadedImage, setUploadedImage] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const sessionCheckStarted = useRef(false)

  useEffect(() => {
    if (!sessionCheckStarted.current) {
      sessionCheckStarted.current = true
      checkSession()
    }
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        setUser(userData)

        // Check if user already signed contract
        if (userData.contract_signed) {
          setLoading(false)
          message.info(t('submit_already_signed'))
          router.push('/me-dashboard')
          return
        }

        // Check if user completed configuration
        if (!userData.configuration_complete) {
          setLoading(false)
          message.warning(t('submit_config_required'))
          router.push('/contract/configure')
          return
        }

        // Check if user has read the contract
        if (!userData.contract_read) {
          setLoading(false)
          message.warning(t('submit_read_required'))
          router.push('/contract/sign')
          return
        }

        // Check if selections exist in localStorage
        const selectionsJson = localStorage.getItem('contract_selections')
        if (!selectionsJson) {
          setLoading(false)
          message.error(t('submit_selections_lost'))
          router.push('/contract/configure')
          return
        }
      } else {
        setLoading(false)
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setLoading(false)
      router.push('/login')
    }
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!canvasRef.current) return
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const coords = getCoordinates(e)
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const coords = getCoordinates(e)
    if (ctx) {
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000'
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
    }
  }

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault()
    setIsDrawing(false)
  }

  const clearSignature = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setSignature('')
  }

  const saveSignature = () => {
    if (signatureMethod === 'draw') {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      const dataUrl = canvas.toDataURL()
      setSignature(dataUrl)
    } else {
      if (!uploadedImage) {
        message.warning(t('signature_select_warning'))
        return
      }
      setSignature(uploadedImage)
    }
    setShowSignatureModal(false)
    message.success(t('signature_saved'))
  }

  const handleImageUpload = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      message.error(t('signature_invalid_type'))
      return false
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      message.error(t('signature_too_large'))
      return false
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const maxWidth = 600
        const maxHeight = 300
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const resizedDataUrl = canvas.toDataURL('image/png')
          setUploadedImage(resizedDataUrl)
          message.success(t('signature_uploaded'))
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)

    return false
  }

  const handleSubmit = async () => {
    if (!signature) {
      message.warning(t('submit_signature_warning'))
      return
    }

    setSubmitting(true)

    try {
      const selectionsJson = localStorage.getItem('contract_selections')
      if (!selectionsJson) {
        message.error(t('submit_selections_lost'))
        router.push('/contract/configure')
        return
      }

      const selections = JSON.parse(selectionsJson)

      const response = await fetch('/api/contracts/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          contractType: user.contract_type,
          selections,
          signature
        })
      })

      if (response.ok) {
        // Clear selections from localStorage after successful submission
        localStorage.removeItem('contract_selections')

        message.success(t('contract_submit_success_message'))

        setTimeout(() => {
          router.push('/me-dashboard')
        }, 1500)
      } else {
        const data = await response.json()
        message.error(data.error || t('submit_signature_error'))
      }
    } catch (error) {
      console.error('Submission error:', error)
      message.error(t('submit_connection_error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Workflow Progress */}
        <WorkflowProgress currentStep={3} />

        {/* Header */}
        <Card className="mb-8 shadow-md">
          <div className="text-center p-4">
            <Title level={2} className="font-hanuman text-blue-800 mb-3">
              <FileTextOutlined className="mr-3" />
              {t('contract_submit_page_title')}
            </Title>
            <Text className="font-hanuman text-gray-600 text-base">
              {t('contract_submit_subtitle')}
            </Text>
          </div>
        </Card>

        {/* Progress Indicator - Removed (using WorkflowProgress component instead) */}

        {/* Signature Section */}
        <Card className="mb-8 shadow-md">
          <Space direction="vertical" size="large" className="w-full">
            <Alert
              message={<span className="font-hanuman text-base">{t('contract_submit_signature_prompt')}</span>}
              description={<span className="font-hanuman">{t('contract_submit_signature_description')}</span>}
              type="info"
              showIcon
              className="p-4"
            />

            <div className="flex items-center justify-between border-2 border-dashed border-gray-300 rounded p-6">
              {signature ? (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500 text-2xl" />
                      <div>
                        <Text className="font-hanuman text-base font-bold">{t('contract_submit_signature_saved')}</Text>
                        <div className="mt-2">
                          <img
                            src={signature}
                            alt="Signature"
                            className="max-h-20 border border-gray-200 rounded"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      size="large"
                      onClick={() => setShowSignatureModal(true)}
                      className="font-hanuman"
                    >
                      {t('common_edit')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center">
                  <Button
                    type="dashed"
                    icon={<EditOutlined />}
                    onClick={() => setShowSignatureModal(true)}
                    size="large"
                    className="font-hanuman"
                  >
                    {t('contract_submit_click_to_sign')}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4">
              <Button
                type="primary"
                size="large"
                loading={submitting}
                onClick={handleSubmit}
                disabled={!signature}
                icon={<CheckCircleOutlined />}
                className="font-hanuman px-8 py-6 h-auto text-base"
              >
                {t('contract_submit_button')}
              </Button>
            </div>
          </Space>
        </Card>

        {/* Signature Modal */}
        <Modal
          title={<span className="font-hanuman">{t('signature_modal_title')}</span>}
          open={showSignatureModal}
          onCancel={() => {
            setShowSignatureModal(false)
            setUploadedImage('')
          }}
          width={600}
          footer={[
            <Button
              key="clear"
              onClick={() => {
                if (signatureMethod === 'draw') {
                  clearSignature()
                } else {
                  setUploadedImage('')
                }
              }}
            >
              {signatureMethod === 'draw' ? t('signature_clear_button') : t('signature_delete_image')}
            </Button>,
            <Button key="cancel" onClick={() => {
              setShowSignatureModal(false)
              setUploadedImage('')
            }}>
              {t('signature_cancel_button')}
            </Button>,
            <Button key="save" type="primary" onClick={saveSignature}>
              {t('signature_save_button')}
            </Button>
          ]}
        >
          <Tabs
            activeKey={signatureMethod}
            onChange={(key) => setSignatureMethod(key as 'draw' | 'upload')}
            items={[
              {
                key: 'draw',
                label: <span className="font-hanuman"><EditOutlined /> {t('signature_draw_tab')}</span>,
                children: (
                  <div>
                    <div className="text-center mb-4">
                      <Text className="font-hanuman">{t('signature_draw_prompt')}</Text>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={200}
                      className="border border-gray-300 rounded w-full cursor-crosshair bg-white"
                      style={{ touchAction: 'none' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                )
              },
              {
                key: 'upload',
                label: <span className="font-hanuman"><UploadOutlined /> {t('signature_upload_tab')}</span>,
                children: (
                  <div>
                    <div className="text-center mb-4">
                      <Text className="font-hanuman">{t('signature_upload_prompt')}</Text>
                      <div className="text-sm text-gray-500 mt-2 font-hanuman">
                        {t('signature_file_hint')}
                      </div>
                    </div>
                    <Upload.Dragger
                      accept="image/png,image/jpeg,image/jpg"
                      beforeUpload={handleImageUpload}
                      showUploadList={false}
                      maxCount={1}
                    >
                      {uploadedImage ? (
                        <div className="p-4">
                          <img
                            src={uploadedImage}
                            alt="Signature"
                            className="max-h-40 max-w-full mx-auto border border-gray-200 rounded object-contain"
                            style={{ maxHeight: '160px', width: 'auto' }}
                          />
                          <p className="mt-2 text-sm text-green-600 font-hanuman">
                            {t('signature_uploaded_click_change')}
                          </p>
                        </div>
                      ) : (
                        <div className="p-8">
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                          </p>
                          <p className="ant-upload-text font-hanuman">
                            {t('signature_drag_text')}
                          </p>
                          <p className="ant-upload-hint font-hanuman text-gray-500">
                            {t('signature_drag_hint')}
                          </p>
                        </div>
                      )}
                    </Upload.Dragger>
                  </div>
                )
              }
            ]}
          />
        </Modal>
      </div>
    </div>
  )
}
