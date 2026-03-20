'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Plus } from 'lucide-react';

interface HeroSkillsProps {
  skills?: string[];
  isAllowedToEdit: boolean;
  onUpdate: (skills: string[]) => void;
}

export const HeroSkills = ({ skills = [], isAllowedToEdit, onUpdate }: HeroSkillsProps) => {
  const t = useTranslations('hero');
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const commit = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onUpdate([...skills, trimmed]);
    }
    setInput('');
    setAdding(false);
  };

  const remove = (skill: string) => {
    onUpdate(skills.filter(s => s !== skill));
  };

  if (!isAllowedToEdit && (skills || [])?.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {t('skillsLabel')}
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <span
            key={skill}
            className="group/skill flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-sm font-medium transition-colors hover:bg-muted"
          >
            {skill}
            {isAllowedToEdit && (
              <button
                onClick={() => remove(skill)}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/skill:opacity-100 hover:text-foreground"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {isAllowedToEdit &&
          (adding ? (
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') {
                  setAdding(false);
                  setInput('');
                }
              }}
              onBlur={commit}
              placeholder={t('skillPlaceholder')}
              className="h-7 w-32 rounded-full border border-primary/50 bg-background px-3 text-sm ring-1 ring-primary/30 outline-none focus:ring-primary"
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex h-7 items-center gap-1 rounded-full border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('addSkill')}
            </button>
          ))}
      </div>
    </div>
  );
};
