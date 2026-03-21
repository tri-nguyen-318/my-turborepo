'use client';

import { useTranslations } from 'next-intl';
import { Github, Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import { EditableField } from './EditableField';
import { HeroSkills } from './HeroSkills';
import type { PersonalInfo } from '@/store/api';

interface HeroInfoProps {
  info: PersonalInfo;
  isAllowedToEdit: boolean;
  onFieldUpdate: (key: keyof PersonalInfo, value: string) => void;
  onSkillsUpdate: (skills: string[]) => void;
}

export const HeroInfo = ({
  info,
  isAllowedToEdit,
  onFieldUpdate,
  onSkillsUpdate,
}: HeroInfoProps) => {
  const t = useTranslations('hero');
  const ro = !isAllowedToEdit;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-start space-y-6 text-left">
      <div className="w-full space-y-0">
        <EditableField
          value={info.name}
          onSave={val => onFieldUpdate('name', val)}
          placeholder={t('placeholderName')}
          className="text-xl font-semibold tracking-tighter sm:text-4xl md:text-5xl"
          readOnly={ro}
          as="h4"
        />
        <EditableField
          value={info.role}
          onSave={val => onFieldUpdate('role', val)}
          placeholder={t('placeholderRole')}
          className="text-xl font-medium text-muted-foreground"
          readOnly={ro}
          as="p"
        />
      </div>

      <blockquote className="max-w-150 border-l-4 border-primary/40 pl-4 text-muted-foreground italic">
        <EditableField
          value={info.bio}
          onSave={val => onFieldUpdate('bio', val)}
          placeholder={t('placeholderBio')}
          className="md:text-lg"
          readOnly={ro}
          multiline
        />
      </blockquote>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <EditableField
          value={info.location}
          onSave={val => onFieldUpdate('location', val)}
          icon={<MapPin className="h-4 w-4" />}
          placeholder={t('placeholderLocation')}
          readOnly={ro}
        />
        <EditableField
          value={info.email}
          onSave={val => onFieldUpdate('email', val)}
          icon={<Mail className="h-4 w-4" />}
          placeholder={t('placeholderEmail')}
          linkPrefix="mailto:"
          noTruncate
          readOnly={ro}
        />
        <EditableField
          value={info.phone}
          onSave={val => onFieldUpdate('phone', val)}
          icon={<Phone className="h-4 w-4" />}
          placeholder={t('placeholderPhone')}
          readOnly={ro}
        />
        <EditableField
          value={info.github}
          onSave={val => onFieldUpdate('github', val)}
          icon={<Github className="h-4 w-4" />}
          placeholder={t('placeholderGithub')}
          linkPrefix="https://"
          noTruncate
          readOnly={ro}
        />
        <EditableField
          value={info.linkedin}
          onSave={val => onFieldUpdate('linkedin', val)}
          icon={<Linkedin className="h-4 w-4" />}
          placeholder={t('placeholderLinkedin')}
          linkPrefix="https://"
          noTruncate
          readOnly={ro}
        />
      </div>

      <HeroSkills
        skills={info.skills}
        isAllowedToEdit={isAllowedToEdit}
        onUpdate={onSkillsUpdate}
      />
    </div>
  );
};
