import { Invoice, InvoiceStatus, PaymentMethod } from '../types';

export function formatNaira(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return '₦' + safeAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNairaCompact(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (safeAmount >= 1_000_000) {
    return '₦' + (safeAmount / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (safeAmount >= 1_000) {
    return '₦' + (safeAmount / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return formatNaira(safeAmount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateInvoiceNumber(existingInvoices: Invoice[], customPrefix: string = 'INV-'): string {
  const currentYear = new Date().getFullYear();
  const prefix = customPrefix.endsWith('-') ? `${customPrefix}${currentYear}-` : `${customPrefix}-${currentYear}-`;
  
  let maxSeq = 0;
  for (const inv of existingInvoices) {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)) {
      const numPart = parseInt(inv.invoiceNumber.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}${nextSeq}`;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'cash':
      return 'Cash Payment';
    case 'pos':
      return 'POS Terminal';
    case 'ussd':
      return 'USSD Code Transfer';
    case 'mobile_banking':
      return 'Mobile Banking App';
    default:
      return method;
  }
}

export function getStatusDetails(status: InvoiceStatus): {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      };
    case 'partially_paid':
      return {
        label: 'Partially Paid',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    case 'pending':
      return {
        label: 'Pending',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    case 'overdue':
      return {
        label: 'Overdue',
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      };
  }
}

export function sanitizePhoneNumberForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  return cleaned;
}

export function getInvoiceDeepLink(invoice: Invoice, mode: 'invoice' | 'receipt' = 'invoice'): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const modeParam = mode === 'receipt' ? '&mode=receipt' : '';
  return `${baseUrl}?inv=${encodeURIComponent(invoice.invoiceNumber)}${modeParam}`;
}

export function generateWhatsAppMessage(invoice: Invoice): string {
  const itemsText = invoice.items
    .map((item, idx) => `  ${idx + 1}. ${item.description} (x${item.quantity}) - ${formatNaira(item.amount)}`)
    .join('\n');

  const bank = invoice.businessProfile.bankDetails;
  const paymentInfo = bank?.accountNumber
    ? `\n*PAYMENT DETAILS:*\nBank: ${bank.bankName}\nAccount Name: ${bank.accountName}\nAccount Number: ${bank.accountNumber}`
    : '';

  const deepLink = getInvoiceDeepLink(invoice, 'invoice');

  return `*OFFICIAL INVOICE: ${invoice.invoiceNumber}*
From: *${invoice.businessProfile.name}*
Customer: *${invoice.customer.name}*
Date Issued: ${formatDate(invoice.issueDate)}
Due Date: ${formatDate(invoice.dueDate)}

*ITEMS:*
${itemsText}

-----------------------------
*Subtotal:* ${formatNaira(invoice.subtotal)}
${invoice.taxPercent > 0 ? `*VAT (${invoice.taxPercent}%):* ${formatNaira(invoice.taxAmount)}\n` : ''}${invoice.discountAmount > 0 ? `*Discount:* -${formatNaira(invoice.discountAmount)}\n` : ''}*TOTAL AMOUNT:* *${formatNaira(invoice.totalAmount)}*
${invoice.amountPaid > 0 ? `*Amount Paid:* ${formatNaira(invoice.amountPaid)}\n*Balance Due:* *${formatNaira(invoice.balanceDue)}*\n` : ''}-----------------------------
${paymentInfo}

📄 *VIEW / DOWNLOAD OFFICIAL PDF INVOICE:*
${deepLink}

${invoice.notes ? `*Note:* ${invoice.notes}\n\n` : ''}Thank you for your business! Please reply with your payment receipt once transfer is made.`;
}

export function generateReceiptWhatsAppMessage(invoice: Invoice): string {
  const latestPayment = invoice.paymentRecords?.[0];
  const receiptNum = `RCP-${invoice.invoiceNumber.replace(/^[^0-9]*/, '')}`;
  const deepLink = getInvoiceDeepLink(invoice, 'receipt');

  return `*OFFICIAL PAYMENT RECEIPT: ${receiptNum}*
Issued by: *${invoice.businessProfile.name}*
Customer: *${invoice.customer.name}*
Date: ${formatDate(latestPayment?.date || invoice.issueDate)}
Invoice Ref: ${invoice.invoiceNumber}

-----------------------------
*Total Billed:* ${formatNaira(invoice.totalAmount)}
*Total Amount Received:* *${formatNaira(invoice.amountPaid)}*
${latestPayment ? `*Latest Payment:* ${formatNaira(latestPayment.amount)} (${getPaymentMethodLabel(latestPayment.method)})\n*Reference ID:* ${latestPayment.reference || 'N/A'}\n` : ''}*Remaining Balance:* *${formatNaira(invoice.balanceDue)}*
-----------------------------

Status: *${invoice.balanceDue <= 0 ? 'FULLY SETTLED' : 'PARTIALLY PAID'}*

📄 *VIEW / DOWNLOAD OFFICIAL RECEIPT:*
${deepLink}

Thank you for your prompt payment!`;
}

export function generateOverdueReminderMessage(invoice: Invoice): string {
  const bank = invoice.businessProfile.bankDetails;
  const paymentInfo = bank?.accountNumber
    ? `\n*Account Details:*\nBank: ${bank.bankName}\nAccount: ${bank.accountNumber}\nName: ${bank.accountName}`
    : '';

  const deepLink = getInvoiceDeepLink(invoice, 'invoice');

  return `Hello *${invoice.customer.name}*,

This is a gentle payment reminder from *${invoice.businessProfile.name}* regarding your outstanding balance for invoice *${invoice.invoiceNumber}*.

*Invoice Date:* ${formatDate(invoice.issueDate)}
*Due Date:* ${formatDate(invoice.dueDate)}
*Total Invoice:* ${formatNaira(invoice.totalAmount)}
*Amount Paid:* ${formatNaira(invoice.amountPaid)}
*Outstanding Balance:* *${formatNaira(invoice.balanceDue)}*
${paymentInfo}

📄 *View Invoice Details & Download PDF:*
${deepLink}

Kindly make payment and send us the transfer confirmation at your earliest convenience. Thank you!`;
}

export function openWhatsAppShare(invoice: Invoice) {
  const text = encodeURIComponent(generateWhatsAppMessage(invoice));
  const phone = sanitizePhoneNumberForWhatsApp(invoice.customer.phone);
  const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

export function openWhatsAppReceiptShare(invoice: Invoice) {
  const text = encodeURIComponent(generateReceiptWhatsAppMessage(invoice));
  const phone = sanitizePhoneNumberForWhatsApp(invoice.customer.phone);
  const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

export function openWhatsAppReminder(invoice: Invoice) {
  const text = encodeURIComponent(generateOverdueReminderMessage(invoice));
  const phone = sanitizePhoneNumberForWhatsApp(invoice.customer.phone);
  const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}
