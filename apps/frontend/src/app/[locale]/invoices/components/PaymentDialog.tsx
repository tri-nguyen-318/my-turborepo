'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
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
  onClose: () => void;
  onRequestPayment: (id: number) => Promise<unknown>;
  onPay: (id: number, token: string) => Promise<unknown>;
  onCreatePaypalOrder: (id: number) => Promise<{ orderId: string }>;
  onCapturePaypalOrder: (id: number, orderId: string) => Promise<unknown>;
}

type Method = 'choose' | 'email-request' | 'email-enter' | 'paypal';

export function PaymentDialog({
  invoice,
  onClose,
  onRequestPayment,
  onPay,
  onCreatePaypalOrder,
  onCapturePaypalOrder,
}: Props) {
  const t = useTranslations('invoicesDemo');
  const [method, setMethod] = useState<Method>('choose');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handleClose = () => {
    setMethod('choose');
    setToken('');
    setError('');
    onClose();
  };

  const handleRequest = async () => {
    if (!invoice) return;
    setIsRequesting(true);
    try {
      await onRequestPayment(invoice.id);
      setMethod('email-enter');
    } finally {
      setIsRequesting(false);
    }
  };

  const handlePay = async () => {
    if (!invoice) return;
    setError('');
    setIsPaying(true);
    try {
      await onPay(invoice.id, token.toUpperCase());
      handleClose();
    } catch {
      setError(t('tokenInvalid'));
    } finally {
      setIsPaying(false);
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

        {method === 'choose' && (
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-14 text-base"
              onClick={() => setMethod('email-request')}
            >
              {t('emailMethod')}
            </Button>
            <Button
              variant="outline"
              className="h-14 text-base"
              onClick={() => setMethod('paypal')}
            >
              {t('paypalMethod')}
            </Button>
            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                {t('cancel')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {method === 'email-request' && (
          <div className="flex flex-col gap-4">
            {invoice && (
              <p className="text-sm text-muted-foreground">
                {t('paymentEmailHint', { email: invoice.customerEmail })}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button onClick={handleRequest} disabled={isRequesting}>
                {isRequesting ? t('sending') : t('sendPaymentRequest')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {method === 'email-enter' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t('enterTokenHint')}</p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={token} onChange={v => setToken(v.toUpperCase())}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="uppercase" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button onClick={handlePay} disabled={isPaying || token.length < 6}>
                {isPaying ? t('processing') : t('payNow')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {method === 'paypal' && invoice && (
          <div className="flex flex-col gap-4">
            <PayPalScriptProvider
              options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '' }}
            >
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect' }}
                createOrder={() => onCreatePaypalOrder(invoice.id).then(d => d.orderId)}
                onApprove={data =>
                  onCapturePaypalOrder(invoice.id, data.orderID).then(() => handleClose())
                }
                onError={() => setError('PayPal payment failed. Please try again.')}
              />
            </PayPalScriptProvider>
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
