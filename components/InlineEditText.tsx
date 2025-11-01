'use client'

import { useState } from 'react'
import { Input, message } from 'antd'
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface InlineEditTextProps {
  value: string
  onSave: (newValue: string) => Promise<void>
  multiline?: boolean
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
}

export function InlineEditText({
  value,
  onSave,
  multiline = false,
  className = '',
  style = {},
  disabled = false
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    try {
      await onSave(editValue)
      message.success('បានរក្សាទុក')
      setIsEditing(false)
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការរក្សាទុក')
      setEditValue(value) // Revert on error
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (disabled) {
    return <span className={className} style={style}>{value}</span>
  }

  if (isEditing) {
    return (
      <div style={{ display: 'inline-block', width: '100%', ...style }}>
        {multiline ? (
          <TextArea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 10 }}
            className={className}
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
              if (e.key === 'Enter' && e.ctrlKey) handleSave()
            }}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={className}
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
              if (e.key === 'Enter') handleSave()
            }}
            suffix={
              <span style={{ display: 'flex', gap: 4 }}>
                <CheckOutlined
                  style={{ color: '#52c41a', cursor: 'pointer' }}
                  onClick={handleSave}
                />
                <CloseOutlined
                  style={{ color: '#ff4d4f', cursor: 'pointer' }}
                  onClick={handleCancel}
                />
              </span>
            }
          />
        )}
      </div>
    )
  }

  return (
    <span
      className={className}
      style={{
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: 4,
        transition: 'all 0.2s',
        display: 'inline-block',
        ...style
      }}
      onClick={() => setIsEditing(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e6f7ff'
        e.currentTarget.style.outline = '1px dashed #1890ff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.outline = 'none'
      }}
    >
      {value}
      <EditOutlined style={{ marginLeft: 8, fontSize: 12, color: '#1890ff', opacity: 0.6 }} />
    </span>
  )
}
