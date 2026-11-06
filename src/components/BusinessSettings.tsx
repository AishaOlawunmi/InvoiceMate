import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { useInvoice } from '../context/InvoiceContext';
import { BUSINESS_CATEGORIES, NIGERIAN_BANKS, NIGERIAN_STATES } from '../data/mockData';
import {
  Building2,
  CreditCard,
  FileText,
  Check,
  Upload,
  X,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export const BusinessSettings: React.FC = () => {
  const { business, updateBusiness, resetToFreshSetup } = useInvoice();

  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [name, setName] = useState(business.name || '');
  const [category, setCategory] = useState(business.category || BUSINESS_CATEGORIES[0]);
  const [tagline, setTagline] = useState(business.tagline || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  const [address, setAddress] = useState(business.address || '');
  const [state, setState] = useState(business.state || 'Lagos State');
  const [rcNumber, setRcNumber] = useState(business.rcNumber || '');
  const [taxId, setTaxId] = useState(business.taxId || '');
  const [logoUrl, setLogoUrl] = useState(business.logoUrl || '');

  // Bank fields
  const [bankName, setBankName] = useState(business.bankDetails?.bankName || 'Zenith Bank');
  const [accountNumber, setAccountNumber] = useState(business.bankDetails?.accountNumber || '');
  const [accountName, setAccountName] = useState(business.bankDetails?.accountName || '');

  // Defaults
  const [invoicePrefix, setInvoicePrefix] = useState(business.invoicePrefix || 'INV-');
  const [defaultTaxRate, setDefaultTaxRate] = useState(business.defaultTaxRate || 7.5);
  const [defaultNotes, setDefaultNotes] = useState(business.defaultNotes || '');
  const [defaultTerms, setDefaultTerms] = useState(business.defaultTerms || '');

  // Sync state if business changes
  useEffect(() => {
    setName(business.name || '');
    setCategory(business.category || BUSINESS_CATEGORIES[0]);
    setTagline(business.tagline || '');
    setPhone(business.phone || '');
    setEmail(business.email || '');
    setAddress(business.address || '');
    setState(business.state || 'Lagos State');
    setRcNumber(business.rcNumber || '');
    setTaxId(business.taxId || '');
    setLogoUrl(business.logoUrl || '');
    setBankName(business.bankDetails?.bankName || 'Zenith Bank');
    setAccountNumber(business.bankDetails?.accountNumber || '');
    setAccountName(business.bankDetails?.accountName || '');
    setInvoicePrefix(business.invoicePrefix || 'INV-');
    setDefaultTaxRate(business.defaultTaxRate || 7.5);
    setDefaultNotes(business.defaultNotes || '');
    setDefaultTerms(business.defaultTerms || '');
  }, [business]);

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload a logo image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Business name is required');
      return;
    }

    const updated: BusinessProfile = {
      ...business,
      name: name.trim(),
      category,
      tagline: tagline.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      state,
      rcNumber: rcNumber.trim() || undefined,
      taxId: taxId.trim() || undefined,
      logoUrl: logoUrl || undefined,
      bankDetails: {
        bankName,
        accountNumber: accountNumber.replace(/[^0-9]/g, ''),
        accountName: accountName.trim().toUpperCase(),
      },
      invoicePrefix: invoicePrefix.trim().toUpperCase() || 'INV-',
      defaultTaxRate: Number(defaultTaxRate),
      defaultNotes: defaultNotes.trim(),
      defaultTerms: defaultTerms.trim(),
      isSetupComplete: true,
    };

    updateBusiness(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset your business settings? This will clear your custom business configuration.'
      )
    ) {
      resetToFreshSetup();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto selection:bg-[#FF6B4A]/20">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500 mb-0.5">Profile & Configuration</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Business Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage your company information, receiving bank account, CAC credentials, and invoice defaults.
          </p>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Information */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Building2 className="w-4 h-4 text-[#FF6B4A]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              1. Business Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Official Business Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adunni Fashion Hub"
                className="w-full text-xs font-medium bg-[#F8F3EA]/50 border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Business Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Business Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Contemporary African Couture & Bespoke Tailoring"
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Business Phone (WhatsApp) *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Business Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@yourbusiness.ng"
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 Allen Avenue, Ikeja"
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                State *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              >
                {NIGERIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo management */}
            <div className="sm:col-span-2 p-3.5 bg-[#F8F3EA]/40 rounded-lg border border-neutral-200">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Official Business Logo
              </label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative">
                    <img
                      src={logoUrl}
                      alt={name}
                      className="h-12 w-12 object-contain rounded border border-neutral-200 bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 text-[10px] cursor-pointer"
                      title="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold text-lg">
                    {name ? name.charAt(0).toUpperCase() : 'B'}
                  </div>
                )}

                <div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:text-[#FF6B4A] transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>{logoUrl ? 'Replace Logo' : 'Upload Business Logo (PNG, JPG)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Appears on the top header of all invoices and receipts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Payout Bank Account Details */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF6B4A]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                2. Receiving Nigerian Bank Account
              </h2>
            </div>
            <span className="text-[11px] text-neutral-400">Printed on every invoice</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Bank Name *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                10-Digit NUBAN Account Number *
              </label>
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1012345678"
                className="w-full text-sm font-mono font-bold tracking-wider bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Account Beneficiary Name *
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. YOUR BUSINESS LTD"
                className="w-full text-xs font-medium uppercase bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Optional Business Registration */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              3. Business Registration (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                CAC Registration Number (RC / BN)
              </label>
              <input
                type="text"
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                placeholder="e.g. RC-1849204 or BN-3498112"
                className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Corporate Affairs Commission registration.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g. TIN-23091844-0001"
                className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                FIRS or State Board of Internal Revenue TIN.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Invoice Defaults */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <FileText className="w-4 h-4 text-[#FF6B4A]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              4. Invoice Settings & Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV-"
                className="w-full text-xs font-mono uppercase bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
              <p className="text-[11px] text-neutral-400 mt-1">e.g. &ldquo;INV-&rdquo;</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Default VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-semibold tabular-nums bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
              <p className="text-[11px] text-neutral-400 mt-1">Nigeria standard is 7.5%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Default Payment Terms
              </label>
              <input
                type="text"
                value={defaultTerms}
                onChange={(e) => setDefaultTerms(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Default Thank You Message
              </label>
              <input
                type="text"
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Settings</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#FF6B4A] hover:bg-[#e05838] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
