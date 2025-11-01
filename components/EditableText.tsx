'use client'

import { useState, useRef, useEffect } from 'react'
import { message } from 'antd'
import { EditOutlined } from '@ant-design/icons'

interface EditableTextProps {
  value: string
  onSave: (newValue: string) => Promise<void> | void
  editMode: boolean
  multiline?: boolean
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'td'
}

export function EditableText({
  value,
  onSave,
  editMode,
  multiline = false,
  placeholder = '',
  className = '',
  style = {},
  as = 'span'
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    try {
      await onSave(editValue.trim())
      message.success('បានរក្សាទុក', 1)
      setIsEditing(false)
    } catch (error) {
      message.error('មានបញ្ហា')
      setEditValue(value)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      handleSave()
    }
  }

  if (!editMode) {
    const Component = as
    return <Component className={className} style={style}>{value || placeholder}</Component>
  }

  const editableStyle: React.CSSProperties = {
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    transition: 'all 0.2s',
    display: 'inline-block',
    position: 'relative',
    ...style
  }

  const hoverStyle: React.CSSProperties = {
    background: '#e6f7ff',
    outline: '1px dashed #1890ff'
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    border: '2px solid #1890ff',
    background: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    width: '100%',
    outline: 'none'
  }

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={className}
        style={{
          ...inputStyle,
          minHeight: 60,
          resize: 'vertical'
        }}
        disabled={saving}
      />
    ) : (
      <input
        ref={inputRef as any}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={className}
        style={inputStyle}
        disabled={saving}
      />
    )
  }

  const Component = as

  return (
    <Component
      className={className}
      style={editableStyle}
      onClick={() => setIsEditing(true)}
      onMouseEnter={(e: any) => {
        Object.assign(e.currentTarget.style, hoverStyle)
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.outline = 'none'
      }}
    >
      {value || placeholder}
      <EditOutlined style={{ marginLeft: 6, fontSize: 10, opacity: 0.5, color: '#1890ff' }} />
    </Component>
  )
}
