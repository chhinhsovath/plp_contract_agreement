'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, Button, Typography, Checkbox, Progress, message, Spin, Alert, Divider, Space, Modal, Tabs, Upload } from 'antd'
import { CheckCircleOutlined, FileTextOutlined, EditOutlined, ClockCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { contractTemplates } from '@/lib/contractTemplates'
import type { UploadFile } from 'antd'

const { Title, Text, Paragraph } = Typography

export default function ContractSignPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState('')
  const [readStartTime] = useState(Date.now())
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw')
  const [uploadedImage, setUploadedImage] = useState<string>('')

  const contractRef = useRef<HTMLDivElement>(null)
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

        // Load contract based on user's contract type
        if (userData.contract_type) {
          const userContract = contractTemplates.find(c => c.id === userData.contract_type)
          setContract(userContract)
        } else {
          message.error('អ្នកមិនមានប្រភេទកិច្ចសន្យា')
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

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    } else {
      // Mouse event
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
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      message.error('សូមជ្រើសរើសរូបភាពប្រភេទ PNG ឬ JPG')
      return false
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('ទំហំរូបភាពធំពេក (អតិបរមា 2MB)')
      return false
    }

    // Read file and convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedImage(dataUrl)
      message.success('បានផ្ទុករូបភាពហត្ថលេខា')
    }
    reader.readAsDataURL(file)

    return false // Prevent auto upload
  }

  const handleSign = async () => {
    if (!agreed || !signature) {
      message.warning('សូមយល់ព្រម និងចុះហត្ថលេខា')
      return
    }

    setSigning(true)
    const readTime = Math.round((Date.now() - readStartTime) / 1000)

    try {
      // Check if this is Contract 4 or 5 with configuration selections
      const isConfigurableContract = user.contract_type === 4 || user.contract_type === 5
      const selectionsJson = localStorage.getItem('contract_selections')

      let response

      if (isConfigurableContract && selectionsJson) {
        // New flow: Contract 4 & 5 with configuration selections
        const selections = JSON.parse(selectionsJson)

        response = await fetch('/api/contracts/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            contractType: user.contract_type,
            selections,
            signature
          })
        })

        // Clear selections from localStorage after submission
        if (response.ok) {
          localStorage.removeItem('contract_selections')
        }
      } else {
        // Old flow: Contract 1, 2, 3 with generic templates
        response = await fetch('/api/contracts/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            contractType: user.contract_type,
            signature: signature,
            readTime: readTime,
            agreed: agreed
          })
        })
      }

      if (response.ok) {
        message.success('អ្នកបានចុះហត្ថលេខាលើកិច្ចសន្យាដោយជោគជ័យ!')

        // Short delay to show success message
        setTimeout(() => {
          router.push('/me-dashboard')
        }, 1500)
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការចុះហត្ថលេខា')
      }
    } catch (error) {
      console.error('Signing error:', error)
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setSigning(false)
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
          message="មិនមានកិច្ចសន្យា"
          description="មិនអាចរកឃើញកិច្ចសន្យាសម្រាប់អ្នក"
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-md">
          <div className="text-center p-4">
            <Title level={2} className="font-hanuman text-blue-800 mb-3">
              <FileTextOutlined className="mr-3" />
              កិច្ចព្រមព្រៀង {contract.title}
            </Title>
            <Text className="font-hanuman text-gray-600 text-base">
              សូមអានកិច្ចសន្យាដោយប្រុងប្រយ័ត្ន មុនពេលចុះហត្ថលេខា
            </Text>
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Text className="font-hanuman">វឌ្ឍនភាពនៃការអាន:</Text>
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
              សូមរមូរចុះក្រោមដើម្បីអានកិច្ចសន្យាទាំងស្រុង
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
                <strong>ភាគី ក:</strong>
                <div className="ml-4">
                  <p>{contract.partyA}</p>
                  {contract.partyASignatory && (
                    <>
                      <p className="text-sm text-gray-600">តំណាងដោយ: {contract.partyASignatory}</p>
                      <p className="text-sm text-gray-600">មុខតំណែង: {contract.partyAPosition}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <strong>ភាគី ខ:</strong> {contract.partyB} ({user?.full_name})
              </div>

              <Divider />

              <h4 className="font-bold">មាត្រា ១: គោលបំណង</h4>
              <p className="mb-4">
                កិច្ចព្រមព្រៀងនេះមានគោលបំណងកំណត់ការទទួលខុសត្រូវ និងកាតព្វកិច្ចរបស់ភាគីទាំងពីរក្នុងការអនុវត្តគម្រោងកម្មវិធីអប់រំ។
                ភាគីទាំងពីរយល់ព្រមអនុវត្តតាមលក្ខខណ្ឌ និងកាតព្វកិច្ចដែលបានកំណត់ក្នុងកិច្ចព្រមព្រៀងនេះ។
              </p>

              <h4 className="font-bold">មាត្រា ២: មុខងារនិងទំនួលខុសត្រូវ:</h4>
              <ul className="mb-6">
                {contract.responsibilities?.map((resp: string, idx: number) => (
                  <li key={idx} className="mb-2">{resp}</li>
                ))}
              </ul>

              <h4 className="font-bold">មាត្រា ៣: លក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង:</h4>
              <div dangerouslySetInnerHTML={{ __html: contract.content }} className="mb-6" />

              <h4 className="font-bold">មាត្រា ៤: រយៈពេលនៃកិច្ចព្រមព្រៀង</h4>
              <p className="mb-4">
                កិច្ចព្រមព្រៀងនេះមានសុពលភាពរយៈពេល ១ឆ្នាំ ចាប់ពីថ្ងៃចុះហត្ថលេខា។
                ការបន្តកិច្ចព្រមព្រៀងត្រូវធ្វើឡើងដោយការព្រមព្រៀងរវាងភាគីទាំងពីរ។
              </p>

              <h4 className="font-bold">មាត្រា ៥: ការតាមដាន និងវាយតម្លៃ</h4>
              <p className="mb-4">
                ភាគីទាំងពីរយល់ព្រមធ្វើការតាមដាន និងវាយតម្លៃការអនុវត្តកិច្ចព្រមព្រៀងជាប្រចាំត្រីមាស។
                របាយការណ៍វឌ្ឍនភាពត្រូវដាក់ជូនភាគីពាក់ព័ន្ធតាមពេលវេលាដែលបានកំណត់។
              </p>

              <h4 className="font-bold">មាត្រា ៦: ការកែប្រែកិច្ចព្រមព្រៀង</h4>
              <p className="mb-4">
                រាល់ការកែប្រែលើខ្លឹមសារនៃកិច្ចព្រមព្រៀងនេះ ត្រូវធ្វើឡើងជាលាយលក្ខណ៍អក្សរ
                និងមានការយល់ព្រមពីភាគីទាំងពីរ។
              </p>

              <h4 className="font-bold">មាត្រា ៧: ការទទួលខុសត្រូវផ្នែកច្បាប់</h4>
              <p className="mb-8">
                ភាគីទាំងពីរយល់ព្រមគោរពតាមច្បាប់ និងបទប្បញ្ញត្តិជាធរមានទាំងអស់។
                ក្នុងករណីមានវិវាទកើតឡើង ភាគីទាំងពីរនឹងដោះស្រាយតាមការចរចា និងការសម្របសម្រួល។
              </p>

              <Divider />

              <h4 className="font-bold">មាត្រា ៨: ហត្ថលេខា និងការបញ្ជាក់</h4>
              <p className="mb-8">
                កិច្ចព្រមព្រៀងនេះធ្វើឡើងជាពីរច្បាប់ដូចគ្នា ដែលមានសុពលភាពស្មើគ្នា។
                ភាគីនីមួយៗរក្សាទុកមួយច្បាប់។
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
                  <p className="text-sm mt-2">ហត្ថលេខា និងត្រា</p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-2">ភាគី ខ</p>
                  <p className="text-sm">{user?.full_name}</p>
                  <p className="text-sm text-gray-600">{user?.position || contract.partyB}</p>
                  <div className="mt-4 h-20 border-b-2 border-gray-400"></div>
                  <p className="text-sm mt-2">ហត្ថលេខា និងត្រា</p>
                </div>
              </div>

              <Divider />

              <div className="mt-8 text-center text-gray-500">
                <p className="font-bold">*** ចុងបញ្ចប់នៃកិច្ចសន្យា ***</p>
                <p className="text-sm mt-4">សូមអានដោយប្រុងប្រយ័ត្ន មុនពេលចុះហត្ថលេខា</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Agreement Section - Optimized for Tablet/Desktop */}
        {hasScrolledToBottom && (
          <Card className="mb-8 shadow-md">
            <Space direction="vertical" size="large" className="w-full">
              <Alert
                message={<span className="font-hanuman text-base">អ្នកបានអានកិច្ចសន្យារួចរាល់</span>}
                description={<span className="font-hanuman">ឥឡូវនេះអ្នកអាចយល់ព្រម និងចុះហត្ថលេខាបាន</span>}
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
                ខ្ញុំបានអាន យល់ និងយល់ព្រមតាមលក្ខខណ្ឌទាំងអស់នៃកិច្ចព្រមព្រៀងនេះ
              </Checkbox>

              <div className="flex items-center justify-between">
                <div>
                  {signature ? (
                    <div>
                      <Text className="font-hanuman text-base">ហត្ថលេខា: ✓ បានរក្សាទុក</Text>
                      <Button
                        size="large"
                        onClick={() => setShowSignatureModal(true)}
                        className="ml-3 font-hanuman"
                      >
                        កែប្រែ
                      </Button>
                    </div>
                  ) : (
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => setShowSignatureModal(true)}
                      disabled={!agreed}
                      size="large"
                      className="font-hanuman"
                    >
                      ចុះហត្ថលេខា
                    </Button>
                  )}
                </div>

                <Button
                  type="primary"
                  size="large"
                  loading={signing}
                  onClick={handleSign}
                  disabled={!agreed || !signature}
                  className="font-hanuman px-8 py-6 h-auto text-base"
                >
                  បញ្ជាក់ និងចុះហត្ថលេខា
                </Button>
              </div>
            </Space>
          </Card>
        )}

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
                            className="max-h-40 mx-auto border border-gray-200 rounded"
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