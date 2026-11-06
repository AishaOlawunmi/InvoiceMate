import React from 'react';
import {
  FileText,
  Share2,
  CreditCard,
  Building2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  Receipt,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (tab?: 'dashboard' | 'create-invoice' | 'settings') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="bg-[#F8F3EA] text-[#111111] min-h-screen selection:bg-[#FF6B4A]/20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 px-3 py-1.5 rounded-md shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A]"></span>
                <span>The #1 Invoice & Payment Tracking Software for Nigerian SMEs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1] [text-wrap:balance]">
                Create invoices. Track payments. Grow your business.
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
                The smart invoice generator and receipt software built for Nigerian vendors, freelancers, and small businesses. Stop losing money to forgotten debts, manual notebook calculations, and lost WhatsApp transfer screenshots.
              </p>

              {/* Direct Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onEnterApp('create-invoice')}
                  className="px-6 py-3.5 bg-[#FF6B4A] hover:bg-[#e05838] text-white text-sm font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Your First Invoice</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onEnterApp('dashboard')}
                  className="px-6 py-3.5 bg-[#111111] hover:bg-[#222222] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-[#FF6B4A]" />
                  <span>Open Business Dashboard</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex items-center gap-6 text-xs text-neutral-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant WhatsApp Sharing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Nigerian Naira (₦) & 7.5% VAT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>All Nigerian Commercial Banks</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-200">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#FF6B4A]">INV-2026-001</span>
                    <h2 className="text-base font-extrabold text-[#111111]">Ade & Sons Enterprise</h2>
                    <p className="text-[11px] text-neutral-500">Ikeja, Lagos State · RC-192840</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PAID IN FULL
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs border-b border-neutral-100">
                  <div className="flex justify-between text-neutral-600">
                    <span>Billed To:</span>
                    <span className="font-semibold text-neutral-900">Chief Babatunde Alabi</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Service:</span>
                    <span className="font-medium text-neutral-800">Commercial Branding & Signage</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT (7.5%):</span>
                    <span className="font-mono text-neutral-800">₦26,250.00</span>
                  </div>
                </div>

                <div className="py-4 flex justify-between items-center text-sm">
                  <span className="font-bold text-neutral-600">Total Settled:</span>
                  <span className="text-xl font-extrabold text-[#111111] tabular-nums">
                    ₦376,250.00
                  </span>
                </div>

                <div className="bg-[#F8F3EA] p-3 rounded-lg border border-[#EDE6D8] text-[11px] space-y-1">
                  <p className="font-bold text-[#111111] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    Zenith Bank · 1014892041
                  </p>
                  <p className="text-neutral-500">ADE & SONS ENTERPRISES LTD</p>
                </div>

                <div className="mt-4 pt-3 flex gap-2">
                  <button
                    onClick={() => onEnterApp('create-invoice')}
                    className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: The Real Problem Nigerian SMEs Face */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A] block mb-2">
              The Problem with Invoicing in Nigeria Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Why manual invoices and WhatsApp chats cost you real money
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Nigerian small business owners, artisans, and vendors lose hundreds of thousands of Naira every year because paper notebooks, phone memos, and WhatsApp transfers are impossible to track.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-[#F8F3EA]/70 border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Lost Transfer Screenshots</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Customers send bank transfer receipts in media-heavy WhatsApp chats. Three weeks later, screenshots are buried and you can&rsquo;t verify who paid.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F3EA]/70 border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Customers Forgetting Payments</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Clients promise to &ldquo;send the balance tomorrow&rdquo; but never do. Without a structured debtor reminder, you feel awkward asking for your own hard-earned money.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F3EA]/70 border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Manual Paper Receipts</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Handwritten paper receipt booklets tear, get lost, and look unprofessional to corporate clients who demand formal tax records and CAC details.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F3EA]/70 border border-neutral-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">WhatsApp Payment Confusion</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Typing bank account numbers manually into WhatsApp leads to errors, delays in bank confirmation, and endless back-and-forth messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="py-16 md:py-24 bg-[#F8F3EA] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A] block mb-2">
              Designed For Nigerian Commerce
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              How InvoiceMate works in 3 simple steps
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2">
              No accounting degree needed. Build and send professional Nigerian invoices from your smartphone or laptop in 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <span className="font-mono text-2xl font-extrabold text-[#FF6B4A]">01.</span>
              <h3 className="text-lg font-bold text-[#111111]">Enter Customer & Line Items</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Add products or services in Nigerian Naira (₦). InvoiceMate automatically calculates 7.5% Nigerian VAT, customer discounts, and the grand total.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <span className="font-mono text-2xl font-extrabold text-[#FF6B4A]">02.</span>
              <h3 className="text-lg font-bold text-[#111111]">Share via WhatsApp or PDF</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Send a pre-formatted WhatsApp message directly to your client containing your bank details, or download a high-resolution printable A4 PDF.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <span className="font-mono text-2xl font-extrabold text-[#FF6B4A]">03.</span>
              <h3 className="text-lg font-bold text-[#111111]">Record Alert & Issue Receipt</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Once the bank alert hits your phone, mark it as paid or partially paid. InvoiceMate automatically converts the invoice into an official Payment Receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Key Features Built for Nigerian SMEs */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A] block mb-2">
              SME Accounting Tools Nigeria
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Everything you need to run your business finances cleanly
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-neutral-200 bg-[#F8F3EA]/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                  ₦
                </span>
                <h3 className="text-sm font-bold text-neutral-900">Nigerian Naira Native</h3>
              </div>
              <p className="text-xs text-neutral-600">
                All currency calculations in ₦ with tabular figures and optional standard FIRS 7.5% VAT calculation.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 bg-[#F8F3EA]/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">1-Click WhatsApp Delivery</h3>
              </div>
              <p className="text-xs text-neutral-600">
                Generate clean, friendly WhatsApp messages with your bank account and full breakdown ready to send in one tap.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 bg-[#F8F3EA]/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#FF6B4A]" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Nigerian Bank Account Integration</h3>
              </div>
              <p className="text-xs text-neutral-600">
                Seamless support for Zenith, GTBank, Access, Kuda, Moniepoint, OPay, and all 25+ licensed banks with 1-click copy account number.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 bg-[#F8F3EA]/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Official Payment Receipts</h3>
              </div>
              <p className="text-xs text-neutral-600">
                Instantly convert any settled or partially settled invoice into a verifiable payment receipt with transaction session IDs.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 bg-[#F8F3EA]/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#FF6B4A]" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Outstanding Debt Tracking</h3>
              </div>
              <p className="text-xs text-neutral-600">
                See exactly who owes you money with an automated debt reminder list and direct polite WhatsApp prompt.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 bg-[#F8F3EA]/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">CAC & Tax ID Compliance</h3>
              </div>
              <p className="text-xs text-neutral-600">
                Include your Corporate Affairs Commission registration number and TIN on every invoice to win corporate contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Realistic Nigerian SME Testimonials */}
      <section className="py-16 md:py-24 bg-[#F8F3EA] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A] block mb-2">
              Real Nigerian Small Businesses
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Trusted by creators, vendors, and service providers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                &ldquo;Before InvoiceMate, our fashion boutique lost over ₦400,000 in uncollected balances because customers paid 50% on WhatsApp and forgot the rest. Now, the instant WhatsApp reminders and official receipts have completely solved it.&rdquo;
              </p>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                  TA
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">Temitope Adeleke</h3>
                  <p className="text-[11px] text-neutral-500">Couture Designer · Ikeja, Lagos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                &ldquo;Corporate clients in Abuja always asked for our CAC registration and a formal PDF before processing payments. With InvoiceMate, I generate our invoice on my phone right in the workshop and send it before the customer leaves.&rdquo;
              </p>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                  KU
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">Engr. Kabir Usman</h3>
                  <p className="text-[11px] text-neutral-500">Automotive Specialist · Wuse II, Abuja</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                &ldquo;As a freelancer in Yaba managing multiple software projects, tracking milestone payments used to be messy. InvoiceMate makes me look like an established tech agency, and clients respect payment deadlines now.&rdquo;
              </p>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                  AO
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">Aisha Olawunmi</h3>
                  <p className="text-[11px] text-neutral-500">Brand & Web Consultant · Sabo, Yaba</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Call to Action */}
      <section className="py-20 bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
            Invoice Software for Small Businesses
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight [text-wrap:balance]">
            Take your business finances from notebook to professional SaaS
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Join thousands of Nigerian entrepreneurs who send clean invoices, track payments, and get paid faster.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp('create-invoice')}
              className="px-8 py-4 bg-[#FF6B4A] hover:bg-[#e05838] text-white text-sm font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <FileText className="w-4 h-4" />
              <span>Create Your First Invoice Free</span>
            </button>

            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-8 py-4 bg-[#222222] hover:bg-[#333333] text-neutral-200 text-sm font-bold rounded-lg transition-colors border border-neutral-700 cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer with Natural SEO Grounding */}
      <footer className="py-10 bg-[#0a0a0a] text-neutral-500 text-xs border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="w-6 h-6 rounded bg-[#FF6B4A] flex items-center justify-center text-xs">
                ₦
              </span>
              <span>InvoiceMate Nigeria</span>
            </div>

            <p>© 2026 InvoiceMate. The modern invoice and receipt platform for Nigerian businesses.</p>

            <div className="flex items-center gap-4 text-[11px]">
              <button onClick={() => onEnterApp('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                Dashboard
              </button>
              <button onClick={() => onEnterApp('settings')} className="hover:text-white transition-colors cursor-pointer">
                Business Profile
              </button>
              <span>Lagos · Abuja · Port Harcourt · Ibadan</span>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-4 text-[11px] text-neutral-600 text-center sm:text-left">
            <span>
              Invoice generator Nigeria · Receipt generator Nigeria · SME accounting tools Nigeria · Payment tracking software for small businesses
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
