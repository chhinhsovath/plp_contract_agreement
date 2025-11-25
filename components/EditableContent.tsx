'use client'

import { useState } from 'react'
import { Modal, Input, Button, message, Tooltip } from 'antd'
import { EditOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface EditableContentProps {
  contentKey: string
  children: React.ReactNode
  isAdmin: boolean
  onUpdate?: () => void
  multiline?: boolean
  label?: string
}

export function EditableContent({
  contentKey,
  children,
  isAdmin,
  onUpdate,
  multiline = false,
  label
}: EditableContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleEdit = () => {
    // Extract text content from children
    const textContent = typeof children === 'string'
      ? children
      : extractTextFromChildren(children)
    setEditValue(textContent)
    setIsModalOpen(true)
  }

  const extractTextFromChildren = (node: any): string => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(extractTextFromChildren).join('')
    if (node?.props?.children) return extractTextFromChildren(node.props.children)
    return ''
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/content-texts/${contentKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_khmer: editValue
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update content')
      }

      message.success('បានធ្វើបច្ចុប្បន្នភាពខ្លឹមសារ')
      setIsModalOpen(false)

      // Reload the page to show updated content
      if (onUpdate) {
        onUpdate()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Update error:', error)
      message.error('មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          backgroundColor: isHovered ? '#fff7e6' : 'transparent',
          borderRadius: '4px',
          padding: isHovered ? '2px 4px' : '0',
          transition: 'all 0.2s',
          border: isHovered ? '1px dashed #ffa940' : '1px dashed transparent'
        }}
        onClick={handleEdit}
      >
        {children}
        {isHovered && (
          <Tooltip title="កែសម្រួលខ្លឹមសារ">
            <EditOutlined
              style={{
                marginLeft: '8px',
                color: '#1890ff',
                fontSize: '14px'
              }}
            />
          </Tooltip>
        )}
      </span>

      <Modal
        title={
          <div>
            <EditOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            កែសម្រួលខ្លឹមសារ {label && `- ${label}`}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            បោះបង់
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={handleSave}
          >
            រក្សាទុក
          </Button>
        ]}
        width={600}
      >
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <div style={{ marginBottom: '8px', color: '#8c8c8c', fontSize: '12px' }}>
            Content Key: <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>{contentKey}</code>
          </div>
          {multiline ? (
            <TextArea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={6}
              placeholder="បញ្ចូលខ្លឹមសារ..."
              style={{ fontFamily: 'Hanuman, serif' }}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="បញ្ចូលខ្លឹមសារ..."
              style={{ fontFamily: 'Hanuman, serif' }}
            />
          )}
        </div>
      </Modal>
    </>
  )
}
