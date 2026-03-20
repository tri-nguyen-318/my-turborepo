'use client';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useSendEmailMutation } from '@/store/api/apiSlice';
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
  const [sendEmail] = useSendEmailMutation();
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setStatus(null);
    try {
      const res = await sendEmail({
        to: data.emails,
        subject: data.subject,
        text: data.body,
      }).unwrap();
      setStatus(t('success') + ` (ID: ${res.messageId})`);
      reset();
    } catch (e) {
      console.error(e);
      setStatus(t('fail'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg rounded-xl bg-card p-8 shadow-xl">
        <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>
        <p className="mb-4 text-muted-foreground">{t('desc')}</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="mb-1 block font-medium">{t('recipientsLabel')}</label>
            <Input
              {...register('emails', { required: true })}
              placeholder={t('recipientsPlaceholder')}
              disabled={isSubmitting}
            />
            {errors.emails && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-medium">{t('subjectLabel')}</label>
            <Input
              {...register('subject', { required: true })}
              placeholder={t('subjectPlaceholder')}
              disabled={isSubmitting}
            />
            {errors.subject && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-medium">{t('messageLabel')}</label>
            <Textarea
              {...register('body', { required: true })}
              placeholder={t('messagePlaceholder')}
              rows={5}
              disabled={isSubmitting}
            />
            {errors.body && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mb-2 w-full">
            {isSubmitting ? t('sending') : t('send')}
          </Button>
        </form>
        {status && <div className="mt-2 text-center text-sm text-muted-foreground">{status}</div>}
      </div>
    </div>
  );
}
