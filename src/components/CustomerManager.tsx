import React, { useState } from 'react';
import { Customer, Invoice } from '../types';
import { useInvoice } from '../context/InvoiceContext';
import { formatNaira, formatDate, getStatusDetails, openWhatsAppShare } from '../utils/formatters';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  FileText,
  MessageCircle,
  ExternalLink,
  X,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface CustomerManagerProps {
  onSelectInvoice: (invoice: Invoice) => void;
  isOpenAddCustomerDirectly?: boolean;
  onCloseAddCustomerDirectly?: () => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  onSelectInvoice,
  isOpenAddCustomerDirectly = false,
  onCloseAddCustomerDirectly,
}) => {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer } = useInvoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBalanceOnly, setFilterBalanceOnly] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(isOpenAddCustomerDirectly);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Lagos State');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setBusinessName('');
    setPhone('+234 ');
    setEmail('');
    setAddress('');
    setState('Lagos State');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setBusinessName(cust.businessName || '');
    setPhone(cust.phone);
    setEmail(cust.email || '');
    setAddress(cust.address);
    setState(cust.state || 'Lagos State');
    setNotes(cust.notes || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseAddCustomerDirectly) onCloseAddCustomerDirectly();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: name.trim(),
        businessName: businessName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        state,
        notes: notes.trim(),
      });
    } else {
      addCustomer({
        name: name.trim(),
        businessName: businessName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        state,
        notes: notes.trim(),
      });
    }

    handleCloseModal();
  };

  const handleDelete = (cust: Customer) => {
    const custInvoices = invoices.filter((i) => i.customerId === cust.id);
    const confirmMsg = custInvoices.length > 0
      ? `This customer has ${custInvoices.length} invoices recorded. Are you sure you want to delete ${cust.name}?`
      : `Are you sure you want to delete customer ${cust.name}?`;

    if (window.confirm(confirmMsg)) {
      deleteCustomer(cust.id);
      if (selectedCustomerForHistory?.id === cust.id) {
        setSelectedCustomerForHistory(null);
      }
    }
  };

  // Compute metrics per customer
  const getCustomerMetrics = (customerId: string) => {
    const custInvoices = invoices.filter((inv) => inv.customerId === customerId);
    const totalBilled = custInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = custInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const balanceDue = custInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    return {
      count: custInvoices.length,
      totalBilled,
      totalPaid,
      balanceDue,
      invoices: custInvoices,
    };
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.businessName && cust.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cust.phone.includes(searchQuery) ||
      (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterBalanceOnly) {
      const { balanceDue } = getCustomerMetrics(cust.id);
      return balanceDue > 0;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12 selection:bg-[#FF6B4A]/20">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500 mb-0.5">Customer Relationship Management</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Customers & Debtors Directory
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Track customer invoicing history, payment receipts, and outstanding Nigerian balances.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#FF6B4A]" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, company, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F8F3EA]/50 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#FF6B4A]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilterBalanceOnly(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              !filterBalanceOnly
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilterBalanceOnly(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterBalanceOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Has Unpaid Balance
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800">No customers found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              Add your Nigerian clients to start sending invoices and tracking payments.
            </p>
            <button
              onClick={openAddModal}
              className="bg-[#111111] text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Add First Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F8F3EA]/60 text-neutral-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Customer / Business</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">State / Location</th>
                  <th className="py-3 px-4 font-semibold text-center">Invoices</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount Paid</th>
                  <th className="py-3 px-4 font-semibold text-right">Outstanding Balance</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredCustomers.map((cust) => {
                  const metrics = getCustomerMetrics(cust.id);
                  return (
                    <tr key={cust.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900 text-sm">{cust.name}</p>
                        {cust.businessName && (
                          <p className="text-neutral-500 text-[11px] font-medium">{cust.businessName}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-neutral-800 font-mono text-[11px]">
                          <span>{cust.phone}</span>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366] hover:opacity-80 ml-1"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 inline" />
                          </a>
                        </div>
                        {cust.email && (
                          <p className="text-neutral-400 text-[11px] truncate max-w-[150px]">
                            {cust.email}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                        <span className="font-medium">{cust.state || 'Lagos'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedCustomerForHistory(cust)}
                          className="font-bold text-neutral-800 hover:text-[#FF6B4A] underline cursor-pointer"
                        >
                          {metrics.count}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-emerald-700">
                        {formatNaira(metrics.totalPaid)}
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums">
                        {metrics.balanceDue > 0 ? (
                          <span className="font-bold text-rose-700">
                            {formatNaira(metrics.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-medium">₦0.00</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCustomerForHistory(cust)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="View Invoices History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cust)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Customer"
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
        )}
      </div>

      {/* Customer History & Invoices Drawer/Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden text-[#111111]">
            <div className="bg-[#111111] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs text-[#FF6B4A] uppercase tracking-wider font-semibold">
                  Customer Profile & Ledger
                </span>
                <h2 className="text-base font-bold text-white">{selectedCustomerForHistory.name}</h2>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Snapshot metrics */}
              {(() => {
                const metrics = getCustomerMetrics(selectedCustomerForHistory.id);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 bg-[#F8F3EA] p-4 rounded-xl border border-neutral-200 text-xs">
                      <div>
                        <span className="text-neutral-500 text-[11px] block">Total Invoiced</span>
                        <span className="font-bold text-sm tabular-nums text-neutral-900">
                          {formatNaira(metrics.totalBilled)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[11px] block">Total Settled</span>
                        <span className="font-bold text-sm tabular-nums text-emerald-700">
                          {formatNaira(metrics.totalPaid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[11px] block">Outstanding Due</span>
                        <span className={`font-bold text-sm tabular-nums ${metrics.balanceDue > 0 ? 'text-rose-700' : 'text-neutral-900'}`}>
                          {formatNaira(metrics.balanceDue)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="text-xs space-y-1.5 text-neutral-600 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono text-neutral-900 font-semibold">{selectedCustomerForHistory.phone}</span>
                      </div>
                      {selectedCustomerForHistory.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{selectedCustomerForHistory.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{selectedCustomerForHistory.address}, {selectedCustomerForHistory.state}</span>
                      </div>
                    </div>

                    {/* Invoice History List */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                        Invoices for this customer ({metrics.invoices.length})
                      </h3>

                      {metrics.invoices.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-4 text-center">
                          No invoices have been issued to this customer yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                          {metrics.invoices.map((inv) => {
                            const st = getStatusDetails(inv.status);
                            return (
                              <div
                                key={inv.id}
                                className="p-3 hover:bg-neutral-50 flex items-center justify-between gap-4 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-neutral-900">{inv.invoiceNumber}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${st.bgColor} ${st.textColor} ${st.borderColor}`}>
                                      {st.label}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                                    Issued: {formatDate(inv.issueDate)} · Due: {formatDate(inv.dueDate)}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <p className="font-bold tabular-nums text-neutral-900">{formatNaira(inv.totalAmount)}</p>
                                  {inv.balanceDue > 0 && (
                                    <p className="text-[10px] text-rose-600 font-semibold">Bal: {formatNaira(inv.balanceDue)}</p>
                                  )}
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => openWhatsAppShare(inv)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                      title="Share invoice via WhatsApp"
                                    >
                                      <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                      <span>WhatsApp</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedCustomerForHistory(null);
                                        onSelectInvoice(inv);
                                      }}
                                      className="text-[11px] font-semibold text-[#FF6B4A] hover:underline"
                                    >
                                      View &rarr;
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden text-[#111111]">
            <div className="bg-[#111111] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingCustomer ? 'Edit Customer Information' : 'Add New Nigerian Customer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adebayo Ogunlesi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Business / Entity Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lekki Pearls Enterprise"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone (WhatsApp Preferred) *
                  </label>
                  <input
                    type="text"
                    placeholder="+234 803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="customer@domain.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Toyin Street, Ikeja"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                  >
                    <option value="Lagos State">Lagos State</option>
                    <option value="Abuja (FCT)">Abuja (FCT)</option>
                    <option value="Rivers State">Rivers State (Port Harcourt)</option>
                    <option value="Oyo State">Oyo State (Ibadan)</option>
                    <option value="Kano State">Kano State</option>
                    <option value="Enugu State">Enugu State</option>
                    <option value="Delta State">Delta State (Warri / Asaba)</option>
                    <option value="Ogun State">Ogun State (Abeokuta / Ota)</option>
                    <option value="Kaduna State">Kaduna State</option>
                    <option value="Anambra State">Anambra State (Onitsha)</option>
                    <option value="Edo State">Edo State (Benin City)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefers bank transfer to Zenith; always orders bulk Aso-Ebi"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg p-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF6B4A] hover:bg-[#e05838] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
