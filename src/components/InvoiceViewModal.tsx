import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { InvoiceDocument } from './InvoiceDocument';
import {
  openWhatsAppShare,
  openWhatsAppReceiptShare,
  generateWhatsAppMessage,
  generateReceiptWhatsAppMessage,
  getInvoiceDeepLink,
  sanitizePhoneNumberForWhatsApp,
} from '../utils/formatters';
import {
  X,
  Printer,
  CreditCard,
  Copy,
  Check,
  FileText,
  Receipt,
  MessageCircle,
  Link2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  initialReceiptMode?: boolean;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  initialReceiptMode = false,
  onClose,
  onRecordPayment,
}) => {
  const [isReceiptMode, setIsReceiptMode] = useState(initialReceiptMode);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);

  useEffect(() => {
    setIsReceiptMode(initialReceiptMode);
  }, [initialReceiptMode, invoice?.id]);

  if (!invoice) return null;

  const deepLink = getInvoiceDeepLink(invoice, isReceiptMode ? 'receipt' : 'invoice');
  const sanitizedPhone = sanitizePhoneNumberForWhatsApp(invoice.customer.phone);
  const currentWhatsAppMessage = isReceiptMode
    ? generateReceiptWhatsAppMessage(invoice)
    : generateWhatsAppMessage(invoice);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppAction = () => {
    if (isReceiptMode) {
      openWhatsAppReceiptShare(invoice);
    } else {
      openWhatsAppShare(invoice);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(currentWhatsAppMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 no-print selection:bg-[#FF6B4A]/20">
      <div className="bg-[#F8F3EA] rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl border border-neutral-300 overflow-hidden text-[#111111] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top action toolbar */}
        <div className="bg-[#111111] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="font-mono font-bold text-sm sm:text-base text-white tracking-tight">
              {invoice.invoiceNumber}
            </span>

            {/* Invoice vs Receipt Toggle */}
            <div className="flex items-center bg-[#222222] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setIsReceiptMode(false)}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isReceiptMode
                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptMode(true)}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isReceiptMode
                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Receipt</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {invoice.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => onRecordPayment(invoice)}
                className="hidden sm:flex bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            {/* Direct WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppAction}
              className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
              title={isReceiptMode ? 'Share Official Receipt via WhatsApp' : 'Share Invoice via WhatsApp'}
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>{isReceiptMode ? 'Share Receipt via WhatsApp' : 'Share via WhatsApp'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#2A2A2A] hover:bg-[#383838] text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print / PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Sharing Hub & Client Deep-Link Banner */}
        <div className="bg-[#222E35] border-b border-[#2A3942] text-white px-4 sm:px-6 py-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <span className="text-neutral-300 font-medium">WhatsApp Recipient: </span>
                <span className="font-semibold text-white">{invoice.customer.name}</span>
                {invoice.customer.phone && (
                  <span className="text-[#25D366] font-mono ml-1.5 text-[11px]">
                    ({invoice.customer.phone})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Copy Direct PDF Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-[#2A3942] hover:bg-[#384a56] text-neutral-200 text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy client deep-link URL to PDF preview"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy PDF Link</span>
                  </>
                )}
              </button>

              {/* Copy Full Message */}
              <button
                type="button"
                onClick={handleCopyText}
                className="bg-[#2A3942] hover:bg-[#384a56] text-neutral-200 text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy pre-filled WhatsApp message text"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {/* Toggle Message Preview */}
              <button
                type="button"
                onClick={() => setShowSharePreview(!showSharePreview)}
                className="text-neutral-300 hover:text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 hover:bg-[#2A3942] transition-colors cursor-pointer"
              >
                <span>{showSharePreview ? 'Hide Preview' : 'Preview Message'}</span>
                {showSharePreview ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable WhatsApp Message Preview Drawer */}
          {showSharePreview && (
            <div className="mt-3 pt-3 border-t border-[#2A3942] animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Pre-filled WhatsApp Message with Client Deep-Link:
                </span>
                <span className="text-[11px] text-[#25D366]">
                  Target: {sanitizedPhone ? `+${sanitizedPhone}` : 'Direct Share'}
                </span>
              </div>
              <div className="bg-[#111B21] rounded-lg p-3 font-mono text-[11px] sm:text-xs text-neutral-200 whitespace-pre-wrap border border-[#2A3942] max-h-48 overflow-y-auto leading-relaxed selection:bg-[#25D366]/30">
                {currentWhatsAppMessage}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5 truncate mr-2">
                  <span className="text-neutral-500">Deep-link:</span>
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] hover:underline flex items-center gap-0.5 truncate"
                  >
                    <span className="truncate">{deepLink}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-0.5" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleWhatsAppAction}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-3 py-1 rounded-md shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable invoice or receipt document render area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
          <InvoiceDocument invoice={invoice} isReceiptMode={isReceiptMode} />
        </div>

        {/* Bottom footer bar */}
        <div className="bg-[#EDE6D8] px-4 sm:px-6 py-2.5 text-xs text-neutral-600 flex flex-wrap items-center justify-between gap-2 border-t border-[#DFD6C4] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              Tip: Click <strong>Share via WhatsApp</strong> to immediately send the invoice summary and live PDF preview link to your customer.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {invoice.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => onRecordPayment(invoice)}
                className="sm:hidden text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded cursor-pointer"
              >
                Record Payment
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-neutral-900 hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

