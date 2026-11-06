import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { BUSINESS_CATEGORIES, NIGERIAN_BANKS, NIGERIAN_STATES } from '../data/mockData';
import {
  Building2,
  CreditCard,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  currentBusiness: BusinessProfile;
  onComplete: (data: BusinessProfile) => void;
  isDismissable?: boolean;
  onDismiss?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentBusiness,
  onComplete,
  isDismissable = false,
  onDismiss,
}) => {
  // Business Information
  const [name, setName] = useState(currentBusiness.name || '');
  const [category, setCategory] = useState(currentBusiness.category || BUSINESS_CATEGORIES[0]);
  const [phone, setPhone] = useState(currentBusiness.phone || '');
  const [email, setEmail] = useState(currentBusiness.email || '');
  const [address, setAddress] = useState(currentBusiness.address || '');
  const [state, setState] = useState(currentBusiness.state || 'Lagos State');
  const [logoUrl, setLogoUrl] = useState(currentBusiness.logoUrl || '');

  // Payment Details
  const [bankName, setBankName] = useState(currentBusiness.bankDetails?.bankName || 'Zenith Bank');
  const [accountName, setAccountName] = useState(currentBusiness.bankDetails?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(currentBusiness.bankDetails?.accountNumber || '');

  // Optional Business Registration
  const [rcNumber, setRcNumber] = useState(currentBusiness.rcNumber || '');
  const [taxId, setTaxId] = useState(currentBusiness.taxId || '');

  // Invoice Settings
  const [invoicePrefix, setInvoicePrefix] = useState(currentBusiness.invoicePrefix || 'INV-');
  const [defaultTerms, setDefaultTerms] = useState(
    currentBusiness.defaultTerms || 'Payment is due within 7 days. Bank transfer is preferred.'
  );
  const [defaultNotes, setDefaultNotes] = useState(
    currentBusiness.defaultNotes || 'Thank you for your business. We look forward to serving you again!'
  );

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [validationError, setValidationError] = useState('');

  // Handle logo image upload
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

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter your business name.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Please enter your business phone number.');
      return;
    }
    setValidationError('');
    setActiveStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setValidationError('Please enter your 10-digit NUBAN account number.');
      return;
    }
    if (accountNumber.replace(/[^0-9]/g, '').length !== 10) {
      setValidationError('Nigerian NUBAN account numbers must be exactly 10 digits.');
      return;
    }
    if (!accountName.trim()) {
      setValidationError('Please enter your bank account name.');
      return;
    }
    setValidationError('');
    setActiveStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Business name is required.');
      setActiveStep(1);
      return;
    }

    const profile: BusinessProfile = {
      ...currentBusiness,
      name: name.trim(),
      category,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      state,
      logoUrl: logoUrl || undefined,
      bankDetails: {
        bankName,
        accountName: accountName.trim().toUpperCase(),
        accountNumber: accountNumber.replace(/[^0-9]/g, ''),
      },
      rcNumber: rcNumber.trim() || undefined,
      taxId: taxId.trim() || undefined,
      invoicePrefix: invoicePrefix.trim().toUpperCase() || 'INV-',
      defaultTerms: defaultTerms.trim(),
      defaultNotes: defaultNotes.trim(),
      isSetupComplete: true,
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto selection:bg-[#FF6B4A]/20">
      <div className="bg-[#F8F3EA] rounded-2xl w-full max-w-2xl border border-neutral-300 shadow-2xl overflow-hidden my-auto text-[#111111]">
        {/* Onboarding Header */}
        <div className="bg-[#111111] text-white p-6 sm:p-8 relative">
          {isDismissable && onDismiss && (
            <button
              onClick={onDismiss}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#222222] border border-neutral-800 text-[11px] font-semibold text-[#FF6B4A] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to InvoiceMate Nigeria</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Set up your business
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-lg leading-relaxed">
            Add your business details once and they will automatically appear on all your invoices, WhatsApp shares, and payment receipts.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold text-center transition-colors ${
                activeStep === 1
                  ? 'bg-[#FF6B4A] text-white font-bold'
                  : 'bg-[#222222] text-neutral-400'
              }`}
            >
              1. Business Info
            </button>
            <button
              type="button"
              onClick={() => name && phone && setActiveStep(2)}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold text-center transition-colors ${
                activeStep === 2
                  ? 'bg-[#FF6B4A] text-white font-bold'
                  : 'bg-[#222222] text-neutral-400'
              }`}
            >
              2. Bank Account
            </button>
            <button
              type="button"
              onClick={() => name && accountNumber && setActiveStep(3)}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold text-center transition-colors ${
                activeStep === 3
                  ? 'bg-[#FF6B4A] text-white font-bold'
                  : 'bg-[#222222] text-neutral-400'
              }`}
            >
              3. Registration & Defaults
            </button>
          </div>
        </div>

        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-700 font-medium">
            {validationError}
          </div>
        )}

        {/* Step 1: Business Information */}
        {activeStep === 1 && (
          <form onSubmit={handleStep1Next} className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
              <Building2 className="w-4 h-4 text-[#FF6B4A]" />
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                Step 1: Business Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adebayo Design Studio, Lekki Pearl Boutique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
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

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Business Phone (WhatsApp) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. +234 803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. billing@yourbusiness.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  State / Location *
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Physical Business Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Allen Avenue, Ikeja"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
              </div>

              {/* Logo upload */}
              <div className="sm:col-span-2 p-3 bg-white rounded-lg border border-neutral-200">
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Business Logo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative">
                      <img
                        src={logoUrl}
                        alt="Business Logo Preview"
                        className="h-12 w-12 object-contain rounded border border-neutral-200 bg-neutral-50 p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[10px]"
                        title="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:text-[#FF6B4A] transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#FF6B4A]" />
                      <span>{logoUrl ? 'Replace Logo' : 'Upload Logo Image (PNG, JPG)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Recommended: square or transparent PNG, max 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Bank Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF6B4A]" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Details */}
        {activeStep === 2 && (
          <form onSubmit={handleStep2Next} className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
              <CreditCard className="w-4 h-4 text-[#FF6B4A]" />
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                Step 2: Payout Bank Account Details
              </h2>
            </div>

            <p className="text-xs text-neutral-600">
              This bank account is printed on all your invoices so customers can pay directly via bank transfer, USSD, or mobile app.
            </p>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Nigerian Bank Name *
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
                  placeholder="e.g. 1012345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-sm font-mono font-bold tracking-wider bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                  required
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Only 10-digit standard Nigerian account numbers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Account Beneficiary Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ADUNNI FASHION VENTURES or YOUR FULL NAME"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full text-xs uppercase font-medium bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                  required
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Exact name as registered with your bank.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Registration</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF6B4A]" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Optional Registration & Invoice Defaults */}
        {activeStep === 3 && (
          <form onSubmit={handleFinalSubmit} className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
              <FileText className="w-4 h-4 text-[#FF6B4A]" />
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                Step 3: Registration (Optional) & Invoice Defaults
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  CAC Registration Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. RC-1849204 or BN-3498112"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Corporate Affairs Commission registration.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Tax Identification Number (TIN - Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TIN-23091844-0001"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  FIRS or State Board of Internal Revenue TIN.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  placeholder="INV-"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  e.g. &ldquo;INV-&rdquo; generates INV-2026-001.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Default Payment Terms
                </label>
                <select
                  value={defaultTerms}
                  onChange={(e) => setDefaultTerms(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                >
                  <option value="Payment is due on receipt of invoice.">Due on Receipt</option>
                  <option value="Payment is due within 7 days. Bank transfer is preferred.">Due within 7 Days</option>
                  <option value="Payment is due within 14 days of delivery.">Due within 14 Days</option>
                  <option value="50% deposit required before order processing. Balance upon completion.">50% Advance Deposit</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Default Thank-You Note
                </label>
                <input
                  type="text"
                  value={defaultNotes}
                  onChange={(e) => setDefaultNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#FF6B4A]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                &larr; Back
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-[#FF6B4A] hover:bg-[#e05838] text-white text-xs font-extrabold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Setup</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
