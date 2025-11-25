'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Spin, Button, Switch, Space, message, Modal } from 'antd'
import { EditOutlined, SaveOutlined, PrinterOutlined, ArrowLeftOutlined, DatabaseOutlined } from '@ant-design/icons'
import { RichTextEditor } from '@/components/RichTextEditor'
import { ContractJSONEditor } from '@/components/ContractJSONEditor'
import { generateContractHTML } from '@/lib/contractHTMLGenerator'

export default function ContractPrintPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [contractData, setContractData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('simple') // NEW: Editor mode toggle
  const [editedFields, setEditedFields] = useState<any>({})
  const [saving, setSaving] = useState(false)

  // Section reordering state
  const DEFAULT_SECTIONS = [
    { id: 'header', label: 'បឋមកថា', moveable: false },
    { id: 'title', label: 'ចំណងជើង', moveable: true },
    { id: 'parties', label: 'តារាងភាគី', moveable: true },
    { id: 'intro', label: 'អត្ថបទផ្តើម', moveable: true },
    { id: 'deliverables', label: 'សមិទ្ធកម្ម', moveable: true },
    { id: 'signatures', label: 'ហត្ថលេខា', moveable: false }
  ]

  const [sectionOrder, setSectionOrder] = useState<string[]>(
    DEFAULT_SECTIONS.map(s => s.id)
  )
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({}) // NEW: Track section visibility
  const [layoutChanged, setLayoutChanged] = useState(false)

  // Rich text editor state (Advanced mode)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({})
  const [showRichEditor, setShowRichEditor] = useState(false)
  const [showJSONEditor, setShowJSONEditor] = useState(false)
  const [showFullPageEditor, setShowFullPageEditor] = useState(false)
  const [fullDocumentHTML, setFullDocumentHTML] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      await checkSession()
      await fetchContractData()
    }
    init()
  }, [])

  // Load section order from contractData
  useEffect(() => {
    if (contractData?.section_order) {
      setSectionOrder(contractData.section_order)
    }
  }, [contractData])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    }
  }

  const fetchContractData = async () => {
    try {
      const response = await fetch(`/api/contracts/print/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContractData(data)
      } else {
        router.push('/me-dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch contract:', error)
      router.push('/me-dashboard')
    } finally {
      setLoading(false)
    }
  }

  const canEdit = () => {
    if (!user || !contractData) {
      console.log('canEdit: user or contractData missing', { user: !!user, contractData: !!contractData })
      return false
    }
    // Contract owner can edit their own contract
    const isOwner = contractData.created_by_id === user.id
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'COORDINATOR'].includes(user.role)

    console.log('canEdit check:', {
      userId: user.id,
      createdById: contractData.created_by_id,
      isOwner,
      userRole: user.role,
      isAdmin,
      result: isOwner || isAdmin
    })

    if (isOwner) return true
    if (isAdmin) return true
    return false
  }

  const handleFieldChange = (field: string, value: string) => {
    setEditedFields({ ...editedFields, [field]: value })
  }

  const handleSaveChanges = async () => {
    if (Object.keys(editedFields).length === 0) {
      message.info('មិនមានការផ្លាស់ប្តូរ')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/contracts/${params.id}/update-party-b`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedFields)
      })

      if (response.ok) {
        message.success('បានរក្សាទុកការផ្លាស់ប្តូរ')
        setEditedFields({})
        setEditMode(false)
        // Reload contract data
        await fetchContractData()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហាក្នុងការរក្សាទុក')
      }
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    } finally {
      setSaving(false)
    }
  }

  const getCurrentValue = (field: string) => {
    return editedFields[field] !== undefined ? editedFields[field] : contractData[field] || ''
  }

  const renderEditableField = (field: string, value: string, placeholder: string = '') => {
    if (!editMode) return value || placeholder

    return (
      <input
        type="text"
        value={getCurrentValue(field)}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        placeholder={placeholder}
        style={{
          fontFamily: 'Hanuman, serif',
          fontSize: '11pt',
          border: '1px dashed #1890ff',
          background: '#e6f7ff',
          padding: '2px 8px',
          borderRadius: 4,
          width: '100%',
          maxWidth: 400
        }}
        className="editable-field"
      />
    )
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newOrder.length) return

    // Swap positions
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]

    setSectionOrder(newOrder)
    setLayoutChanged(true)
  }

  const handleSaveLayout = async () => {
    try {
      const response = await fetch(`/api/contracts/${params.id}/section-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_order: sectionOrder })
      })

      if (response.ok) {
        message.success('បានរក្សាទុករចនាសម្ព័ន្ធ')
        setLayoutChanged(false)
      } else {
        message.error('មានបញ្ហាក្នុងការរក្សាទុក')
      }
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    }
  }

  const handleResetLayout = async () => {
    try {
      const response = await fetch(`/api/contracts/${params.id}/section-order`, {
        method: 'POST'
      })

      if (response.ok) {
        message.success('បានកំណត់រចនាសម្ព័ន្ធឡើងវិញ')
        setSectionOrder(DEFAULT_SECTIONS.map(s => s.id))
        setLayoutChanged(false)
        await fetchContractData()
      }
    } catch (error) {
      message.error('មានបញ្ហា')
    }
  }

  const handleEditSectionContent = (sectionId: string) => {
    setEditingSection(sectionId)
    setShowRichEditor(true)
  }

  const handleSaveSectionContent = async (html: string) => {
    if (!editingSection) return

    try {
      // Store section content for now (will save to DB later)
      setSectionContent(prev => ({ ...prev, [editingSection]: html }))
      setShowRichEditor(false)
      setEditingSection(null)
      message.success('បានរក្សាទុកខ្លឹមសារ')
    } catch (error) {
      message.error('មានបញ្ហា')
    }
  }

  const handleSaveFullJSON = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/contracts/${params.id}/update-full`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        message.success('បានធ្វើបច្ចុប្បន្នភាពទាំងអស់')
        setShowJSONEditor(false)
        // Reload contract data
        await fetchContractData()
      } else {
        const data = await response.json()
        message.error(data.error || 'មានបញ្ហា')
      }
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
      throw error
    }
  }

  const handleOpenFullPageEditor = () => {
    // Load existing HTML or generate from JSON
    const html = contractData.contract_html || generateContractHTML(contractData)
    setFullDocumentHTML(html)
    setShowFullPageEditor(true)
  }

  const handleSaveFullDocument = async (html: string) => {
    try {
      const response = await fetch(`/api/contracts/${params.id}/save-html`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
      })

      if (response.ok) {
        message.success('បានរក្សាទុកឯកសារ')
        setShowFullPageEditor(false)
        await fetchContractData()
      } else {
        message.error('មានបញ្ហា')
      }
    } catch (error) {
      message.error('មានបញ្ហាក្នុងការតភ្ជាប់')
    }
  }

  const handlePrint = async () => {
    try {
      // Track download
      await fetch(`/api/contracts/${params.id}/track-download`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to track download:', error)
    }

    // Print
    window.print()
  }

  const renderSectionWithControls = (sectionId: string, content: React.ReactNode, index: number) => {
    const section = DEFAULT_SECTIONS.find(s => s.id === sectionId)
    if (!section) return content

    if (!editMode || !canEdit()) {
      return <div key={sectionId}>{content}</div>
    }

    const isFirst = index === 0
    const isLast = index === sectionOrder.length - 1

    // ADVANCED MODE: Rich text editor
    if (editorMode === 'advanced') {
      return (
        <div key={sectionId} style={{ position: 'relative', marginBottom: 16 }}>
          <div className="no-print" style={{
            background: '#f0f7ff',
            border: '2px solid #1890ff',
            borderRadius: 4,
            padding: 12,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => section.moveable && handleEditSectionContent(sectionId)}
          onMouseEnter={(e) => {
            if (section.moveable) {
              e.currentTarget.style.background = '#bae7ff'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f0f7ff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Space>
                <span style={{ fontWeight: 600, color: '#1890ff' }}>📝 {section.label}</span>
                {section.moveable && <span style={{ fontSize: 12, color: '#8c8c8c' }}>ចុចដើម្បីកែប្រែ</span>}
              </Space>
            </div>
            {sectionContent[sectionId] ? (
              <div dangerouslySetInnerHTML={{ __html: sectionContent[sectionId] }} />
            ) : (
              content
            )}
          </div>
        </div>
      )
    }

    // SIMPLE MODE: Up/down arrows (existing)
    return (
      <div key={sectionId} style={{ position: 'relative', marginBottom: 16 }}>
        {section.moveable && (
          <div className="no-print" style={{
            position: 'absolute',
            top: -10,
            right: 0,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            padding: '4px 8px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            zIndex: 100,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>{section.label}</span>
            <Button
              size="small"
              disabled={isFirst}
              onClick={() => moveSection(index, 'up')}
              style={{ padding: '0 8px', height: 24 }}
            >
              ↑
            </Button>
            <Button
              size="small"
              disabled={isLast}
              onClick={() => moveSection(index, 'down')}
              style={{ padding: '0 8px', height: 24 }}
            >
              ↓
            </Button>
          </div>
        )}
        <div style={{
          border: editMode && section.moveable ? '1px dashed #1890ff' : 'none',
          padding: editMode && section.moveable ? 8 : 0
        }}>
          {content}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!contractData) {
    return null
  }

  const isContractType4 = contractData.contract_type_id === 4
  const isContractType5 = contractData.contract_type_id === 5
  const partyBTitle = isContractType4 ? 'ប្រធានការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ' : 'នាយកសាលា/នាយករង/នាយកស្រ្តីទី'

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100;300;400;700;900&family=Moul&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'Tacteing';
          src: url('/fonts/tacteing.woff2') format('woff2'),
               url('/fonts/tacteing.woff') format('woff'),
               url('/fonts/tacteing.ttf') format('truetype');
          font-display: swap;
          font-weight: normal;
          font-style: normal;
        }

        @page {
          size: A4;
          margin: 1cm 1.5cm;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page-break {
            page-break-after: always;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Hanuman', serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #000;
          background: #fff;
        }

        .contract-container {
          max-width: 21cm;
          margin: 0 auto;
          background: white;
          padding: 0.5cm;
        }

        .header {
          margin-bottom: 1cm;
        }

        .header-line {
          font-family: 'Moul', serif !important;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.8;
        }
        
        .header-line.centered {
          text-align: center;
        }
        
        .header-line:not(.centered) {
          text-align: left;
        }

        .header-underline {
          text-decoration: underline;
        }

        .title {
          font-family: 'Moul', serif !important;
          font-size: 16px;
          font-weight: 400;
          margin: 0.5cm 0;
          text-align: center;
          line-height: 1.8;
        }

        .implementer-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 0.1cm 0;
          table-layout: fixed;
        }

        .implementer-table td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: top;
          font-size: 10pt;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .implementer-table .label-col {
          width: 40%;
          font-weight: bold;
        }

        .intro-text {
          margin: 0.1cm 0;
          text-align: justify;
          font-size: 11pt;
          line-height: 1.8;
        }

        .deliverables-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.1cm 0 0.5cm 0;
          table-layout: fixed;
        }

        .deliverables-table th,
        .deliverables-table td {
          border: 1px solid #000;
          padding: 5px;
          vertical-align: top;
          text-align: left;
          font-size: 10pt;
          word-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow-wrap: break-word;
        }

        .deliverables-table th {
          font-weight: 700;
          text-align: center;
        }

        .deliverables-table .no-col {
          width: 5%;
          text-align: center;
          min-width: 20px;
        }

        /* Contract 4: Simple 4-column table */
        .deliverables-table .deliverable-col {
          width: 45%;
        }

        .deliverables-table .indicator-col {
          width: 30%;
        }

        .deliverables-table .timeline-col {
          width: 20%;
        }

        /* Contract 5: Multiple tables with activities */
        .deliverables-table .activity-col {
          width: 45%;
        }

        /* Responsive for different content lengths */
        @media print {
          .deliverables-table {
            font-size: 9pt;
            line-height: 1.3;
          }

          .deliverables-table th,
          .deliverables-table td {
            padding: 4px;
          }
        }

        .section-title {
          font-weight: 700;
          margin-top: 0.5cm;
          margin-bottom: 0.3cm;
          font-size: 11pt;
        }

        .section-content {
          margin-left: 0.5cm;
          margin-bottom: 0.3cm;
          font-size: 11pt;
        }

        .signature-section {
          margin-top: 1.5cm;
          display: flex;
          justify-content: space-between;
        }

        .signature-box {
          width: 45%;
          text-align: center;
        }

        .signature-label {
          font-weight: 700;
          margin-bottom: 0.3cm;
          font-size: 11pt;
        }
        
        .signature-label-moul {
          font-family: 'Moul', serif !important;
          font-weight: 400;
          margin-bottom: 0.3cm;
          font-size: 11pt;
        }

        .signature-line {
          margin-top: 1.5cm;
          font-size: 11pt;
        }

        .signature-image {
          max-width: 200px;
          max-height: 100px;
          margin: 0.5cm auto;
          display: block;
          object-fit: contain;
        }

        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-family: 'Hanuman', serif;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .print-button:hover {
          background: #096dd9;
        }

        .bank-info-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.3cm;
          table-layout: fixed;
        }

        .bank-info-table td {
          border: 1px solid #000;
          padding: 6px;
          font-size: 10pt;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .bank-info-label {
          width: 35%;
          font-weight: 700;
        }

        .centered-text {
          text-align: center;
          margin-top: 1cm;
        }

        .large-khmer {
          font-family: 'Moul', serif !important;
          font-size: 14pt;
          font-weight: 700;
        }

        .header-divider {
          font-family: 'Tacteing', 'Arial Unicode MS', sans-serif !important;
          font-size: 24pt;
          text-align: center;
          margin: 10px auto;
          line-height: 1;
          color: #000;
        }
      ` }} />

      <button className="no-print print-button" onClick={() => window.print()}>
        ទាញយកជា PDF v2.0
      </button>

      {/* Debug Info - Remove after testing */}
      <div className="no-print" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        background: '#000',
        color: '#fff',
        padding: 8,
        fontSize: 12,
        zIndex: 9999
      }}>
        Debug: user={user ? `${user.id}/${user.role}` : 'null'} |
        contract={contractData ? `${contractData.id}/owner:${contractData.created_by_id}` : 'null'} |
        canEdit={String(canEdit())}
      </div>

      {/* Edit Control Panel - No Print */}
      {canEdit() && (
        <div className="no-print" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 24px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
                ត្រឡប់ក្រោយ
              </Button>
              <span style={{ fontSize: 14, color: '#8c8c8c' }}>កិច្ចសន្យា #{contractData.contract_number}</span>
            </Space>

            <Space>
              {editMode && Object.keys(editedFields).length > 0 && (
                <span style={{ color: '#faad14', fontSize: 13 }}>
                  មានការផ្លាស់ប្តូរ {Object.keys(editedFields).length} ចំណុច
                </span>
              )}

              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  if (!checked) {
                    setEditedFields({})
                    setEditorMode('simple')
                  }
                }}
                checkedChildren={<EditOutlined />}
                unCheckedChildren="កែប្រែ"
              />

              {editMode && (
                <>
                  {/* Mode Selector */}
                  <Space.Compact>
                    <Button
                      size="small"
                      type={editorMode === 'simple' ? 'primary' : 'default'}
                      onClick={() => setEditorMode('simple')}
                    >
                      ធម្មតា
                    </Button>
                    <Button
                      size="small"
                      type={editorMode === 'advanced' ? 'primary' : 'default'}
                      onClick={() => setEditorMode('advanced')}
                    >
                      កម្រិតខ្ពស់
                    </Button>
                  </Space.Compact>
                </>
              )}

              {editMode && editorMode === 'simple' && (
                <>
                  {Object.keys(editedFields).length > 0 && (
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={saving}
                      onClick={handleSaveChanges}
                    >
                      រក្សាទុក
                    </Button>
                  )}
                  {layoutChanged && (
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveLayout}
                    >
                      រក្សារចនាសម្ព័ន្ធ
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={handleResetLayout}
                  >
                    កំណត់ឡើងវិញ
                  </Button>
                </>
              )}

              {editMode && editorMode === 'advanced' && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleOpenFullPageEditor}
                  size="large"
                >
                  កែប្រែឯកសារពេញលេញ
                </Button>
              )}

              {contractData?.download_count > 0 && (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  ទាញយក: {contractData.download_count} ដង
                </span>
              )}

              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                បោះពុម្ព
              </Button>
            </Space>
          </div>
        </div>
      )}

      <div style={{ paddingTop: canEdit() ? 70 : 0 }}>
        <div className="contract-container">
          {/* Page 1 */}
          <div>
            {/* Define all sections */}
            {(() => {
              const sections: Record<string, React.ReactNode> = {
                header: (
                  <div className="header">
                    <div className="header-line centered">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div className="header-line centered">ជាតិ  សាសនា  ព្រះមហាក្សត្រ</div>
                    <div className="header-divider">3</div>
                    <div className="header-line">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                    <div className="header-line">នាយកដ្ឋានបឋមសិក្សា</div>
                  </div>
                ),
                title: (
                  <div className="title">
                    កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋមសិក្សា និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ
                  </div>
                ),
                parties: (
                  <table className="implementer-table">
                    <tbody>
                      <tr>
                        <td className="label-col">អ្នកអនុវត្ត</td>
                        <td className="label-col">ឈ្មោះ</td>
                        <td className="label-col">មុខតំណែង/តួនាទី</td>
                      </tr>
                      <tr>
                        <td>នាយកដ្ឋានបឋមសិក្សា</td>
                        <td>លោកបណ្ឌិត កាន់ ពុទ្ធី</td>
                        <td>ប្រធាននាយកដ្ឋានបឋមសិក្សា</td>
                      </tr>
                      <tr>
                        <td>{isContractType4 ? 'ការិយាល័យអប់រំ' : 'សាលាបឋមសិក្សា'}</td>
                        <td>{renderEditableField('party_b_name', contractData.party_b_name, 'ឈ្មោះរបស់អ្នក')}</td>
                        <td>{renderEditableField('party_b_position', contractData.party_b_position || partyBTitle, partyBTitle)}</td>
                      </tr>
                    </tbody>
                  </table>
                ),
                intro: isContractType4 ? (
                  <div className="intro-text">
                    គណៈគ្រប់គ្រង និងបុគ្គលិកអប់រំនៃការិយាល័យអប់រំ{renderEditableField('party_b_organization', contractData.party_b_organization, 'ឈ្មោះការិយាល័យ/ស្រុក/ខណ្ឌ')}ព្រមព្រៀងក្នុងការគាំទ្រ ជំរុញ និងពិនិត្យតាមដានការអនុវត្តរបស់សាលានៅក្រុងស្រុកខណ្ឌរបស់ខ្លួនឯងដើម្បីមានលទ្ធភាពគ្រប់គ្រាន់បំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖
                  </div>
                ) : (
                  <div className="intro-text">
                    សាលាគណៈបឋមសិក្សា{renderEditableField('party_b_organization', contractData.party_b_organization, 'ឈ្មោះសាលា')}ព្រមព្រៀងក្នុងការបំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖
                  </div>
                ),
                deliverables: (
                  <>
                    {isContractType4 ? (
                      <table className="deliverables-table">
                        <thead>
                          <tr>
                            <th className="no-col">ល.រ</th>
                            <th className="deliverable-col">សមិទ្ធកម្ម</th>
                            <th className="indicator-col">សូចនាករ</th>
                            <th className="timeline-col">ពេលវេលាអនុវត្ត</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractData.deliverables.map((deliverable: any) => (
                            <tr key={deliverable.deliverable_number}>
                              <td className="no-col">{deliverable.deliverable_number}.</td>
                              <td>({deliverable.deliverable_number}) {deliverable.deliverable_title_khmer}</td>
                              <td>{deliverable.selected_indicator_text}</td>
                              <td>{deliverable.timeline}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <>
                        {contractData.deliverables.map((deliverable: any, index: number) => (
                          <div key={deliverable.deliverable_number}>
                            <div className="section-title" style={{ marginTop: index === 0 ? '0' : '0.5cm' }}>
                              សមិទ្ធិកម្មទី{deliverable.deliverable_number}៖ {deliverable.deliverable_title_khmer}
                            </div>
                            <table className="deliverables-table">
                              <thead>
                                <tr>
                                  <th className="no-col">ល.រ</th>
                                  <th className="activity-col">សកម្មភាពនាយកសាលាអនុវត្ត</th>
                                  <th className="indicator-col">សូចនាករ</th>
                                  <th className="timeline-col">ពេលវេលាអនុវត្ត</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="no-col">{deliverable.deliverable_number}.</td>
                                  <td>
                                    {deliverable.activities_text ? (
                                      <div dangerouslySetInnerHTML={{ __html: deliverable.activities_text.replace(/\n/g, '<br/>') }} />
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td>{deliverable.selected_indicator_text}</td>
                                  <td>{deliverable.timeline}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Account Information Section - After Deliverables in Table Format */}
                    <table className="deliverables-table" style={{ marginTop: '0.5cm' }}>
                      <thead>
                        <tr>
                          <th className="no-col" style={{ width: '5%' }}></th>
                          <th className="deliverable-col" style={{ width: '25%' }}>ការលើកទឹកចិត្តសមិទ្ធកម្ម</th>
                          <th colSpan={2} className="indicator-col" style={{ width: '70%', textAlign: 'left' }}>
                            <div className="section-content" style={{ marginLeft: 0, fontWeight: 400, textAlign: 'left' }}>
                              ១.ថវិកាដែលទទួលបានសរុប៖……………………………
                            </div>
                            <div className="section-content" style={{ marginLeft: 0, fontWeight: 400, textAlign: 'left' }}>
                              ២.ចំនួនដងនៃការបើកផ្តលៗ៖ ៤ ដង
                            </div>
                            <div style={{ marginBottom: '0.5cm' }}>
                              <div className="section-content" style={{ fontWeight: 400, marginLeft: 0, textAlign: 'left' }}>
                                ៣. លក្ខខណ្ឌដើម្បីទទួលបានថវិកាគាំទ្រសមិទ្ធកម្ម៖
                              </div>
                              <div className="section-content" style={{ marginLeft: '1cm', fontWeight: 400, textAlign: 'left' }}>
                                - ការផ្តល់របាយការណ៍សមិទ្ធកម្មរបស់គម្រោង
                              </div>
                              <div className="section-content" style={{ marginLeft: '1cm', fontWeight: 400, textAlign: 'left' }}>
                                - លទ្ធផលនៃការវាយតម្លៃសមិទ្ធកម្មរបស់គ.ប.ក.។
                              </div>
                            </div>
                            <div className="section-content" style={{ fontWeight: 400, marginLeft: 0, textAlign: 'left' }}>
                              ៤. ឈ្មោះនិងលេខ គណនី ប្រធានការិយាល័យអប់រំ
                            </div>
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </>
                ),
                signatures: (
                  <div className="page-break" style={{ marginTop: '1cm' }}>
                    {/* Signature Section */}
                    <div className="signature-section">
                      <div className="signature-box">
                        <div className="signature-label-moul">ជ.ប្រធានគម្រោង</div>
                        <div className="signature-label-moul">ប្រធាននាយកដ្ឋាន</div>

                        {/* Party A Signature Image - Show default signature if PLACEHOLDER */}
                        {contractData.party_a_signature && contractData.party_a_signature !== 'data:image/png;base64,PLACEHOLDER' ? (
                          <img
                            src={contractData.party_a_signature}
                            alt="Party A Signature"
                            className="signature-image"
                          />
                        ) : (
                          <img
                            src="/signatures/image.png"
                            alt="Party A Signature"
                            className="signature-image"
                          />
                        )}

                        <div className="signature-label" style={{fontWeight: 400}}>ហត្ថលេខានិងឈ្មោះ</div>
                        {contractData.party_a_signed_date && (
                          <div style={{ fontSize: '10pt', marginTop: '0.2cm' }}>
                            {new Date(contractData.party_a_signed_date).toLocaleDateString('km-KH', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                      <div className="signature-box">
                        <div className="signature-line">
                          ថ្ងៃទី............ ខែ...............ឆ្នាំ............
                        </div>

                        {/* Party B Signature Image */}
                        {contractData.party_b_signature && (
                          <img
                            src={contractData.party_b_signature}
                            alt="Party B Signature"
                            className="signature-image"
                          />
                        )}

                        <div className="signature-label" style={{fontWeight: 400}}>
                          ហត្ថលេខានិងឈ្មោះ ({isContractType4 ? 'ប្រធានការិយាល័យអប់រំ' : 'នាយកសាលា'})
                        </div>
                        {contractData.party_b_signed_date && (
                          <div style={{ fontSize: '10pt', marginTop: '0.2cm' }}>
                            {new Date(contractData.party_b_signed_date).toLocaleDateString('km-KH', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom centered text for Contract Type 5 */}
                    {isContractType5 && (
                      <div className="centered-text">
                        <div className="large-khmer">មូលនិធិសាលាមុត្តុនា</div>
                        <div className="large-khmer">ខ ហូលដាលសាលាមុត្តុនា</div>
                        <div>បក្សុលសខីងលុណៈ</div>
                        <div style={{ marginTop: '0.5cm' }}>
                          ស្ថិទី............ ខែ................ឆ្នាំ............<br />
                          បក្សុលសខីងលុណៈ : (ប្រធានការិយាល័យអប់រំ)
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // Render sections in dynamic order
              return sectionOrder.map((sectionId, index) =>
                renderSectionWithControls(sectionId, sections[sectionId], index)
              )
            })()}
          </div>
        </div>
      </div>
      {/* Rich Text Editor Modal for Advanced Mode */}
      <Modal
        title={`កែប្រែផ្នែក: ${DEFAULT_SECTIONS.find(s => s.id === editingSection)?.label}`}
        open={showRichEditor}
        onCancel={() => {
          setShowRichEditor(false)
          setEditingSection(null)
        }}
        footer={null}
        width={900}
        className="font-hanuman"
      >
        {editingSection && (
          <RichTextEditor
            content={sectionContent[editingSection] || ''}
            onSave={handleSaveSectionContent}
            onCancel={() => {
              setShowRichEditor(false)
              setEditingSection(null)
            }}
          />
        )}
      </Modal>

      {/* Full JSON Editor Modal for Advanced Mode */}
      <Modal
        title="កែប្រែកិច្ចសន្យាទាំងស្រុង (Full Contract Editor)"
        open={showJSONEditor}
        onCancel={() => setShowJSONEditor(false)}
        footer={null}
        width={1200}
        className="font-hanuman"
        styles={{ body: { padding: 0 } }}
      >
        {contractData && (
          <ContractJSONEditor
            contractData={contractData}
            onSave={handleSaveFullJSON}
            onCancel={() => setShowJSONEditor(false)}
          />
        )}
      </Modal>

      {/* Full-Page WordPress-Style Editor */}
      {showFullPageEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column'
        }} className="no-print">
          {/* Editor Toolbar */}
          <div style={{
            background: '#f5f5f5',
            borderBottom: '2px solid #e8e8e8',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  setShowFullPageEditor(false)
                  setFullDocumentHTML('')
                }}
              >
                បិទ
              </Button>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                កែប្រែកិច្ចសន្យា #{contractData?.contract_number}
              </span>
              <span style={{ fontSize: 12, color: '#52c41a' }}>
                ✏️ WordPress-Style Editor
              </span>
            </Space>

            <Space>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                Ctrl+S = រក្សាទុក
              </span>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={() => handleSaveFullDocument(fullDocumentHTML)}
              >
                រក្សាទុកឯកសារ
              </Button>
            </Space>
          </div>

          {/* Editor Content */}
          <div style={{ flex: 1, overflow: 'auto', background: '#f9f9f9', padding: 24 }}>
            <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', minHeight: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <RichTextEditor
                content={fullDocumentHTML}
                onSave={handleSaveFullDocument}
                onCancel={() => {
                  setShowFullPageEditor(false)
                  setFullDocumentHTML('')
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
