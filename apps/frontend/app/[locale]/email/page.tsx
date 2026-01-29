'use client';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { emailApi } from '@/lib/api/email/emailApi';
import { useState } from 'react';

export default function EmailDemoPage() {
  const t = useTranslations('emailDemo');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      emails: '',
      subject: '',
      body: '',
    },
  });
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setStatus(null);
    try {
      const res = await emailApi.sendEmail({
        to: data.emails,
        subject: data.subject,
        text: data.body,
      });
      setStatus(t('success') + ` (ID: ${res.messageId})`);
      reset();
    } catch (e) {
      console.error(e);
      setStatus(t('fail'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg bg-card rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <p className="mb-4 text-muted-foreground">{t('desc')}</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">{t('recipientsLabel')}</label>
            <Input
              {...register('emails', { required: true })}
              placeholder={t('recipientsPlaceholder')}
              disabled={isSubmitting}
            />
            {errors.emails && <span className="text-red-500 text-xs">{t('required')}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">{t('subjectLabel')}</label>
            <Input
              {...register('subject', { required: true })}
              placeholder={t('subjectPlaceholder')}
              disabled={isSubmitting}
            />
            {errors.subject && <span className="text-red-500 text-xs">{t('required')}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">{t('messageLabel')}</label>
            <Textarea
              {...register('body', { required: true })}
              placeholder={t('messagePlaceholder')}
              rows={5}
              disabled={isSubmitting}
            />
            {errors.body && <span className="text-red-500 text-xs">{t('required')}</span>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mb-2"
          >
            {isSubmitting ? t('sending') : t('send')}
          </Button>
        </form>
        {status && <div className="text-center mt-2 text-sm text-muted-foreground">{status}</div>}
      </div>
    </div>
  );
}
