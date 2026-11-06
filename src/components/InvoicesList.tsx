import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useInvoice } from '../context/InvoiceContext';
import {
  formatNaira,
  formatDate,
  getStatusDetails,
  openWhatsAppShare,
  getInvoiceDeepLink,
} from '../utils/formatters';
import {
  Plus,
  Search,
  Eye,
  CreditCard,
  Trash2,
  FileText,
  MessageCircle,
  Link2,
  Check,
} from 'lucide-react';

interface InvoicesListProps {
  onCreateClick: () => void;
  onEditClick: (invoice: Invoice) => void;
}

export const InvoicesList: React.FC<InvoicesListProps> = ({
  onCreateClick,
}) => {
  const {
    invoices,
    setSelectedInvoiceForView,
    setIsRecordPaymentOpen,
    setPaymentTargetInvoice,
    deleteInvoice,
    business,
  } = useInvoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Filter & Search
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.items.some((it) => it.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      if (sortBy === 'date_asc') return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
      if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
      return 0;
    });

  const handleRecordPayment = (inv: Invoice) => {
    setPaymentTargetInvoice(inv);
    setIsRecordPaymentOpen(true);
  };

  const handleDelete = (inv: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
      deleteInvoice(inv.id);
    }
  };

  const handleCopyLink = async (inv: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = getInvoiceDeepLink(inv, 'invoice');
    try {
      await navigator.clipboard.writeText(link);
      setCopiedInvoiceId(inv.id);
      setTimeout(() => setCopiedInvoiceId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6 pb-12 selection:bg-[#FF6B4A]/20">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500 mb-0.5">{business.name || 'Your Business'}</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Invoices & Billing History
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage tax invoices, send WhatsApp summaries with PDF links, track payments, and issue receipts.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="bg-[#FF6B4A] hover:bg-[#e05838] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search invoice #, client, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#F8F3EA]/50 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#FF6B4A]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-neutral-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#F8F3EA]/50 border border-neutral-300 rounded-lg px-2.5 py-1.5 font-medium cursor-pointer"
            >
              <option value="date_desc">Latest Date First</option>
              <option value="date_asc">Oldest Date First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-neutral-100 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Paid ({invoices.filter((i) => i.status === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('partially_paid')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'partially_paid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            Partially Paid ({invoices.filter((i) => i.status === 'partially_paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Pending ({invoices.filter((i) => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Overdue ({invoices.filter((i) => i.status === 'overdue').length})
          </button>
        </div>
      </div>

      {/* Invoices Master Table (Desktop & Tablets) */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800">No matching invoices</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your filter or search terms, or create a new invoice for your clients.
            </p>
            <button
              onClick={onCreateClick}
              className="bg-[#111111] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F8F3EA]/60 text-neutral-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Issue Date</th>
                    <th className="py-3 px-4 font-semibold">Due Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Total (₦)</th>
                    <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredInvoices.map((inv) => {
                    const status = getStatusDetails(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="hover:text-[#FF6B4A] underline cursor-pointer"
                          >
                            {inv.invoiceNumber}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-900">{inv.customer.name}</p>
                          <p className="text-[11px] text-neutral-500 font-mono">{inv.customer.phone}</p>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                          {formatDate(inv.issueDate)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={inv.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-neutral-500'}>
                            {formatDate(inv.dueDate)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-neutral-900">
                          {formatNaira(inv.totalAmount)}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums">
                          {inv.balanceDue > 0 ? (
                            <span className="font-bold text-[#FF6B4A]">
                              {formatNaira(inv.balanceDue)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">₦0.00</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${status.bgColor} ${status.textColor} ${status.borderColor}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Direct Share via WhatsApp Button */}
                            <button
                              onClick={() => openWhatsAppShare(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-md text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                              title="Share invoice summary & client PDF link via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                              <span>WhatsApp</span>
                            </button>

                            {/* View & Print Document */}
                            <button
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              title="View & Print Invoice / Receipt"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Copy PDF Link */}
                            <button
                              onClick={(e) => handleCopyLink(inv, e)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              title="Copy client PDF preview link"
                            >
                              {copiedInvoiceId === inv.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Link2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Record Payment */}
                            {inv.balanceDue > 0 && (
                              <button
                                onClick={() => handleRecordPayment(inv)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Record payment"
                              >
                                <CreditCard className="w-3 h-3 inline mr-1" />
                                Pay
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(inv)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout for Nigerian SMEs on Phones */}
            <div className="md:hidden divide-y divide-neutral-200">
              {filteredInvoices.map((inv) => {
                const status = getStatusDetails(inv.status);
                return (
                  <div key={inv.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => setSelectedInvoiceForView(inv)}
                          className="font-mono font-bold text-sm text-neutral-900 hover:text-[#FF6B4A] underline text-left"
                        >
                          {inv.invoiceNumber}
                        </button>
                        <p className="font-semibold text-neutral-800 text-xs mt-0.5">
                          {inv.customer.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {inv.customer.phone}
                        </p>
                      </div>

                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${status.bgColor} ${status.textColor} ${status.borderColor}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#F8F3EA]/60 p-2.5 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Total Amount</span>
                        <span className="font-bold text-neutral-900 tabular-nums">
                          {formatNaira(inv.totalAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Balance Due</span>
                        <span
                          className={`font-bold tabular-nums ${
                            inv.balanceDue > 0 ? 'text-[#FF6B4A]' : 'text-emerald-700'
                          }`}
                        >
                          {inv.balanceDue > 0 ? formatNaira(inv.balanceDue) : '₦0.00'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Issued: {formatDate(inv.issueDate)}</span>
                      <span>Due: {formatDate(inv.dueDate)}</span>
                    </div>

                    {/* Direct Full-Width Mobile WhatsApp Share Button */}
                    <button
                      type="button"
                      onClick={() => openWhatsAppShare(inv)}
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs shadow-2xs transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white/20" />
                      <span>Share via WhatsApp (with PDF Link)</span>
                    </button>

                    {/* Mobile Secondary Actions Row */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForView(inv)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(inv, e)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1.5 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="Copy PDF link"
                      >
                        {copiedInvoiceId === inv.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Link</span>
                          </>
                        )}
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRecordPayment(inv)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(inv)}
                        className="text-neutral-400 hover:text-rose-600 p-1.5 rounded-md transition-colors cursor-pointer"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
