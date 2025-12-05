import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  className?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
  height = 300,
  disabled = false,
  className = ""
}: RichTextEditorProps) => {
  const [markdownValue, setMarkdownValue] = useState<string>(value || '');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  // Sync external value changes to internal state
  useEffect(() => {
    // If the incoming value is different from current markdown
    if (value !== undefined && value !== markdownValue) {
      setMarkdownValue(value || '');
    }
  }, [value, markdownValue]);

  const handleChange = (val?: string) => {
    if (val !== undefined) {
      setMarkdownValue(val);
      // Pass markdown directly to parent (backend will handle conversion if needed)
      onChange(val);
    }
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <MDEditor
        value={markdownValue}
        onChange={handleChange}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        height={height}
        textareaProps={{
          placeholder: placeholder,
          disabled: disabled,
        }}
        data-color-mode="light"
      />
      <style>{`
        .w-md-editor {
          --md-editor-border-color: #d1d5db;
          --md-editor-bg-color: #ffffff;
          --md-editor-toolbar-bg-color: #f9fafb;
          --md-editor-text-color: #111827;
          --md-editor-toolbar-text-color: #6b7280;
          --md-editor-btn-hover-bg-color: #e5e7eb;
        }

        .w-md-editor-bar {
          border-bottom: 1px solid #d1d5db;
        }

        .w-md-editor-bar svg {
          fill: #6b7280;
        }

        .w-md-editor-bar .w-md-editor-bar-item:hover svg {
          fill: #374151;
        }

        .w-md-editor-text-pre,
        .w-md-editor-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .w-md-editor-text:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

// Utility function to convert markdown to HTML for frontend display
export const markdownToHtml = (markdown: string): string => {
  // Simple markdown to HTML conversion for basic formatting
  // For production, consider using a proper markdown parser like marked or remark
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')

    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')

    // Lists
    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')

    // Line breaks
    .replace(/\n/g, '<br>')

    // Paragraphs
    .replace(/^([^<].*?)(<br>|$)/mg, '<p class="mb-4">$1</p>')

    // Clean up empty paragraphs
    .replace(/<p class="mb-4"><\/p>/g, '');

  // Wrap lists
  html = html.replace(/(<li class="ml-4">.*?<\/li>\s*)+/gs, '<ul class="list-disc mb-4">$&</ul>');
  html = html.replace(/(<li class="ml-4">.*?<\/li>\s*)+/gs, '<ol class="list-decimal mb-4">$&</ol>');

  return `<div class="prose prose-gray max-w-none">${html}</div>`;
};

// Component for displaying rich text content (used on frontend)
interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export const RichTextDisplay = ({ content, className = "" }: RichTextDisplayProps) => {
  // For now, since we're storing markdown, convert to HTML for display
  const htmlContent = markdownToHtml(content || '');

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default RichTextEditor;
