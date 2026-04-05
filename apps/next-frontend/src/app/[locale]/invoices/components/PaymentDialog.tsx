'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Invoice } from '@/store/api';

interface Props {
  invoice: Invoice | null;
  hasPaypal: boolean;
  onClose: () => void;
  onRequestPayment: (id: number) => Promise<unknown>;
  onVerifyToken: (id: number, token: string) => Promise<unknown>;
  onCreatePaypalOrder: (id: number) => Promise<{ orderId: string }>;
  onCapturePaypalOrder: (id: number, orderId: string) => Promise<unknown>;
}

type Step = 'otp-send' | 'otp-enter' | 'paypal';

export function PaymentDialog({
  invoice,
  hasPaypal,
  onClose,
  onRequestPayment,
  onVerifyToken,
  onCreatePaypalOrder,
  onCapturePaypalOrder,
}: Props) {
  const t = useTranslations('invoicesDemo');
  const [step, setStep] = useState<Step>('otp-send');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleClose = () => {
    setStep('otp-send');
    setToken('');
    setError('');
    onClose();
  };

  const handleSendCode = async () => {
    if (!invoice) return;
    setIsSending(true);
    setError('');
    try {
      await onRequestPayment(invoice.id);
      setStep('otp-enter');
    } catch {
      setError(t('sending'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open={invoice !== null}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('paymentTitle')}</DialogTitle>
          {invoice && (
            <DialogDescription>
              {t('paymentDesc', { customer: invoice.customer, amount: invoice.amount.toFixed(2) })}
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'otp-send' && (
          <div className="flex flex-col gap-4">
            {invoice && (
              <p className="text-sm text-muted-foreground">
                {t('paymentEmailHint', { email: invoice.customerEmail })}
              </p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSending}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSendCode} disabled={isSending}>
                {isSending ? t('sending') : t('sendPaymentRequest')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'otp-enter' && invoice && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t('enterTokenHint')}</p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={token}
                disabled={isVerifying}
                onChange={async v => {
                  const upper = v.toUpperCase();
                  setToken(upper);
                  setError('');
                  if (upper.length === 6) {
                    setIsVerifying(true);
                    try {
                      await onVerifyToken(invoice.id, upper);
                      if (hasPaypal) {
                        setStep('paypal');
                      } else {
                        handleClose();
                      }
                    } catch {
                      setError(t('tokenInvalid'));
                      setToken('');
                    } finally {
                      setIsVerifying(false);
                    }
                  }
                }}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="uppercase" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {isVerifying && (
              <p className="text-center text-sm text-muted-foreground">{t('processing')}</p>
            )}
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isVerifying}>
                {t('cancel')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'paypal' && invoice && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t('enterTokenHint')}</p>
            <PayPalButtons
              style={{ layout: 'vertical', shape: 'rect' }}
              createOrder={async () => {
                setError('');
                const { orderId } = await onCreatePaypalOrder(invoice.id);
                return orderId;
              }}
              onApprove={data =>
                onCapturePaypalOrder(invoice.id, data.orderID).then(() => handleClose())
              }
              onError={err => {
                const msg = err instanceof Error ? err.message : 'PayPal payment failed.';
                setError(msg);
              }}
            />
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                {t('cancel')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
