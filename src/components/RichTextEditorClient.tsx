'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Smile,
  List,
  ListOrdered,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
}

const EMOJIS = [
  '😊',
  '😂',
  '😍',
  '👍',
  '🎉',
  '❤️',
  '🥳',
  '😎',
  '🥂',
  '🍻',
  '⭐️',
  '🤩',
  '🫶',
  '👀',
]

export default function RichTextEditorClient({ value, onChange }: Props) {
  const [isMounted, setIsMounted] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [strike, setStrike] = useState(false)
  const [code, setCode] = useState(false)

  useEffect(() => setIsMounted(true), [])

  console.log('prettier :)', bold, italic, strike, code)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily.configure({ types: ['textStyle'] }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      const color = editor.getAttributes('textStyle').color
      setCurrentColor(color || '#000000')
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] p-3 text-black bg-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return

    const updateToolbar = () => {
      requestAnimationFrame(() => {
        setCurrentColor(editor.getAttributes('textStyle').color || '#000000')
        setBold(editor.isActive('bold'))
        setItalic(editor.isActive('italic'))
        setStrike(editor.isActive('strike'))
        setCode(editor.isActive('code'))
      })
    }

    editor.on('selectionUpdate', updateToolbar)
    editor.on('transaction', updateToolbar)

    return () => {
      editor.off('selectionUpdate', updateToolbar)
      editor.off('transaction', updateToolbar)
    }
  }, [editor])

  if (!isMounted) return null

  const toggleMark = (mark: string, val?: string) => {
    if (!editor) return
    switch (mark) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'color':
        editor
          .chain()
          .focus()
          .setColor(val || '#000000')
          .run()
        break
      case 'font':
        editor
          .chain()
          .focus()
          .setFontFamily(val || 'sans-serif')
          .run()
        break
      case 'emoji':
        editor
          .chain()
          .focus()
          .insertContent(val || '😊')
          .run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
    }
  }

  const getButtonClass = (isActive?: boolean) =>
    `p-2 rounded transition ${isActive ? 'bg-pink-400 text-white' : 'hover:bg-pink-100'}`

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2 bg-white/90 p-2 rounded-xl shadow-md border border-gray-200">
        <button
          type="button"
          onClick={() => toggleMark('bold')}
          className={getButtonClass(editor?.isActive('bold'))}
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleMark('italic')}
          className={getButtonClass(editor?.isActive('italic'))}
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleMark('strike')}
          className={getButtonClass(editor?.isActive('strike'))}
        >
          <Strikethrough size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleMark('code')}
          className={getButtonClass(editor?.isActive('code'))}
        >
          <Code size={18} />
        </button>

        <button
          type="button"
          onClick={() => toggleMark('bulletList')}
          className={getButtonClass(editor?.isActive('bulletList'))}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleMark('orderedList')}
          className={getButtonClass(editor?.isActive('orderedList'))}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>

        <input
          type="color"
          value={currentColor}
          onChange={(e) => toggleMark('color', e.target.value)}
          className="w-8 h-8 p-0 border-none cursor-pointer"
          title="Text color"
        />

        {/* Font family */}
        <select
          onChange={(e) => toggleMark('font', e.target.value)}
          className="p-1 rounded border border-gray-300 bg-white"
          value={editor?.getAttributes('textStyle').fontFamily || 'sans-serif'}
        >
          <option value="sans-serif">Sans</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
        </select>

        {/* Emoji picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-pink-100 transition"
          >
            <Smile size={18} />
          </button>
          {showEmojiPicker && (
            <div className="absolute z-10 top-10 left-0 flex flex-wrap gap-1 bg-white border rounded shadow p-2 w-40">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    toggleMark('emoji', emoji)
                    setShowEmojiPicker(false)
                  }}
                  className="p-1 hover:bg-pink-100 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
