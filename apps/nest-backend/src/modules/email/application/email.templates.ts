export const emailTemplates = {
  paymentRequest: (invoice: {
    id: number;
    customer: string;
    amount: number;
    notes?: string | null;
    token: string;
  }) => ({
    subject: `Payment request for invoice #${invoice.id}`,
    text: `Hello ${invoice.customer},\n\nYour invoice #${invoice.id} for $${invoice.amount.toFixed(2)} is ready for payment.\n\nYour one-time payment code is: ${invoice.token}\n\nThis code expires in 15 minutes.\n\nThank you!`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#18181b;padding:28px 40px">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:600">Payment Request</p>
          <p style="margin:4px 0 0;color:#a1a1aa;font-size:13px">Invoice #${invoice.id}</p>
        </td></tr>
        <tr><td style="padding:36px 40px">
          <p style="margin:0 0 8px;color:#3f3f46;font-size:15px">Hi <strong>${invoice.customer}</strong>,</p>
          <p style="margin:0 0 28px;color:#71717a;font-size:14px;line-height:1.6">You have an invoice ready for payment. Use the one-time code below to complete the transaction.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;margin-bottom:28px">
            <tr><td style="padding:20px 24px">
              <p style="margin:0;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Amount due</p>
              <p style="margin:4px 0 0;color:#18181b;font-size:28px;font-weight:700">$${invoice.amount.toFixed(2)}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 12px;color:#3f3f46;font-size:13px;font-weight:500">Your one-time payment code</p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:8px">
            <tr><td style="background:#18181b;border-radius:8px;padding:14px 32px">
              <p style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:6px;font-family:monospace">${invoice.token}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 28px;color:#a1a1aa;font-size:12px">⏱ Expires in 15 minutes</p>
          ${invoice.notes ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #e4e4e7;margin-bottom:28px"><tr><td style="padding:10px 16px"><p style="margin:0;color:#71717a;font-size:13px;font-style:italic">${invoice.notes}</p></td></tr></table>` : ''}
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #f4f4f5">
          <p style="margin:0;color:#a1a1aa;font-size:12px">If you didn't expect this email, you can safely ignore it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }),

  paymentConfirmed: (invoice: {
    id: number;
    customer: string;
    amount: number;
    notes?: string | null;
  }) => ({
    subject: `Payment confirmed — invoice #${invoice.id}`,
    text: `Hello ${invoice.customer},\n\nPayment of $${invoice.amount.toFixed(2)} for invoice #${invoice.id} has been confirmed. Thank you!\n\nBest regards`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#16a34a;padding:28px 40px">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:600">Payment Confirmed ✓</p>
          <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px">Invoice #${invoice.id}</p>
        </td></tr>
        <tr><td style="padding:36px 40px">
          <p style="margin:0 0 8px;color:#3f3f46;font-size:15px">Hi <strong>${invoice.customer}</strong>,</p>
          <p style="margin:0 0 28px;color:#71717a;font-size:14px;line-height:1.6">Your payment has been received and confirmed. Thank you!</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:28px">
            <tr>
              <td style="padding:20px 24px">
                <p style="margin:0;color:#16a34a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Amount paid</p>
                <p style="margin:4px 0 0;color:#18181b;font-size:28px;font-weight:700">$${invoice.amount.toFixed(2)}</p>
              </td>
              <td style="padding:20px 24px;text-align:right">
                <span style="display:inline-block;background:#16a34a;color:#fff;border-radius:999px;padding:4px 14px;font-size:12px;font-weight:600">PAID</span>
              </td>
            </tr>
          </table>
          ${invoice.notes ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #e4e4e7;margin-bottom:28px"><tr><td style="padding:10px 16px"><p style="margin:0;color:#71717a;font-size:13px;font-style:italic">${invoice.notes}</p></td></tr></table>` : ''}
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #f4f4f5">
          <p style="margin:0;color:#a1a1aa;font-size:12px">Keep this email as your payment receipt.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }),
};
