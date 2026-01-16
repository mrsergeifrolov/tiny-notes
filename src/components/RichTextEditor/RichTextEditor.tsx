import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect, useCallback } from 'react';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || '',
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: styles.link,
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Return empty string if content is just empty paragraph
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  });

  // Update editor when value changes externally
  useEffect(() => {
    if (editor) {
      const currentContent = editor.getHTML() === '<p></p>' ? '' : editor.getHTML();
      const normalizedValue = value || '';
      if (normalizedValue !== currentContent) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ''}`}
          title="Жирный (Cmd+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.active : ''}`}
          title="Курсив (Cmd+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.active : ''}`}
          title="Подчёркнутый (Cmd+U)"
        >
          <span className={styles.underlineIcon}>U</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${styles.toolbarButton} ${editor.isActive('strike') ? styles.active : ''}`}
          title="Зачёркнутый"
        >
          <span className={styles.strikeIcon}>S</span>
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${styles.toolbarButton} ${editor.isActive('code') ? styles.active : ''}`}
          title="Код"
        >
          <span className={styles.codeIcon}>&lt;/&gt;</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.toolbarButton} ${editor.isActive('blockquote') ? styles.active : ''}`}
          title="Цитата"
        >
          <span className={styles.quoteIcon}>"</span>
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.active : ''}`}
          title="Ссылка"
        >
          <span className={styles.linkIcon}>🔗</span>
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.active : ''}`}
          title="Маркированный список"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.active : ''}`}
          title="Нумерованный список"
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
