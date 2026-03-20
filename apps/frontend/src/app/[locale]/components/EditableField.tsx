'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface EditableFieldProps {
  value: string | undefined;
  onSave: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  linkPrefix?: string;
  className?: string;
  multiline?: boolean;
  noTruncate?: boolean;
  readOnly?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const resolveHref = (value: string, linkPrefix: string) =>
  value.startsWith('http') || value.startsWith('mailto:') ? value : `${linkPrefix}${value}`;

const linkClass = (noTruncate?: boolean) =>
  `text-primary underline underline-offset-2 hover:opacity-80 transition-opacity${noTruncate ? '' : ' truncate'}`;

export const EditableField = ({
  value,
  onSave,
  icon,
  placeholder,
  linkPrefix,
  className,
  multiline,
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
          {multiline ? (
            <Textarea
              autoFocus
              value={current}
              onChange={e => setCurrent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`min-h-[80px] text-sm ${className}`}
            />
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
      ) : (
        <Component>{value}</Component>
      )}
      <Edit2 className="ml-2 h-3 w-3 flex-shrink-0 opacity-0 group-hover/field:opacity-50" />
    </div>
  );
};
