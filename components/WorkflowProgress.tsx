'use client'

import { Steps } from 'antd'
import { LoginOutlined, FileTextOutlined, SettingOutlined, EditOutlined, DashboardOutlined } from '@ant-design/icons'
import { useContent } from '@/lib/hooks/useContent'

interface WorkflowProgressProps {
  currentStep: number // 0=signup, 1=read, 2=configure, 3=sign, 4=dashboard
}

export function WorkflowProgress({ currentStep }: WorkflowProgressProps) {
  const { t } = useContent()

  const steps = [
    {
      title: t('workflow_step_signup', 'ចុះឈ្មោះ/ចូលប្រើ'),
      icon: <LoginOutlined />,
    },
    {
      title: t('workflow_step_read', 'អានកិច្ចសន្យា'),
      icon: <FileTextOutlined />,
    },
    {
      title: t('workflow_step_configure', 'កំណត់រចនាសម្ព័ន្ធ'),
      icon: <SettingOutlined />,
    },
    {
      title: t('workflow_step_sign', 'ចុះហត្ថលេខា'),
      icon: <EditOutlined />,
    },
    {
      title: t('workflow_step_dashboard', 'ផ្ទាំងគ្រប់គ្រង'),
      icon: <DashboardOutlined />,
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
        items={steps}
        size="small"
        className="font-hanuman"
      />
    </div>
  )
}
