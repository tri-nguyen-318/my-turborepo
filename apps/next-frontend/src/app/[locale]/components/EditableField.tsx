'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface EditableFieldProps {
  value: string | undefined;
  onSave: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  linkPrefix?: string;
  className?: string;
  multiline?: boolean;
  richText?: boolean;
  noTruncate?: boolean;
  readOnly?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const resolveHref = (value: string, linkPrefix: string) =>
  value.startsWith('http') || value.startsWith('mailto:') ? value : `${linkPrefix}${value}`;

const linkClass = (noTruncate?: boolean) =>
  `text-primary whitespace-nowrap underline underline-offset-2 no-wrap hover:opacity-80 transition-opacity${noTruncate ? '' : ' truncate'}`;

const MarkdownContent = ({ content, className }: { content: string; className?: string }) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // XSS-safe: no dangerouslySetInnerHTML — react-markdown renders via React elements
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="ml-4 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="ml-4 list-decimal">{children}</ol>,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export const EditableField = ({
  value,
  onSave,
  icon,
  placeholder,
  linkPrefix,
  className,
  multiline,
  richText,
  noTruncate,
  readOnly,
  as: Component = 'span',
}: EditableFieldProps) => {
  const t = useTranslations('hero');
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(value || '');

  useEffect(() => setCurrent(value || ''), [value]);

  const handleSave = () => {
    if (current !== value) onSave(current);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) handleSave();
    if (e.key === 'Escape') {
      setCurrent(value || '');
      setIsEditing(false);
    }
  };

  const align = multiline ? 'items-start' : 'items-center';

  if (readOnly) {
    if (!value) return null;
    return (
      <div className={`flex ${align} gap-2 p-1 ${className}`}>
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {linkPrefix ? (
          <a
            href={resolveHref(value, linkPrefix)}
            target={linkPrefix === 'mailto:' ? undefined : '_blank'}
            rel="noreferrer"
            className={linkClass(noTruncate)}
          >
            {value}
          </a>
        ) : richText ? (
          <MarkdownContent content={value} />
        ) : (
          <Component>{value}</Component>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`flex ${align} w-full gap-2`}>
        {icon && <span className="mt-2 text-muted-foreground">{icon}</span>}
        <div className="relative flex-1">
          {multiline || richText ? (
            <>
              <Textarea
                autoFocus
                value={current}
                onChange={e => setCurrent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`min-h-20 text-sm ${className}`}
              />
              {richText && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports **bold**, *italic*, [links](url), - lists
                </p>
              )}
            </>
          ) : (
            <Input
              autoFocus
              value={current}
              onChange={e => setCurrent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`py-6 text-sm ${className}`}
            />
          )}
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <div
        className={`flex ${align} cursor-pointer gap-2 py-1 text-muted-foreground/50 transition-colors hover:text-muted-foreground ${className}`}
        onClick={() => setIsEditing(true)}
      >
        {icon}
        <span className="text-sm italic">{t('addField', { field: placeholder ?? '' })}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex ${align} group/field -ml-1 cursor-pointer gap-2 rounded p-1 transition-colors hover:bg-muted/50 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {linkPrefix ? (
        <a
          href={resolveHref(value, linkPrefix)}
          target={linkPrefix === 'mailto:' ? undefined : '_blank'}
          rel="noreferrer"
          className={linkClass(noTruncate)}
          onClick={e => e.stopPropagation()}
        >
          {value}
        </a>
      ) : richText ? (
        <MarkdownContent content={value} className="flex-1" />
      ) : (
        <Component>{value}</Component>
      )}
      <Edit2 className="ml-2 h-3 w-3 flex-shrink-0 opacity-0 group-hover/field:opacity-50" />
    </div>
  );
};
