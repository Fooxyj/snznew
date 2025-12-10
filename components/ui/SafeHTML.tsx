
import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: React.ElementType;
}

/**
 * Компонент для безопасного рендеринга HTML.
 * Использует DOMPurify для удаления вредоносных скриптов (XSS).
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className, as: Component = 'div' }) => {
  const sanitizedHtml = useMemo(() => {
    return { __html: DOMPurify.sanitize(html) };
  }, [html]);

  return (
    <Component 
      className={className} 
      dangerouslySetInnerHTML={sanitizedHtml} 
    />
  );
};
