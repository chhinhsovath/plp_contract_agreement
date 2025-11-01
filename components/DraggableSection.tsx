'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Space } from 'antd'
import { HolderOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'

interface DraggableSectionProps {
  id: string
  label: string
  children: React.ReactNode
  editMode: boolean
  isVisible: boolean
  onToggleVisibility: (id: string) => void
}

export function DraggableSection({
  id,
  label,
  children,
  editMode,
  isVisible,
  onToggleVisibility
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isVisible ? 1 : 0.3,
    position: 'relative' as const,
    marginBottom: 16
  }

  if (!editMode) {
    return isVisible ? <div>{children}</div> : null
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag Handle Bar */}
      <div
        className="no-print"
        style={{
          background: isDragging ? '#e6f7ff' : '#f0f0f0',
          border: '1px solid #d9d9d9',
          borderRadius: '4px 4px 0 0',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab',
          marginBottom: -1,
          zIndex: 10
        }}
        {...attributes}
        {...listeners}
      >
        <Space>
          <HolderOutlined style={{ fontSize: 16, color: '#1890ff' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
        </Space>

        <Button
          size="small"
          icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(id)
          }}
          type={isVisible ? 'default' : 'dashed'}
        >
          {isVisible ? 'លាក់' : 'បង្ហាញ'}
        </Button>
      </div>

      {/* Section Content */}
      <div
        style={{
          border: editMode ? '2px dashed #1890ff' : 'none',
          padding: editMode ? 16 : 0,
          background: isDragging ? '#f0f7ff' : 'transparent',
          borderRadius: '0 0 4px 4px',
          minHeight: 40
        }}
      >
        {isVisible && children}
      </div>
    </div>
  )
}
