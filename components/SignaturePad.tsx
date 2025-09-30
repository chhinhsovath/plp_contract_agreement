'use client'

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button, Space } from 'antd'
import { ClearOutlined, SaveOutlined } from '@ant-design/icons'

interface SignaturePadProps {
  onSave: (signature: string) => void
  label?: string
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, label = 'ហត្ថលេខា' }) => {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 200 })

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const width = Math.min(containerWidth - 16, 500) // 16px for padding
        const height = Math.min(Math.floor(width * 0.4), 200) // Maintain aspect ratio
        setCanvasSize({ width, height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const clear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      onSave(signature)
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <div className="signature-pad-container w-full">
      <div className="mb-2">
        <label className="font-medium text-gray-700">{label}</label>
      </div>
      <div ref={containerRef} className="border-2 border-gray-300 rounded-lg p-2 bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'signature-canvas',
            width: canvasSize.width,
            height: canvasSize.height,
            style: {
              border: '1px dashed #ccc',
              borderRadius: '4px',
              width: '100%',
              touchAction: 'none'
            }
          }}
          onBegin={handleBegin}
        />
      </div>
      <Space className="mt-2">
        <Button
          icon={<ClearOutlined />}
          onClick={clear}
          disabled={isEmpty}
        >
          សម្អាត
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={save}
          disabled={isEmpty}
        >
          រក្សាទុកហត្ថលេខា
        </Button>
      </Space>
    </div>
  )
}

export default SignaturePad