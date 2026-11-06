import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatNaira, formatDate, getStatusDetails, getPaymentMethodLabel } from '../utils/formatters';
import { Building2, Phone, Mail, MapPin, Copy, Check, ShieldCheck } from 'lucide-react';

interface InvoiceDocumentProps {
  invoice: Invoice;
  isReceiptMode?: boolean;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, isReceiptMode = false }) => {
  const [copiedBank, setCopiedBank] = useState(false);
  const statusDetails = getStatusDetails(invoice.status);
  const bank = invoice.businessProfile.bankDetails;

  const copyBankInfo = () => {
    if (!bank) return;
    const text = `${bank.bankName}\nAccount: ${bank.accountNumber}\nName: ${bank.accountName}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="print-container bg-white text-[#111111] p-6 sm:p-10 rounded-xl border border-neutral-200 shadow-sm max-w-3xl mx-auto selection:bg-[#FF6B4A]/20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-neutral-200">
        <div>
          {invoice.businessProfile.logoUrl ? (
            <img
              src={invoice.businessProfile.logoUrl}
              alt={invoice.businessProfile.name}
              className="h-12 w-auto object-contain mb-3"
            />
          ) : (
            <div className="h-11 w-11 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-lg mb-3">
              {invoice.businessProfile.name.charAt(0)}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            {invoice.businessProfile.name}
          </h1>
          {invoice.businessProfile.tagline && (
            <p className="text-xs text-neutral-500 mt-0.5 max-w-sm">
              {invoice.businessProfile.tagline}
            </p>
          )}

          <div className="mt-3 text-xs text-neutral-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{invoice.businessProfile.address}, {invoice.businessProfile.state}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{invoice.businessProfile.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{invoice.businessProfile.email}</span>
              </span>
            </div>
            {(invoice.businessProfile.rcNumber || invoice.businessProfile.taxId) && (
              <div className="text-[11px] text-neutral-500 pt-1 flex items-center gap-2">
                {invoice.businessProfile.rcNumber && (
                  <span className="font-mono">RC: {invoice.businessProfile.rcNumber}</span>
                )}
                {invoice.businessProfile.rcNumber && invoice.businessProfile.taxId && <span>·</span>}
                {invoice.businessProfile.taxId && (
                  <span className="font-mono">TIN: {invoice.businessProfile.taxId}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Metadata & Status */}
        <div className="sm:text-right shrink-0">
          <div className="inline-block mb-3">
            <span className="text-2xl font-extrabold tracking-tight text-[#111111] uppercase block">
              {isReceiptMode ? 'OFFICIAL RECEIPT' : 'TAX INVOICE'}
            </span>
            <span className="font-mono text-sm font-semibold text-[#FF6B4A]">
              {isReceiptMode ? `RCP-${invoice.invoiceNumber.replace('INV-', '')}` : invoice.invoiceNumber}
            </span>
          </div>

          <div className="text-xs text-neutral-600 space-y-1.5">
            <div>
              <span className="text-neutral-400">Date Issued: </span>
              <span className="font-medium text-neutral-900">{formatDate(invoice.issueDate)}</span>
            </div>
            {!isReceiptMode && (
              <div>
                <span className="text-neutral-400">Due Date: </span>
                <span className="font-medium text-neutral-900">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
            <div>
              <span className="text-neutral-400">Status: </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusDetails.bgColor} ${statusDetails.textColor} ${statusDetails.borderColor}`}>
                {statusDetails.label.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To & Client Details */}
      <div className="py-6 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
            {isReceiptMode ? 'Received From:' : 'Billed To:'}
          </span>
          <p className="text-sm font-bold text-[#111111]">{invoice.customer.name}</p>
          {invoice.customer.businessName && (
            <p className="text-neutral-600 font-medium">{invoice.customer.businessName}</p>
          )}
          <p className="text-neutral-600 mt-1">{invoice.customer.address}</p>
          {invoice.customer.state && <p className="text-neutral-500">{invoice.customer.state}</p>}
          <div className="mt-2 text-neutral-600 space-y-0.5">
            <p>{invoice.customer.phone}</p>
            {invoice.customer.email && <p>{invoice.customer.email}</p>}
          </div>
        </div>

        <div className="sm:text-right flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Payment Summary
            </span>
            <div className="space-y-1">
              <div className="flex sm:justify-end gap-3">
                <span className="text-neutral-500">Invoice Total:</span>
                <span className="font-bold tabular-nums text-neutral-900">{formatNaira(invoice.totalAmount)}</span>
              </div>
              <div className="flex sm:justify-end gap-3">
                <span className="text-neutral-500">Amount Paid:</span>
                <span className="font-semibold tabular-nums text-emerald-700">{formatNaira(invoice.amountPaid)}</span>
              </div>
              <div className="flex sm:justify-end gap-3 pt-1 border-t border-neutral-200">
                <span className="font-bold text-neutral-900">Balance Due:</span>
                <span className={`font-extrabold tabular-nums ${invoice.balanceDue > 0 ? 'text-[#FF6B4A]' : 'text-neutral-900'}`}>
                  {formatNaira(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="py-6 border-b border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider text-[11px]">
              <th className="pb-2.5 font-bold w-10">#</th>
              <th className="pb-2.5 font-bold">Item & Description</th>
              <th className="pb-2.5 font-bold text-right w-16">Qty</th>
              <th className="pb-2.5 font-bold text-right w-28">Rate</th>
              <th className="pb-2.5 font-bold text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="text-neutral-700">
                <td className="py-3 text-neutral-400 font-mono">{index + 1}</td>
                <td className="py-3 font-medium text-neutral-900 pr-4">{item.description}</td>
                <td className="py-3 text-right tabular-nums text-neutral-600">{item.quantity}</td>
                <td className="py-3 text-right tabular-nums text-neutral-600">{formatNaira(item.unitPrice)}</td>
                <td className="py-3 text-right tabular-nums font-semibold text-neutral-900">{formatNaira(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Breakdown */}
      <div className="py-6 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
        {/* Payment instructions / Bank details */}
        <div className="w-full sm:max-w-xs bg-[#F8F3EA] p-4 rounded-lg border border-[#EDE6D8]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#111111] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
              Official Bank Details
            </span>
            <button
              onClick={copyBankInfo}
              type="button"
              className="no-print inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B4A] hover:text-[#e05838] transition-colors"
              title="Copy account details"
            >
              {copiedBank ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {bank ? (
            <div className="space-y-1 text-neutral-700 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Bank:</span>
                <span className="font-semibold text-neutral-900">{bank.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Account No:</span>
                <span className="font-mono font-bold text-neutral-900">{bank.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Account Name:</span>
                <span className="font-medium text-neutral-900 text-right">{bank.accountName}</span>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500 text-[11px]">Please contact business for bank transfer details.</p>
          )}
        </div>

        {/* Totals column */}
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal:</span>
            <span className="font-semibold tabular-nums text-neutral-900">{formatNaira(invoice.subtotal)}</span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({invoice.discountPercent}%):</span>
              <span className="font-semibold tabular-nums">-{formatNaira(invoice.discountAmount)}</span>
            </div>
          )}

          {invoice.taxPercent > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>VAT ({invoice.taxPercent}%):</span>
              <span className="font-semibold tabular-nums text-neutral-900">+{formatNaira(invoice.taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-extrabold text-[#111111] pt-2 border-t border-neutral-200">
            <span>Total:</span>
            <span className="tabular-nums">{formatNaira(invoice.totalAmount)}</span>
          </div>

          {invoice.amountPaid > 0 && (
            <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
              <span>Amount Paid:</span>
              <span className="tabular-nums">{formatNaira(invoice.amountPaid)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-extrabold text-[#111111] pt-2 border-t border-neutral-300">
            <span>Balance Due:</span>
            <span className={`tabular-nums ${invoice.balanceDue > 0 ? 'text-[#FF6B4A]' : 'text-neutral-900'}`}>
              {formatNaira(invoice.balanceDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment records history (if any recorded) */}
      {invoice.paymentRecords && invoice.paymentRecords.length > 0 && (
        <div className="py-4 border-b border-neutral-200 text-xs">
          <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] block mb-2">
            Payment Log & Receipts
          </span>
          <div className="space-y-1.5">
            {invoice.paymentRecords.map((pay) => (
              <div key={pay.id} className="flex justify-between items-center bg-neutral-50 p-2 rounded text-neutral-700 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">{formatNaira(pay.amount)}</span>
                  <span className="text-neutral-400">via</span>
                  <span>{getPaymentMethodLabel(pay.method)}</span>
                  {pay.reference && <span className="font-mono text-neutral-500">({pay.reference})</span>}
                </div>
                <div className="text-neutral-500">{formatDate(pay.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes and Terms Footer */}
      <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-neutral-500">
        <div>
          <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] block mb-1">
            Notes / Instructions
          </span>
          <p className="leading-relaxed">
            {invoice.notes || invoice.businessProfile.defaultNotes || 'Thank you for your business. We look forward to serving you again.'}
          </p>
        </div>

        <div>
          <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] block mb-1">
            Terms & Conditions
          </span>
          <p className="leading-relaxed">
            {invoice.businessProfile.defaultTerms || 'Payment due as specified. Transfer charges apply if using third-party channels.'}
          </p>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          <span>Generated securely via InvoiceMate Nigeria</span>
        </div>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};
