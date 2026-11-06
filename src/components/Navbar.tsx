import React, { useState } from 'react';
import { ActiveTab, BusinessProfile } from '../types';
import { Plus, Menu, X, Building2, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  business: BusinessProfile;
  onCreateInvoiceClick: () => void;
  onOpenSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  business,
  onCreateInvoiceClick,
  onOpenSetup,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'customers', label: 'Customers' },
    { id: 'payments', label: 'Payments' },
    { id: 'settings', label: 'Settings' },
    { id: 'landing', label: 'Landing Page' },
  ];

  return (
    <header className="bg-[#111111] text-white border-b border-neutral-800 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark & Business Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap flex items-center gap-2 text-left cursor-pointer group"
            >
              <span className="w-7 h-7 rounded-md bg-[#FF6B4A] text-white flex items-center justify-center font-black text-sm">
                ₦
              </span>
              <span>InvoiceMate</span>
            </button>

            {/* User's Verified Business Name */}
            {business.name ? (
              <div className="hidden sm:flex items-center gap-2 pl-3 ml-2 border-l border-neutral-800 text-xs text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-white truncate max-w-[170px]">
                  {business.name}
                </span>
              </div>
            ) : (
              onOpenSetup && (
                <button
                  type="button"
                  onClick={onOpenSetup}
                  className="hidden sm:flex items-center gap-1.5 pl-3 ml-2 border-l border-neutral-800 text-xs text-[#FF6B4A] hover:underline"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Set up business</span>
                </button>
              )
            )}
          </div>

          {/* Zone 2: Navigation Links (Single-line, quiet typography) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                  activeTab === link.id
                    ? 'text-white border-b-2 border-[#FF6B4A]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onCreateInvoiceClick}
              className="bg-[#FF6B4A] hover:bg-[#e05838] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-[#161616] px-4 pt-3 pb-6 space-y-3">
          {business.name && (
            <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Current Business:
                </span>
                <p className="font-bold text-sm text-white">{business.name}</p>
                <p className="text-[11px] text-neutral-400">{business.category}</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setMobileMenuOpen(false);
                }}
                className="text-neutral-400 hover:text-white p-2"
                title="Business Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === link.id
                    ? 'bg-[#FF6B4A] text-white'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
