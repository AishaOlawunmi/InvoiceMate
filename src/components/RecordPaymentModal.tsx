import React, { useState, useEffect } from 'react';
import { Invoice, PaymentMethod } from '../types';
import { formatNaira, formatDate, getPaymentMethodLabel } from '../utils/formatters';
import {
  X,
  CheckCircle2,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Terminal,
  Hash,
} from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  targetInvoice: Invoice | null;
  onRecord: (data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    date: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoices,
  targetInvoice,
  onRecord,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Unpaid or partially paid invoices
  const eligibleInvoices = invoices.filter((inv) => inv.balanceDue > 0);

  useEffect(() => {
    if (targetInvoice) {
      setSelectedInvoiceId(targetInvoice.id);
      setAmount(targetInvoice.balanceDue);
    } else if (eligibleInvoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(eligibleInvoices[0].id);
      setAmount(eligibleInvoices[0].balanceDue);
    }
  }, [targetInvoice, eligibleInvoices]);

  const activeInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const found = invoices.find((inv) => inv.id === id);
    if (found) {
      setAmount(found.balanceDue);
    }
  };

  const handleSetFullPayment = () => {
    if (activeInvoice) {
      setAmount(activeInvoice.balanceDue);
    }
  };

  const handleSetHalfPayment = () => {
    if (activeInvoice) {
      setAmount(Math.round(activeInvoice.balanceDue / 2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || amount <= 0) return;

    onRecord({
      invoiceId: selectedInvoiceId,
      amount: Number(amount),
      method,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      date,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print selection:bg-[#FF6B4A]/20">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden text-[#111111]">
        {/* Header */}
        <div className="bg-[#111111] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FF6B4A]" />
            <h2 className="text-base font-bold tracking-tight text-white">Record Customer Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Invoice selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Select Invoice to Settle
            </label>
            {eligibleInvoices.length === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                All invoices are fully settled! No outstanding balances.
              </div>
            ) : (
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full text-xs font-medium bg-[#F8F3EA] border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              >
                {eligibleInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customer.name} (Balance: {formatNaira(inv.balanceDue)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeInvoice && (
            <div className="bg-[#F8F3EA] p-3.5 rounded-lg border border-[#EDE6D8] text-xs space-y-1">
              <div className="flex justify-between text-neutral-600">
                <span>Customer:</span>
                <span className="font-semibold text-neutral-900">{activeInvoice.customer.name}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Total Invoice:</span>
                <span className="font-semibold tabular-nums text-neutral-900">{formatNaira(activeInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Already Paid:</span>
                <span className="font-semibold tabular-nums text-emerald-700">{formatNaira(activeInvoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-neutral-200">
                <span className="font-bold text-neutral-800">Remaining Balance:</span>
                <span className="font-bold tabular-nums text-[#FF6B4A]">{formatNaira(activeInvoice.balanceDue)}</span>
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700">
                Amount Paid (₦ Naira)
              </label>
              {activeInvoice && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSetHalfPayment}
                    className="text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                  >
                    50% Deposit
                  </button>
                  <span className="text-neutral-300">·</span>
                  <button
                    type="button"
                    onClick={handleSetFullPayment}
                    className="font-semibold text-[#FF6B4A] hover:underline cursor-pointer"
                  >
                    Full Balance
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-sm">
                ₦
              </span>
              <input
                type="number"
                min="1"
                max={activeInvoice?.balanceDue || 999999999}
                step="any"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-bold tabular-nums focus:outline-hidden focus:border-[#FF6B4A]"
                required
              />
            </div>
            {activeInvoice && amount > 0 && (
              <p className="text-[11px] text-neutral-500 mt-1">
                {amount >= activeInvoice.balanceDue ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marks invoice as Fully Settled!
                  </span>
                ) : (
                  <span>
                    New balance after payment: <strong className="tabular-nums">{formatNaira(activeInvoice.balanceDue - amount)}</strong> (Partially Paid)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Payment Method - Bank Transfer, Cash, POS, USSD, Mobile Banking */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'bank_transfer'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-neutral-900 font-bold shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${method === 'bank_transfer' ? 'text-[#FF6B4A]' : 'text-neutral-400'}`} />
                <span>Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('pos')}
                className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'pos'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-neutral-900 font-bold shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Terminal className={`w-3.5 h-3.5 ${method === 'pos' ? 'text-[#FF6B4A]' : 'text-neutral-400'}`} />
                <span>POS Terminal</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'cash'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-neutral-900 font-bold shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Wallet className={`w-3.5 h-3.5 ${method === 'cash' ? 'text-[#FF6B4A]' : 'text-neutral-400'}`} />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mobile_banking')}
                className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'mobile_banking'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-neutral-900 font-bold shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Smartphone className={`w-3.5 h-3.5 ${method === 'mobile_banking' ? 'text-[#FF6B4A]' : 'text-neutral-400'}`} />
                <span>Mobile App</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('ussd')}
                className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'ussd'
                    ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-neutral-900 font-bold shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Hash className={`w-3.5 h-3.5 ${method === 'ussd' ? 'text-[#FF6B4A]' : 'text-neutral-400'}`} />
                <span>USSD Code</span>
              </button>
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Transaction Reference / Bank Alert ID
              </label>
              <input
                type="text"
                placeholder="e.g. NIP-99201948 or POS RRN"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 font-mono focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Internal Notes / Receipt Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Confirmed in Zenith bank mobile app"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || !selectedInvoiceId}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#222222] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FF6B4A]" />
              <span>Confirm & Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
