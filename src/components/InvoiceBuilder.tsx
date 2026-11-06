import React, { useState } from 'react';
import { Customer, InvoiceItem, Invoice } from '../types';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceDocument } from './InvoiceDocument';
import { formatNaira, generateInvoiceNumber, openWhatsAppShare } from '../utils/formatters';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Share2,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface InvoiceBuilderProps {
  initialInvoice?: Invoice | null;
  onSaved: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({
  initialInvoice,
  onSaved,
  onCancel,
}) => {
  const { business, customers, invoices, addInvoice, updateInvoice, addCustomer } = useInvoice();

  // Mode: Form vs Live Preview toggle on mobile
  const [activeMobileView, setActiveMobileView] = useState<'edit' | 'preview'>('edit');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Customer info fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialInvoice?.customerId || (customers.length > 0 ? customers[0].id : '')
  );
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustBusiness, setNewCustBusiness] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+234 ');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustState, setNewCustState] = useState(business.state || 'Lagos State');

  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialInvoice?.invoiceNumber || generateInvoiceNumber(invoices, business.invoicePrefix || 'INV-')
  );
  const [issueDate, setIssueDate] = useState(
    initialInvoice?.issueDate || new Date().toISOString().split('T')[0]
  );

  // Default due date to 7 days ahead
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };
  const [dueDate, setDueDate] = useState(initialInvoice?.dueDate || defaultDueDate());

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>(
    initialInvoice?.items || [
      {
        id: 'item_1',
        description: 'Professional Service / Product Delivery',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000,
      },
    ]
  );

  // Financial adjusters
  const [discountPercent, setDiscountPercent] = useState<number>(initialInvoice?.discountPercent ?? 0);
  const [applyVat, setApplyVat] = useState<boolean>(initialInvoice ? initialInvoice.taxPercent > 0 : true);
  const [taxPercent, setTaxPercent] = useState<number>(initialInvoice?.taxPercent ?? 7.5);
  const [notes, setNotes] = useState(
    initialInvoice?.notes || business.defaultNotes || 'Thank you for your business. Payment is due as stated.'
  );

  // Computed financial figures
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const effectiveTaxPercent = applyVat ? taxPercent : 0;
  const taxAmount = (taxableBase * effectiveTaxPercent) / 100;
  const totalAmount = taxableBase + taxAmount;

  // Active customer resolution
  const resolvedCustomer: Customer = isCreatingNewCustomer
    ? {
        id: 'temp_cust',
        name: newCustName || 'Customer Name',
        businessName: newCustBusiness,
        phone: newCustPhone || '+234 800 000 0000',
        email: newCustEmail || 'customer@email.com',
        address: newCustAddress || 'Nigeria',
        state: newCustState,
        createdAt: new Date().toISOString(),
      }
    : customers.find((c) => c.id === selectedCustomerId) || {
        id: 'cust_default',
        name: 'Selected Customer',
        phone: '+234 800 000 0000',
        email: 'customer@domain.ng',
        address: 'Lagos, Nigeria',
        createdAt: new Date().toISOString(),
      };

  // Live preview invoice
  const previewInvoice: Invoice = {
    id: initialInvoice?.id || 'inv_temp_preview',
    invoiceNumber,
    businessProfile: business,
    customerId: resolvedCustomer.id,
    customer: resolvedCustomer,
    issueDate,
    dueDate,
    items,
    discountPercent,
    taxPercent: effectiveTaxPercent,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    amountPaid: initialInvoice?.amountPaid || 0,
    balanceDue: totalAmount - (initialInvoice?.amountPaid || 0),
    status: initialInvoice?.status || 'pending',
    paymentRecords: initialInvoice?.paymentRecords || [],
    notes,
    paymentInstructions: `Bank: ${business.bankDetails?.bankName} · ${business.bankDetails?.accountNumber} · ${business.bankDetails?.accountName}`,
    createdAt: initialInvoice?.createdAt || new Date().toISOString(),
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (
    id: string,
    field: 'description' | 'quantity' | 'unitPrice',
    val: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(val) : item.quantity;
          const price = field === 'unitPrice' ? Number(val) : item.unitPrice;
          updated.amount = (qty || 0) * (price || 0);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAddPreset = (desc: string, price: number) => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      description: desc,
      quantity: 1,
      unitPrice: price,
      amount: price,
    };
    setItems([...items, newItem]);
  };

  const handleSaveInvoice = () => {
    let finalCustomer = resolvedCustomer;

    if (isCreatingNewCustomer) {
      if (!newCustName.trim()) {
        alert('Please enter a customer name');
        return;
      }
      finalCustomer = addCustomer({
        name: newCustName.trim(),
        businessName: newCustBusiness.trim() || undefined,
        phone: newCustPhone.trim() || '+234 800 000 0000',
        email: newCustEmail.trim() || undefined,
        address: newCustAddress.trim() || 'Nigeria',
        state: newCustState,
      });
    }

    const payload = {
      customInvoiceNumber: invoiceNumber,
      customerId: finalCustomer.id,
      customer: finalCustomer,
      issueDate,
      dueDate,
      items,
      discountPercent,
      taxPercent: effectiveTaxPercent,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      amountPaid: initialInvoice?.amountPaid || 0,
      balanceDue: totalAmount - (initialInvoice?.amountPaid || 0),
      status: initialInvoice?.status || 'pending',
      paymentRecords: initialInvoice?.paymentRecords || [],
      notes,
      paymentInstructions: `Bank: ${business.bankDetails?.bankName} · ${business.bankDetails?.accountNumber} · ${business.bankDetails?.accountName}`,
    };

    let savedResult: Invoice;
    if (initialInvoice) {
      savedResult = {
        ...payload,
        id: initialInvoice.id,
        invoiceNumber: initialInvoice.invoiceNumber,
        businessProfile: business,
        createdAt: initialInvoice.createdAt,
      };
      updateInvoice(savedResult);
    } else {
      savedResult = addInvoice(payload);
    }

    setSaveSuccessNotice(true);
    setTimeout(() => {
      onSaved(savedResult);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner and Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="text-xs text-neutral-500 mb-0.5">
            {initialInvoice ? 'Edit Existing Record' : 'Invoice Generator'}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            {initialInvoice ? `Edit Invoice ${initialInvoice.invoiceNumber}` : 'Create New Invoice'}
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Invoicing as <strong className="text-neutral-900">{business.name || 'Your Business'}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mobile view toggle */}
          <div className="lg:hidden flex items-center bg-[#F8F3EA] p-1 rounded-lg border border-neutral-300 text-xs">
            <button
              type="button"
              onClick={() => setActiveMobileView('edit')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMobileView === 'edit' ? 'bg-[#111111] text-white shadow-xs' : 'text-neutral-600'
              }`}
            >
              Edit Form
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileView('preview')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMobileView === 'preview' ? 'bg-[#111111] text-white shadow-xs' : 'text-neutral-600'
              }`}
            >
              Live Preview
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => openWhatsAppShare(previewInvoice)}
            className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Preview and share directly to client's WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Preview</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-[#F8F3EA] hover:bg-[#EDE6D8] text-[#111111] border border-neutral-300 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSaveInvoice}
            disabled={saveSuccessNotice}
            className="bg-[#FF6B4A] hover:bg-[#e05838] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {saveSuccessNotice ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Invoice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Form + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Builder (6 cols on desktop) */}
        <div className={`lg:col-span-6 space-y-6 ${activeMobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Section 1: Customer Selection or Add New */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                1. Customer Details (Bill To)
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingNewCustomer(!isCreatingNewCustomer)}
                className="text-xs font-semibold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                {isCreatingNewCustomer ? 'Select Existing Customer' : '+ Add New Customer'}
              </button>
            </div>

            {!isCreatingNewCustomer ? (
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Select Registered Customer
                </label>
                {customers.length === 0 ? (
                  <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600">
                    No customers added yet.{' '}
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCustomer(true)}
                      className="text-[#FF6B4A] font-bold underline"
                    >
                      Click here to add one
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.businessName ? `(${c.businessName})` : ''} — {c.phone}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-neutral-500 mt-1">
                  Customer contact and address details automatically populate on the invoice.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Babatunde Johnson"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Company / Business Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Johnson & Co. Ltd"
                      value={newCustBusiness}
                      onChange={(e) => setNewCustBusiness(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +234 803 123 4567"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. client@gmail.com"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Awolowo Road, Ikoyi"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={newCustState}
                      onChange={(e) => setNewCustState(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Invoice Dates & Number */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pb-2 border-b border-neutral-100">
              2. Invoice Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#FF6B4A]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Line Items */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                3. Products / Services ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Nigerian preset helpers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Quick add:</span>
              <button
                type="button"
                onClick={() => handleAddPreset('Bespoke Garment & Tailoring', 35000)}
                className="text-[10px] bg-[#F8F3EA] hover:bg-[#EDE6D8] text-neutral-700 px-2 py-1 rounded border border-neutral-300 transition-colors cursor-pointer"
              >
                + Tailoring (₦35,000)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Maintenance & Servicing Labor', 25000)}
                className="text-[10px] bg-[#F8F3EA] hover:bg-[#EDE6D8] text-neutral-700 px-2 py-1 rounded border border-neutral-300 transition-colors cursor-pointer"
              >
                + Service (₦25,000)
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Consulting / Professional Retainer', 100000)}
                className="text-[10px] bg-[#F8F3EA] hover:bg-[#EDE6D8] text-neutral-700 px-2 py-1 rounded border border-neutral-300 transition-colors cursor-pointer"
              >
                + Retainer (₦100,000)
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#F8F3EA]/40 rounded-lg border border-neutral-200 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-neutral-400 font-mono">
                      #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Product or service description..."
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:border-[#FF6B4A]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full text-xs tabular-nums bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:border-[#FF6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                        Unit Price (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full text-xs font-semibold tabular-nums bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:border-[#FF6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                        Subtotal (₦)
                      </label>
                      <div className="w-full text-xs font-bold tabular-nums bg-neutral-100 border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-900 truncate">
                        {formatNaira(item.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border border-dashed border-neutral-300 hover:border-neutral-500 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Item</span>
            </button>
          </div>

          {/* Section 4: VAT, Discount & Notes */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pb-2 border-b border-neutral-100">
              4. Tax, Discount & Terms
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#F8F3EA]/60 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-800">
                    Apply Nigerian VAT (7.5%)
                  </label>
                  <input
                    type="checkbox"
                    checked={applyVat}
                    onChange={(e) => setApplyVat(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6B4A] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Adds standard FIRS 7.5% Value Added Tax.
                </p>
              </div>

              <div className="p-3 bg-[#F8F3EA]/60 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Discount Percentage
                  </label>
                  <span className="text-xs font-bold font-mono">{discountPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FF6B4A] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Payment Terms / Customer Note
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg p-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Document Preview (6 cols on desktop) */}
        <div className={`lg:col-span-6 sticky top-20 ${activeMobileView === 'edit' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-neutral-800 text-neutral-300 px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-white">
              <Eye className="w-3.5 h-3.5 text-[#FF6B4A]" />
              Live Invoice Preview
            </span>
            <span className="text-[11px] text-neutral-400">Updates live as you type</span>
          </div>

          <div className="bg-neutral-900/10 p-2 sm:p-4 rounded-b-xl border border-neutral-300/80 shadow-md overflow-hidden">
            <InvoiceDocument invoice={previewInvoice} isReceiptMode={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
