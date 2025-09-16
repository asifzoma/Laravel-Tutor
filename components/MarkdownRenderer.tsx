import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const htmlContent = useMemo(() => {
    if (!content) return { __html: '' };
    // Since the content is coming from a trusted AI source we control,
    // we can use marked without extensive sanitization.
    // For user-generated content, a library like DOMPurify would be essential.
    return { __html: marked.parse(content) as string };
  }, [content]);

  return (
    <div
      className={`prose prose-slate max-w-none leading-relaxed ${className}`}
      dangerouslySetInnerHTML={htmlContent}
    />
  );
};

export default MarkdownRenderer;
