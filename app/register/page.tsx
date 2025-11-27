'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, message, Radio, Space, Divider, Card, Row, Col, Select } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, BankOutlined, SolutionOutlined, LoginOutlined, FileTextOutlined, TeamOutlined, BookOutlined, HomeOutlined, SafetyOutlined, CheckCircleOutlined, RocketOutlined, ThunderboltOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import geoService, { Province, District, Commune, Village, School } from '@/lib/services/geoService'

const { Title, Text, Paragraph } = Typography

// Only show agreement types 4 and 5 for public registration
const CONTRACT_TYPES = [
  {
    id: 4,
    icon: <BookOutlined />,
    title: 'កិច្ចព្រមព្រៀងនាយកដ្ឋាន-ស្រុក',
    subtitle: 'នាយកដ្ឋានបឋមសិក្សា និងការិយាល័យអប់រំស្រុក',
    description: 'សម្រាប់ការិយាល័យអប់រំស្រុក/ក្រុង/ខណ្ឌ',
  },
  {
    id: 5,
    icon: <HomeOutlined />,
    title: 'កិច្ចព្រមព្រៀងនាយកដ្ឋាន-សាលា',
    subtitle: 'នាយកដ្ឋានបឋមសិក្សា និងសាលារៀន',
    description: 'សម្រាប់សាលាបឋមសិក្សា',
  },
]

export default function RegisterPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Geographic location states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [schools, setSchools] = useState<School[]>([])

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)
  const [loadingSchools, setLoadingSchools] = useState(false)

  // Selected IDs (for cascading)
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
  const [selectedCommuneId, setSelectedCommuneId] = useState<number | null>(null)
  const [selectedContractType, setSelectedContractType] = useState<number | null>(null)

  // Track if user has selected contract type
  const [hasSelectedContractType, setHasSelectedContractType] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load functions for cascading selection
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true)
      const data = await geoService.getProvinces()
      setProvinces(data)
    } catch (error) {
      console.error('Failed to load provinces:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកខេត្ត')
    } finally {
      setLoadingProvinces(false)
    }
  }

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true)
      setDistricts([])
      setCommunes([])
      setVillages([])
      setSchools([])
      form.setFieldValue('districtId', null)
      form.setFieldValue('communeId', null)
      form.setFieldValue('villageId', null)
      form.setFieldValue('schoolId', null)

      const data = await geoService.getDistricts(provinceId)
      setDistricts(data)
    } catch (error) {
      console.error('Failed to load districts:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកស្រុក/ខណ្ឌ')
    } finally {
      setLoadingDistricts(false)
    }
  }

  const loadCommunes = async (districtId: number) => {
    try {
      setLoadingCommunes(true)
      setCommunes([])
      setVillages([])
      form.setFieldValue('communeId', null)
      form.setFieldValue('villageId', null)

      const data = await geoService.getCommunes(districtId)
      setCommunes(data)
    } catch (error) {
      console.error('Failed to load communes:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកឃុំ/សង្កាត់')
    } finally {
      setLoadingCommunes(false)
    }
  }

  const loadVillages = async (communeId: number) => {
    try {
      setLoadingVillages(true)
      setVillages([])
      form.setFieldValue('villageId', null)

      const data = await geoService.getVillages(communeId)
      setVillages(data)
    } catch (error) {
      console.error('Failed to load villages:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកភូមិ')
    } finally {
      setLoadingVillages(false)
    }
  }

  const loadSchools = async (districtId: number) => {
    try {
      setLoadingSchools(true)
      setSchools([])
      form.setFieldValue('schoolId', null)

      const data = await geoService.getSchoolsByDistrict(districtId)
      setSchools(data)
    } catch (error) {
      console.error('Failed to load schools:', error)
      message.error('មានបញ្ហាក្នុងការទាញយកសាលា')
    } finally {
      setLoadingSchools(false)
    }
  }

  // Handle Contract Agreement 5 Login (External API)
  const handleContract5Login = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('https://plp-api.moeys.gov.kh/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.accessToken) {
        message.success('ការចូលប្រើប្រាស់បានជោគជ័យ! កំពុងផ្ទេរទៅទំព័រកម្មវិធី...')

        // Store the external user data and token
        localStorage.setItem('external_access_token', data.accessToken)
        localStorage.setItem('external_user', JSON.stringify(data.user))
        localStorage.setItem('user_contract_type', '5')

        // TODO: You may need to create a user record in your local database
        // or sync with your system here

        setTimeout(() => {
          router.push('/contract/configure')
        }, 1500)
      } else {
        message.error(data.message || 'ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ')
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('កំហុសក្នុងការតភ្ជាប់ទៅម៉ាស៊ីនមេ')
    } finally {
      setLoading(false)
    }
  }

  // Handle Contract Agreement 4 Registration (Signup)
  const handleContract4Signup = async (values: any) => {
    // Extract last 4 digits of phone number as passcode
    const phoneNumber = values.phone_number.replace(/\D/g, '') // Remove non-digits
    const passcode = phoneNumber.slice(-4)

    if (phoneNumber.length < 9) {
      message.error('លេខទូរស័ព្ទមិនត្រឹមត្រូវ')
      return
    }

    // Get selected location names from IDs
    let provinceName = ''
    let districtName = ''
    let communeName = ''
    let villageName = ''
    let schoolName = ''

    if (values.provinceId) {
      const province = provinces.find(p => p.id === values.provinceId)
      if (province) provinceName = province.province_name_kh
    }
    if (values.districtId) {
      const district = districts.find(d => d.id === values.districtId)
      if (district) districtName = district.district_name_kh
    }
    if (values.communeId) {
      const commune = communes.find(c => c.id === values.communeId)
      if (commune) communeName = commune.commune_name_kh
    }
    if (values.villageId) {
      const village = villages.find(v => v.id === values.villageId)
      if (village) villageName = village.village_name_kh
    }
    if (values.schoolId) {
      const school = schools.find(s => s.schoolId === values.schoolId)
      if (school) schoolName = school.name
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: values.full_name,
          phone_number: phoneNumber,
          passcode: passcode,
          contract_type: 4, // Always contract type 4 for signup
          organization: values.organization,
          position: values.position,
          email: values.email,
          // Geographic location names
          province_name: provinceName,
          district_name: districtName,
          commune_name: communeName,
          village_name: villageName,
          school_name: schoolName,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        message.success(`ការចុះឈ្មោះបានជោគជ័យ! កំពុងផ្ទេរទៅទំព័រកម្មវិធី...`)
        // Store contract type preference
        localStorage.setItem('user_contract_type', '4')

        // Auto-login after successful registration
        setTimeout(async () => {
          try {
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone_number: phoneNumber,
                passcode: passcode,
              }),
            })

            const loginData = await loginResponse.json()

            if (loginResponse.ok) {
              // Redirect based on signing requirements
              const requiresContractSigning = loginData.requiresContractSigning

              if (requiresContractSigning) {
                router.push('/contract/configure')
              } else {
                router.push('/dashboard')
              }
            } else {
              message.error(loginData.error || 'ការចូលប្រើប្រាស់មិនជោគជ័យ')
              router.push('/login')
            }
          } catch (error) {
            message.error('កំហុសក្នុងការតភ្ជាប់')
            router.push('/login')
          }
        }, 1500)
      } else {
        message.error(data.error || 'ការចុះឈ្មោះមិនជោគជ័យ')
      }
    } catch (error) {
      message.error('កំហុសក្នុងការតភ្ជាប់')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Row style={{ maxWidth: 1200, width: '100%' }} gutter={[48, 48]}>
        {/* Left Side - Branding */}
        <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Logo & Brand */}
            <Space size="middle" align="center">
              <div style={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
              }}>
                <SafetyOutlined style={{ fontSize: 48, color: '#fff' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                  ប្រព័ន្ធ PLP
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀង
                </Text>
              </div>
            </Space>

            {/* Welcome Message */}
            <div>
              <Title level={1} style={{ marginBottom: 16, fontSize: 42, color: '#262626' }}>
                ចុះឈ្មោះគណនីថ្មី
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#595959', marginBottom: 32 }}>
                បង្កើតគណនីរបស់អ្នក ដើម្បីចាប់ផ្តើមប្រើប្រាស់ប្រព័ន្ធ
              </Paragraph>
            </div>

            {/* Registration Steps */}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card variant="borderless" style={{ background: '#f6ffed', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#52c41a',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <UserOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      ព័ត៌មានផ្ទាល់ខ្លួន
                    </Title>
                    <Text type="secondary">
                      ឈ្មោះពេញ និងលេខទូរស័ព្ទសម្រាប់ចូលប្រើ
                    </Text>
                  </div>
                </Space>
              </Card>

              <Card variant="borderless" style={{ background: '#e6f7ff', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#1890ff',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileTextOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
                    </Title>
                    <Text type="secondary">
                      ជ្រើសរើសកិច្ចព្រមព្រៀងដែលពាក់ព័ន្ធនឹងតួនាទីរបស់អ្នក
                    </Text>
                  </div>
                </Space>
              </Card>

              <Card variant="borderless" style={{ background: '#fffbe6', border: 'none' }}>
                <Space align="start" size="middle">
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#faad14',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <BankOutlined style={{ fontSize: 24, color: '#fff' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      ព័ត៌មានស្ថាប័ន
                    </Title>
                    <Text type="secondary">
                      ស្ថាប័ន និងតួនាទីការងាររបស់អ្នក (ស្រេចចិត្ត)
                    </Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Space>
        </Col>

        {/* Right Side - Registration Form */}
        <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center' }}>
          <Card
            style={{
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {!hasSelectedContractType ? 'ជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង' : selectedContractType === 4 ? 'ចុះឈ្មោះ (កិច្ចព្រមព្រៀងប្រភេទ 4)' : 'ចូលប្រើប្រាស់ (កិច្ចព្រមព្រៀងប្រភេទ 5)'}
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                {!hasSelectedContractType
                  ? 'សូមជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀងដែលអ្នកចង់ប្រើ'
                  : selectedContractType === 4
                    ? 'សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនី'
                    : 'សូមចូលប្រើប្រាស់ដោយប្រើឈ្មោះអ្នកប្រើ និងលេខសម្ងាត់របស់អ្នក'
                }
              </Text>
            </div>

            {/* Step 1: Contract Type Selection */}
            {!hasSelectedContractType && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {CONTRACT_TYPES.map(type => (
                      <Card
                        key={type.id}
                        hoverable
                        onClick={() => {
                          setSelectedContractType(type.id)
                          setHasSelectedContractType(true)
                        }}
                        style={{
                          cursor: 'pointer',
                          border: '2px solid #d9d9d9',
                          transition: 'all 0.3s'
                        }}
                        bodyStyle={{ padding: '20px' }}
                      >
                        <Space align="start" size="large" style={{ width: '100%' }}>
                          <div style={{
                            fontSize: 48,
                            color: type.id === 4 ? '#52c41a' : '#1890ff',
                          }}>
                            {type.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
                              {type.title}
                            </div>
                            <div style={{ fontSize: 15, color: '#595959', marginBottom: 6 }}>
                              {type.subtitle}
                            </div>
                            <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                              {type.description}
                            </div>
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 13, color: type.id === 4 ? '#52c41a' : '#1890ff', fontWeight: 500 }}>
                                {type.id === 4 ? 'ចុចដើម្បីចុះឈ្មោះ →' : 'ចុចដើម្បីចូលប្រើប្រាស់ →'}
                              </Text>
                            </div>
                          </div>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </div>

                <Card
                  size="small"
                  style={{ background: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: 24 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>ជំនួយ:</strong> ប្រភេទកិច្ចព្រមព្រៀងនេះនឹងកំណត់សិទ្ធិចូលប្រើប្រាស់របស់អ្នក
                  </Text>
                </Card>
              </>
            )}

            {/* Step 2: Contract Agreement 5 - Login Form */}
            {hasSelectedContractType && selectedContractType === 5 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleContract5Login}
                size="large"
              >
                <div style={{ marginBottom: 24 }}>
                  <Title level={5} style={{ marginBottom: 16 }}>
                    ចូលប្រើប្រាស់ប្រព័ន្ធ PLP
                  </Title>

                  <Form.Item
                    name="username"
                    label="ឈ្មោះអ្នកប្រើ"
                    rules={[{ required: true, message: 'សូមបំពេញឈ្មោះអ្នកប្រើ' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="បញ្ចូលឈ្មោះអ្នកប្រើ"
                      autoComplete="username"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="លេខសម្ងាត់"
                    rules={[{ required: true, message: 'សូមបំពេញលេខសម្ងាត់' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.Password
                      prefix={<LoginOutlined />}
                      placeholder="បញ្ចូលលេខសម្ងាត់"
                      autoComplete="current-password"
                    />
                  </Form.Item>
                </div>

                <Card
                  size="small"
                  style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 24 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>សំខាន់:</strong> សូមប្រើឈ្មោះអ្នកប្រើ និងលេខសម្ងាត់របស់អ្នកពីប្រព័ន្ធ PLP
                  </Text>
                </Card>

                {/* Submit Button */}
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<LoginOutlined />}
                    style={{ height: 48 }}
                  >
                    ចូលប្រើប្រាស់
                  </Button>
                </Form.Item>

                {/* Back Button */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    block
                    onClick={() => {
                      setHasSelectedContractType(false)
                      setSelectedContractType(null)
                      form.resetFields()
                    }}
                    style={{ height: 40 }}
                  >
                    ← ត្រឡប់ទៅជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Step 3: Contract Agreement 4 - Signup Form */}
            {hasSelectedContractType && selectedContractType === 4 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleContract4Signup}
                size="large"
              >
                {/* Personal Information */}
                <div style={{ marginBottom: 24 }}>
                  <Title level={5} style={{ marginBottom: 16 }}>
                    ព័ត៌មានផ្ទាល់ខ្លួន
                  </Title>

                  <Form.Item
                    name="full_name"
                    label="ឈ្មោះពេញ"
                    rules={[{ required: true, message: 'សូមបំពេញឈ្មោះពេញ' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="ឈ្មោះពេញជាភាសាខ្មែរ"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone_number"
                    label="លេខទូរស័ព្ទ"
                    rules={[
                      { required: true, message: 'សូមបំពេញលេខទូរស័ព្ទ' },
                      { pattern: /^[0-9]{9,12}$/, message: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="0123456789"
                      maxLength={12}
                    />
                  </Form.Item>

                  <Card
                    size="small"
                    style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 0 }}
                  >
                    <Text style={{ fontSize: 14 }}>
                      <strong>សំខាន់:</strong> លេខ 4 ខ្ទង់ចុងក្រោយនៃលេខទូរស័ព្ទនឹងក្លាយជាលេខសម្ងាត់របស់អ្នក
                    </Text>
                  </Card>
                </div>

              {/* Organization Information */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  ព័ត៌មានស្ថាប័ន <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>(ស្រេចចិត្ត)</Text>
                </Title>

                <Form.Item
                  name="organization"
                  label="ស្ថាប័ន/អង្គភាព"
                >
                  <Input
                    prefix={<BankOutlined />}
                    placeholder="ឈ្មោះស្ថាប័ន"
                  />
                </Form.Item>

                <Form.Item
                  name="position"
                  label="តួនាទីការងារ"
                >
                  <Input
                    prefix={<SolutionOutlined />}
                    placeholder="តួនាទីការងារ"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="អ៊ីមែល"
                  rules={[{ type: 'email', message: 'អ៊ីមែលមិនត្រឹមត្រូវ' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                  />
                </Form.Item>
              </div>

              {/* Geographic Information */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <EnvironmentOutlined /> ព័ត៌មានភូមិសាស្ត្រ
                </Title>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="provinceId"
                      label="ខេត្ត/រាជធានី"
                      rules={[{ required: true, message: 'សូមជ្រើសរើសខេត្ត' }]}
                    >
                      <Select
                        placeholder="ជ្រើសរើសខេត្ត"
                        loading={loadingProvinces}
                        showSearch
                        optionFilterProp="label"
                        onChange={(value) => {
                          setSelectedProvinceId(value)
                          loadDistricts(value)
                        }}
                        options={provinces.map(province => ({
                          value: province.id,
                          label: province.province_name_kh
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="districtId"
                      label="ស្រុក/ខណ្ឌ"
                      rules={[{ required: true, message: 'សូមជ្រើសរើសស្រុក/ខណ្ឌ' }]}
                    >
                      <Select
                        placeholder="ជ្រើសរើសស្រុក/ខណ្ឌ"
                        loading={loadingDistricts}
                        disabled={!selectedProvinceId}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        onChange={(value) => {
                          setSelectedDistrictId(value)
                          if (value) {
                            loadCommunes(value)
                          } else {
                            setCommunes([])
                            setVillages([])
                            form.setFieldValue('communeId', null)
                            form.setFieldValue('villageId', null)
                          }
                        }}
                        options={districts.map(district => ({
                          value: district.id,
                          label: district.district_name_kh
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="communeId"
                      label="ឃុំ/សង្កាត់"
                    >
                      <Select
                        placeholder="ជ្រើសរើសឃុំ/សង្កាត់"
                        loading={loadingCommunes}
                        disabled={!selectedDistrictId}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        onChange={(value) => {
                          setSelectedCommuneId(value)
                          if (value) {
                            loadVillages(value)
                          } else {
                            setVillages([])
                            form.setFieldValue('villageId', null)
                          }
                        }}
                        options={communes.map(commune => ({
                          value: commune.id,
                          label: commune.commune_name_kh
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="villageId"
                      label="ភូមិ"
                    >
                      <Select
                        placeholder="ជ្រើសរើសភូមិ"
                        loading={loadingVillages}
                        disabled={!selectedCommuneId}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        options={villages.map(village => ({
                          value: village.id,
                          label: village.village_name_kh
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Card
                  size="small"
                  style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginBottom: 0 }}
                >
                  <Text style={{ fontSize: 14 }}>
                    <strong>សំខាន់:</strong> សូមជ្រើសរើសខេត្ត និងស្រុក/ខណ្ឌ
                  </Text>
                </Card>
              </div>

              {/* Submit Button */}
              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<RocketOutlined />}
                  style={{ height: 48 }}
                >
                  ចុះឈ្មោះគណនី
                </Button>
              </Form.Item>

              {/* Back Button */}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  block
                  onClick={() => {
                    setHasSelectedContractType(false)
                    setSelectedContractType(null)
                    form.resetFields()
                  }}
                  style={{ height: 40 }}
                >
                  ← ត្រឡប់ទៅជ្រើសរើសប្រភេទកិច្ចព្រមព្រៀង
                </Button>
              </Form.Item>
              </Form>
            )}

            {/* Common Footer Links */}
            {hasSelectedContractType && (
              <>
                <Divider plain>ឬ</Divider>

                <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                  <Text type="secondary">
                    មានគណនីរួចហើយ?
                  </Text>
                  <Link href="/login" style={{ width: '100%', display: 'block' }}>
                    <Button
                      size="large"
                      block
                      icon={<LoginOutlined />}
                      style={{ height: 48 }}
                    >
                      ចូលប្រើប្រាស់
                    </Button>
                  </Link>
                </Space>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Link href="/">
                    <Text type="secondary">
                      ← ត្រឡប់ទៅទំព័រដើម
                    </Text>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
