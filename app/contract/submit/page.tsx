'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, Button, Typography, message, Spin, Alert, Space, Modal, Tabs, Upload } from 'antd'
import { CheckCircleOutlined, FileTextOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import type { UploadFile } from 'antd'

const { Title, Text } = Typography

export default function ContractSubmitPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signature, setSignature] = useState('')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw')
  const [uploadedImage, setUploadedImage] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

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

        // Check if user already signed contract
        if (userData.contract_signed) {
          message.info('អ្នកបានចុះហត្ថលេខាលើកិច្ចសន្យារួចហើយ')
          router.push('/me-dashboard')
          return
        }

        // Check if user completed configuration
        if (!userData.configuration_complete) {
          message.warning('សូមបំពេញការកំណត់រចនាសម្ព័ន្ធជាមុនសិន')
          router.push('/contract/configure')
          return
        }

        // Check if user has read the contract
        if (!userData.contract_read) {
          message.warning('សូមអានកិច្ចសន្យាជាមុនសិន')
          router.push('/contract/sign')
          return
        }

        // Check if selections exist in localStorage
        const selectionsJson = localStorage.getItem('contract_selections')
        if (!selectionsJson) {
          message.error('ការជ្រើសរើសរបស់អ្នកបាត់បង់ សូមធ្វើការកំណត់រចនាសម្ព័ន្ធឡើងវិញ')
          router.push('/contract/configure')
          return
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
        message.warning('សូមជ្រើសរើសរូបភាពហត្ថលេខា')
        return
      }
      setSignature(uploadedImage)
    }
    setShowSignatureModal(false)
    message.success('ហត្ថលេខាបានរក្សាទុក')
  }

  const handleImageUpload = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      message.error('សូមជ្រើសរើសរូបភាពប្រភេទ PNG ឬ JPG')
      return false
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('ទំហំរូបភាពធំពេក (អតិបរមា 2MB)')
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
          message.success('បានផ្ទុករូបភាពហត្ថលេខា')
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)

    return false
  }

  const handleSubmit = async () => {
    if (!signature) {
      message.warning('សូមចុះហត្ថលេខា')
      return
    }

    setSubmitting(true)

    try {
      const selectionsJson = localStorage.getItem('contract_selections')
      if (!selectionsJson) {
        message.error('ការជ្រើសរើសរបស់អ្នកបាត់បង់')
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

        message.success('អ្នកបានចុះហត្ថលេខាលើកិច្ចសន្យាដោយជោគជ័យ!')

        setTimeout(() => {
          router.push('/me-dashboard')
        }, 1500)
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការចុះហត្ថលេខា')
      }
    } catch (error) {
      console.error('Submission error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
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
        {/* Header */}
        <Card className="mb-8 shadow-md">
          <div className="text-center p-4">
            <Title level={2} className="font-hanuman text-blue-800 mb-3">
              <FileTextOutlined className="mr-3" />
              ចុះហត្ថលេខាលើកិច្ចសន្យា
            </Title>
            <Text className="font-hanuman text-gray-600 text-base">
              អ្នកបានបំពេញការអាន និងការកំណត់រចនាសម្ព័ន្ធរួចរាល់ សូមចុះហត្ថលេខាដើម្បីបញ្ចប់
            </Text>
          </div>
        </Card>

        {/* Progress Indicator */}
        <Card className="mb-8 shadow-md">
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <Text className="font-hanuman">អានកិច្ចសន្យា</Text>
              </div>
              <CheckCircleOutlined className="text-green-500 text-2xl" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <Text className="font-hanuman">កំណត់រចនាសម្ព័ន្ធសមិទ្ធកម្ម</Text>
              </div>
              <CheckCircleOutlined className="text-green-500 text-2xl" />
            </div>
            <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4">
              <div className="flex items-center space-x-2">
                <EditOutlined className="text-blue-500 text-xl" />
                <Text className="font-hanuman font-bold text-blue-600">ចុះហត្ថលេខា (ជំហានចុងក្រោយ)</Text>
              </div>
            </div>
          </Space>
        </Card>

        {/* Signature Section */}
        <Card className="mb-8 shadow-md">
          <Space direction="vertical" size="large" className="w-full">
            <Alert
              message={<span className="font-hanuman text-base">សូមចុះហត្ថលេខារបស់អ្នក</span>}
              description={<span className="font-hanuman">នេះគឺជាជំហានចុងក្រោយក្នុងការបញ្ចប់កិច្ចសន្យា</span>}
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
                        <Text className="font-hanuman text-base font-bold">ហត្ថលេខា: បានរក្សាទុក</Text>
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
                      កែប្រែ
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
                    ចុចដើម្បីចុះហត្ថលេខា
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
                បញ្ជូនកិច្ចសន្យា
              </Button>
            </div>
          </Space>
        </Card>

        {/* Signature Modal */}
        <Modal
          title={<span className="font-hanuman">ចុះហត្ថលេខារបស់អ្នក</span>}
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
              {signatureMethod === 'draw' ? 'សម្អាត' : 'លុបរូបភាព'}
            </Button>,
            <Button key="cancel" onClick={() => {
              setShowSignatureModal(false)
              setUploadedImage('')
            }}>
              បោះបង់
            </Button>,
            <Button key="save" type="primary" onClick={saveSignature}>
              រក្សាទុក
            </Button>
          ]}
        >
          <Tabs
            activeKey={signatureMethod}
            onChange={(key) => setSignatureMethod(key as 'draw' | 'upload')}
            items={[
              {
                key: 'draw',
                label: <span className="font-hanuman"><EditOutlined /> គូរហត្ថលេខា</span>,
                children: (
                  <div>
                    <div className="text-center mb-4">
                      <Text className="font-hanuman">សូមគូរហត្ថលេខារបស់អ្នកខាងក្រោម:</Text>
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
                label: <span className="font-hanuman"><UploadOutlined /> ផ្ទុកហត្ថលេខា</span>,
                children: (
                  <div>
                    <div className="text-center mb-4">
                      <Text className="font-hanuman">សូមជ្រើសរើសរូបភាពហត្ថលេខារបស់អ្នក:</Text>
                      <div className="text-sm text-gray-500 mt-2 font-hanuman">
                        (ប្រភេទ: PNG, JPG | ទំហំអតិបរមា: 2MB)
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
                            ✓ បានផ្ទុករូបភាព (ចុចដើម្បីប្តូរ)
                          </p>
                        </div>
                      ) : (
                        <div className="p-8">
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                          </p>
                          <p className="ant-upload-text font-hanuman">
                            ចុច ឬអូសរូបភាពមកទីនេះ
                          </p>
                          <p className="ant-upload-hint font-hanuman text-gray-500">
                            ជ្រើសរើសរូបភាពហត្ថលេខារបស់អ្នក (PNG ឬ JPG)
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
