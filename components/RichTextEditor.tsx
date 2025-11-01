'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Button, Space, Divider } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  TableOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons'

interface RichTextEditorProps {
  content: string
  onSave: (html: string) => void
  onCancel?: () => void
}

export function RichTextEditor({ content, onSave, onCancel }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] p-4 border rounded',
        style: 'font-family: Hanuman, serif; font-size: 11pt;'
      }
    }
  })

  if (!editor) {
    return null
  }

  const MenuBar = () => (
    <div style={{
      background: '#f5f5f5',
      borderBottom: '1px solid #d9d9d9',
      padding: '8px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4
    }}>
      <Space.Compact>
        <Button
          size="small"
          icon={<BoldOutlined />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          type={editor.isActive('bold') ? 'primary' : 'default'}
          title="Bold (Ctrl+B)"
        />
        <Button
          size="small"
          icon={<ItalicOutlined />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type={editor.isActive('italic') ? 'primary' : 'default'}
          title="Italic (Ctrl+I)"
        />
        <Button
          size="small"
          icon={<UnderlineOutlined />}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          type={editor.isActive('underline') ? 'primary' : 'default'}
          title="Underline (Ctrl+U)"
        />
      </Space.Compact>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space.Compact>
        <Button
          size="small"
          icon={<OrderedListOutlined />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          type={editor.isActive('orderedList') ? 'primary' : 'default'}
          title="Numbered List"
        />
        <Button
          size="small"
          icon={<UnorderedListOutlined />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type={editor.isActive('bulletList') ? 'primary' : 'default'}
          title="Bullet List"
        />
      </Space.Compact>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space.Compact>
        <Button
          size="small"
          icon={<AlignLeftOutlined />}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
        />
        <Button
          size="small"
          icon={<AlignCenterOutlined />}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
        />
        <Button
          size="small"
          icon={<AlignRightOutlined />}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
        />
      </Space.Compact>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Button
        size="small"
        icon={<TableOutlined />}
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        title="Insert Table"
      >
        តារាង
      </Button>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space.Compact>
        <Button
          size="small"
          icon={<UndoOutlined />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <Button
          size="small"
          icon={<RedoOutlined />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
      </Space.Compact>
    </div>
  )

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff' }}>
      <MenuBar />
      <EditorContent editor={editor} />
      <div style={{
        borderTop: '1px solid #d9d9d9',
        padding: 8,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8
      }}>
        {onCancel && (
          <Button onClick={onCancel}>
            បោះបង់
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => onSave(editor.getHTML())}
        >
          រក្សាទុក
        </Button>
      </div>
    </div>
  )
}
