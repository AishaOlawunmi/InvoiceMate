import React from 'react';
import { Invoice, PaymentRecord } from '../types';
import { useInvoice } from '../context/InvoiceContext';
import {
  formatNaira,
  formatDate,
  getStatusDetails,
  getPaymentMethodLabel,
  openWhatsAppShare,
  openWhatsAppReminder,
} from '../utils/formatters';
import {
  Plus,
  UserPlus,
  CreditCard,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Share2,
  ArrowRight,
  MessageCircle,
  Building2,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: 'invoices' | 'create-invoice' | 'customers' | 'payments' | 'settings') => void;
  onOpenAddCustomer: () => void;
  onOpenSetup: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenAddCustomer,
  onOpenSetup,
}) => {
  const {
    business,
    invoices,
    setSelectedInvoiceForView,
    setIsRecordPaymentOpen,
    setPaymentTargetInvoice,
  } = useInvoice();

  // Financial calculations
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const pendingInvoices = invoices.filter(
    (inv) => inv.status === 'pending' || inv.status === 'partially_paid'
  );
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');

  const totalRevenueCollected = invoices.reduce(
    (sum, inv) => sum + (inv.amountPaid || 0),
    0
  );

  const totalPendingAmount = pendingInvoices.reduce(
    (sum, inv) => sum + (inv.balanceDue || 0),
    0
  );

  const totalOverdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + (inv.balanceDue || 0),
    0
  );

  // Invoices with outstanding balances (overdue or partial/pending with balance)
  const debtorInvoices = invoices
    .filter((inv) => inv.balanceDue > 0)
    .sort((a, b) => {
      // Overdue first, then highest balance
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return b.balanceDue - a.balanceDue;
    });

  // Recent payment records
  const recentPayments: PaymentRecord[] = invoices
    .flatMap((inv) => inv.paymentRecords || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleRecordPaymentClick = (invoice?: Invoice) => {
    if (invoice) {
      setPaymentTargetInvoice(invoice);
    } else {
      setPaymentTargetInvoice(null);
    }
    setIsRecordPaymentOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Onboarding Alert Banner if Setup Not Completed */}
      {!business.isSetupComplete && (
        <div className="bg-[#111111] text-white p-4 sm:p-5 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#222222] text-[#FF6B4A] rounded-lg shrink-0 mt-0.5 sm:mt-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Set up your official business profile</span>
                <span className="text-[10px] bg-[#FF6B4A] text-white px-2 py-0.5 rounded-full font-semibold">
                  Required
                </span>
              </h2>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                Add your business name and Nigerian bank account so they automatically appear on your invoices and payment receipts.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSetup}
            className="px-4 py-2 bg-[#FF6B4A] hover:bg-[#e05838] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            Complete Setup Now
          </button>
        </div>
      )}

      {/* Top Header & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span className="font-semibold text-neutral-900">
              {business.name || 'Your Business'}
            </span>
            <span>·</span>
            <span>{business.category || 'Nigerian SME'}</span>
            <span>·</span>
            <span className="text-neutral-500">{business.state || 'Nigeria'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Overview of your daily invoicing, cleared payments, and outstanding balances.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('create-invoice')}
            className="bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#FF6B4A]" />
            <span>Create Invoice</span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="bg-[#F8F3EA] hover:bg-[#EDE6D8] text-[#111111] border border-neutral-300 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-neutral-600" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => handleRecordPaymentClick()}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#111111] tabular-nums">
            {formatNaira(totalRevenueCollected)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Cleared customer payments</p>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Paid Invoices</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
            {paidInvoices.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% settled in full</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Pending Payments</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tabular-nums">
            {formatNaira(totalPendingAmount)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">{pendingInvoices.length} invoices awaiting payment</p>
        </div>

        {/* Overdue Balances */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Overdue Balances</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 tabular-nums">
            {formatNaira(totalOverdueAmount)}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {overdueInvoices.length} overdue invoices
          </p>
        </div>
      </div>

      {/* Overdue Payment Reminder Section: Customers with outstanding balances */}
      {debtorInvoices.length > 0 && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-100">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-rose-950">
                  Customers with outstanding balances
                </h2>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Send a polite WhatsApp reminder with your invoice details and bank account to recover funds faster.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 tabular-nums self-start sm:self-auto">
              Total Outstanding: {formatNaira(totalPendingAmount + totalOverdueAmount)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {debtorInvoices.slice(0, 6).map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-lg border border-neutral-200 bg-[#F8F3EA]/30 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-xs text-neutral-900">{inv.customer.name}</p>
                    {inv.customer.businessName && (
                      <p className="text-[11px] text-neutral-500">{inv.customer.businessName}</p>
                    )}
                    <span className="text-[10px] font-mono text-neutral-400 mt-0.5 block">
                      {inv.invoiceNumber} · Due: {formatDate(inv.dueDate)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-rose-600 block">
                      {inv.status === 'overdue' ? 'Overdue' : 'Balance'}
                    </span>
                    <span className="font-extrabold text-sm tabular-nums text-rose-700">
                      {formatNaira(inv.balanceDue)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-neutral-200/60">
                  <button
                    type="button"
                    onClick={() => openWhatsAppReminder(inv)}
                    className="flex-1 py-1.5 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Send gentle payment reminder to customer via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Reminder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecordPaymentClick(inv)}
                    className="py-1.5 px-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                    title="Record payment"
                  >
                    Record Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Invoices & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Invoices (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111111]">Recent Invoices</h2>
              <p className="text-xs text-neutral-500">Latest invoices issued to customers</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-[#FF6B4A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-800">No invoices yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
                Create your first professional invoice and share it directly on WhatsApp or download as PDF.
              </p>
              <button
                onClick={() => onNavigate('create-invoice')}
                className="bg-[#111111] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Create First Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 bg-[#F8F3EA]/50 text-neutral-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Invoice</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {invoices.slice(0, 5).map((inv) => {
                    const status = getStatusDetails(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-neutral-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-neutral-900">{inv.customer.name}</p>
                          {inv.customer.businessName && (
                            <p className="text-[11px] text-neutral-500 truncate max-w-[140px]">
                              {inv.customer.businessName}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                          {formatDate(inv.issueDate)}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums">
                          <p className="font-bold text-neutral-900">{formatNaira(inv.totalAmount)}</p>
                          {inv.balanceDue > 0 && inv.status !== 'pending' && (
                            <p className="text-[10px] text-[#FF6B4A]">Bal: {formatNaira(inv.balanceDue)}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${status.bgColor} ${status.textColor} ${status.borderColor}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              title="View & Print Invoice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openWhatsAppShare(inv)}
                              className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors cursor-pointer"
                              title="Send to WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            {inv.balanceDue > 0 && (
                              <button
                                onClick={() => handleRecordPaymentClick(inv)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Record payment"
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Recent Payments & Official Bank Details */}
        <div className="space-y-6">
          {/* Recent Payments Stream */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-sm font-bold text-[#111111]">Recent Payments</h2>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs font-semibold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                All Receipts
              </button>
            </div>

            {recentPayments.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">
                No payments recorded yet. Click &ldquo;Record Payment&rdquo; to log bank transfer alerts or cash.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100 mt-2">
                {recentPayments.map((pay) => (
                  <div key={pay.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-neutral-900">{pay.customerName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                        <span>{getPaymentMethodLabel(pay.method)}</span>
                        <span>·</span>
                        <span>{formatDate(pay.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-emerald-700">
                        +{formatNaira(pay.amount)}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400">{pay.invoiceNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Business Bank Details Card */}
          <div className="bg-[#111111] text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF6B4A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Receiving Bank Account
                </span>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[11px] text-[#FF6B4A] hover:underline font-semibold cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div>
              <p className="text-base font-bold text-white">
                {business.bankDetails?.bankName || 'Bank Name Not Set'}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xl font-bold tracking-wider text-[#FF6B4A]">
                  {business.bankDetails?.accountNumber || '0000000000'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium pt-0.5 uppercase">
                {business.bankDetails?.accountName || business.name || 'Set Account Name'}
              </p>
            </div>

            <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
              This account appears on your invoices for customer direct transfers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
