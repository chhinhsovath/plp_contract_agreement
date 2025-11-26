'use client'

import { Steps } from 'antd'
import { LoginOutlined, FileTextOutlined, SettingOutlined, EditOutlined, DashboardOutlined } from '@ant-design/icons'
import { useContent } from '@/lib/hooks/useContent'
import { useRouter } from 'next/navigation'

interface WorkflowProgressProps {
  currentStep: number // 0=signup, 1=read, 2=configure, 3=sign, 4=dashboard
}

export function WorkflowProgress({ currentStep }: WorkflowProgressProps) {
  const { t } = useContent()
  const router = useRouter()

  const steps = [
    {
      title: t('workflow_step_signup', 'ចុះឈ្មោះ/ចូលប្រើ'),
      icon: <LoginOutlined />,
      onClick: () => router.push('/demo-login')
    },
    {
      title: t('workflow_step_read', 'អានកិច្ចសន្យា'),
      icon: <FileTextOutlined />,
      onClick: () => {
        if (currentStep >= 1) router.push('/contract/sign')
      }
    },
    {
      title: t('workflow_step_configure', 'កំណត់រចនាសម្ព័ន្ធ'),
      icon: <SettingOutlined />,
      onClick: () => {
        if (currentStep >= 2) router.push('/contract/configure')
      }
    },
    {
      title: t('workflow_step_sign', 'ចុះហត្ថលេខា'),
      icon: <EditOutlined />,
      onClick: () => {
        if (currentStep >= 3) router.push('/contract/submit')
      }
    },
    {
      title: t('workflow_step_dashboard', 'ផ្ទាំងគ្រប់គ្រង'),
      icon: <DashboardOutlined />,
      onClick: () => {
        if (currentStep >= 4) router.push('/dashboard')
      }
    },
  ]

  return (
    <div style={{
      background: '#fff',
      padding: '24px',
      marginBottom: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <Steps
        current={currentStep}
        items={steps.map((step, index) => ({
          title: step.title,
          icon: step.icon,
          style: { cursor: index <= currentStep ? 'pointer' : 'not-allowed' },
          disabled: index > currentStep
        }))}
        size="small"
        className="font-hanuman"
        onChange={(step) => {
          if (step <= currentStep) {
            steps[step].onClick()
          }
        }}
      />
    </div>
  )
}
