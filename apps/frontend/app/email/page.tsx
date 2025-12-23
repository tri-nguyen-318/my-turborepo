'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';

export default function EmailDemoPage() {
  const t = useTranslations('emailDemo');
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(res => setTimeout(res, 1000));
      setStatus(t('success'));
    } catch (e) {
      setStatus(t('fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg bg-card rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <p className="mb-4 text-muted-foreground">{t('desc')}</p>
        <div className="mb-4">
          <label className="block mb-1 font-medium">{t('recipientsLabel')}</label>
          <Input
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder={t('recipientsPlaceholder')}
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">{t('subjectLabel')}</label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={t('subjectPlaceholder')}
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">{t('messageLabel')}</label>
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={t('messagePlaceholder')}
            rows={5}
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={loading || !emails || !subject || !body}
          className="w-full mb-2"
        >
          {loading ? t('sending') : t('send')}
        </Button>
        {status && <div className="text-center mt-2 text-sm text-muted-foreground">{status}</div>}
      </div>
    </div>
  );
}
