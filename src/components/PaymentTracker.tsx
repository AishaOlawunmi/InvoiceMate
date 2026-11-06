import React, { useState } from 'react';
import { PaymentMethod, PaymentRecord, Invoice } from '../types';
import { useInvoice } from '../context/InvoiceContext';
import {
  formatNaira,
  formatDate,
  getPaymentMethodLabel,
} from '../utils/formatters';
import {
  CreditCard,
  Building2,
  Terminal,
  Wallet,
  Smartphone,
  Plus,
  Search,
  Receipt,
  Hash,
} from 'lucide-react';

interface PaymentTrackerProps {
  onViewInvoice: (invoice: Invoice) => void;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ onViewInvoice }) => {
  const {
    invoices,
    setIsRecordPaymentOpen,
    setPaymentTargetInvoice,
    business,
  } = useInvoice();

  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all payment records from invoices
  const allPayments: PaymentRecord[] = invoices
    .flatMap((inv) => inv.paymentRecords || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Method totals
  const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const bankTransferTotal = allPayments
    .filter((p) => p.method === 'bank_transfer')
    .reduce((sum, p) => sum + p.amount, 0);
  const posTotal = allPayments
    .filter((p) => p.method === 'pos')
    .reduce((sum, p) => sum + p.amount, 0);
  const cashTotal = allPayments
    .filter((p) => p.method === 'cash')
    .reduce((sum, p) => sum + p.amount, 0);
  const mobileBankingTotal = allPayments
    .filter((p) => p.method === 'mobile_banking')
    .reduce((sum, p) => sum + p.amount, 0);
  const ussdTotal = allPayments
    .filter((p) => p.method === 'ussd')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filtered payments
  const filteredPayments = allPayments.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;

    return true;
  });

  const handleOpenRecordPayment = () => {
    setPaymentTargetInvoice(null);
    setIsRecordPaymentOpen(true);
  };

  const handleViewReceiptForPayment = (payment: PaymentRecord) => {
    const parentInvoice = invoices.find(
      (inv) => inv.id === payment.invoiceId || inv.invoiceNumber === payment.invoiceNumber
    );
    if (parentInvoice) {
      onViewInvoice(parentInvoice);
    }
  };

  return (
    <div className="space-y-6 pb-12 selection:bg-[#FF6B4A]/20">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500 mb-0.5">{business.name || 'Your Business'}</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Payment Reconciliation & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Log bank transfer alerts, POS receipts, cash deposits, mobile banking, and USSD payments.
          </p>
        </div>

        <button
          onClick={handleOpenRecordPayment}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* KPI Cards per Payment Channel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Collected */}
        <div className="bg-[#111111] text-white p-4 sm:p-5 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
            Total Revenue Logged
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">
            {formatNaira(totalCollected)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across all payment channels</p>
        </div>

        {/* Bank Transfer */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Bank Transfer</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">
            {formatNaira(bankTransferTotal)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Direct NIP / Bank App</p>
        </div>

        {/* POS Terminal */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">POS Terminal</span>
            <Terminal className="w-4 h-4 text-[#FF6B4A]" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">
            {formatNaira(posTotal)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Moniepoint / OPay terminal</p>
        </div>

        {/* Cash */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Cash Collected</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">
            {formatNaira(cashTotal)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">In-store cash register</p>
        </div>

        {/* Mobile Banking & USSD */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Mobile / USSD</span>
            <Smartphone className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">
            {formatNaira(mobileBankingTotal + ussdTotal)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">USSD & Mobile Apps</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reference, customer, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F8F3EA]/50 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#FF6B4A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
          <button
            onClick={() => setMethodFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'all'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Channels ({allPayments.length})
          </button>
          <button
            onClick={() => setMethodFilter('bank_transfer')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'bank_transfer'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Bank Transfer
          </button>
          <button
            onClick={() => setMethodFilter('pos')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'pos'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            POS
          </button>
          <button
            onClick={() => setMethodFilter('cash')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'cash'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setMethodFilter('mobile_banking')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'mobile_banking'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Mobile Banking
          </button>
          <button
            onClick={() => setMethodFilter('ussd')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              methodFilter === 'ussd'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            USSD
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800">No payment records found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              When clients pay into your account or pay cash, record it here to auto-settle their invoice balance.
            </p>
            <button
              onClick={handleOpenRecordPayment}
              className="bg-[#111111] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Record First Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F8F3EA]/60 text-neutral-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Session / Reference</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₦)</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                      {formatDate(pay.date)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {pay.customerName}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {pay.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-800">
                        {pay.method === 'bank_transfer' && <Building2 className="w-3 h-3 text-blue-600" />}
                        {pay.method === 'pos' && <Terminal className="w-3 h-3 text-[#FF6B4A]" />}
                        {pay.method === 'cash' && <Wallet className="w-3 h-3 text-emerald-600" />}
                        {pay.method === 'mobile_banking' && <Smartphone className="w-3 h-3 text-purple-600" />}
                        {pay.method === 'ussd' && <Hash className="w-3 h-3 text-amber-600" />}
                        <span>{getPaymentMethodLabel(pay.method)}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                      {pay.reference || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-extrabold text-emerald-700 text-sm">
                      +{formatNaira(pay.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewReceiptForPayment(pay)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#111111] hover:text-[#FF6B4A] bg-[#F8F3EA] hover:bg-[#EDE6D8] border border-neutral-300 rounded-md transition-colors cursor-pointer"
                        title="View Official Payment Receipt"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
