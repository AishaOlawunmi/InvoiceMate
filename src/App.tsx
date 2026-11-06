import React, { useState, useEffect } from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext';
import { ActiveTab, Invoice } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InvoicesList } from './components/InvoicesList';
import { InvoiceBuilder } from './components/InvoiceBuilder';
import { CustomerManager } from './components/CustomerManager';
import { PaymentTracker } from './components/PaymentTracker';
import { BusinessSettings } from './components/BusinessSettings';
import { LandingPage } from './components/LandingPage';
import { InvoiceViewModal } from './components/InvoiceViewModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { OnboardingModal } from './components/OnboardingModal';

function MainApp() {
  const {
    business,
    isSetupComplete,
    completeOnboarding,
    invoices,
    selectedInvoiceForView,
    setSelectedInvoiceForView,
    isRecordPaymentOpen,
    setIsRecordPaymentOpen,
    paymentTargetInvoice,
    setPaymentTargetInvoice,
    recordPayment,
  } = useInvoice();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [openAddCustomerDirectly, setOpenAddCustomerDirectly] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!isSetupComplete);
  const [initialReceiptMode, setInitialReceiptMode] = useState(false);

  // Check URL query parameters for client deep-linking (?inv=INV-2026-001 or ?mode=receipt)
  useEffect(() => {
    if (typeof window === 'undefined' || invoices.length === 0) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invParam = urlParams.get('inv') || urlParams.get('id');
      const modeParam = urlParams.get('mode');

      if (invParam) {
        const cleanInv = decodeURIComponent(invParam).trim().toLowerCase();
        const found = invoices.find(
          (i) =>
            i.invoiceNumber.toLowerCase() === cleanInv ||
            i.id.toLowerCase() === cleanInv ||
            i.invoiceNumber.toLowerCase().includes(cleanInv)
        );
        if (found) {
          setSelectedInvoiceForView(found);
          if (modeParam === 'receipt') {
            setInitialReceiptMode(true);
          }
        }
      }
    } catch (err) {
      console.warn('Could not parse invoice deep-link parameters', err);
    }
  }, [invoices, setSelectedInvoiceForView]);

  const handleCreateInvoiceClick = () => {
    setEditingInvoice(null);
    setActiveTab('create-invoice');
  };

  const handleEditInvoiceClick = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setActiveTab('create-invoice');
  };

  const handleInvoiceSaved = (invoice: Invoice) => {
    setSelectedInvoiceForView(invoice);
    setActiveTab('invoices');
  };

  const handleRecordPaymentSubmit = (data: {
    invoiceId: string;
    amount: number;
    method: any;
    reference?: string;
    notes?: string;
    date: string;
  }) => {
    recordPayment(data);
  };

  const handleOpenAddCustomer = () => {
    setOpenAddCustomerDirectly(true);
    setActiveTab('customers');
  };

  const handleCompleteSetup = (data: any) => {
    completeOnboarding(data);
    setIsOnboardingOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#111111] flex flex-col font-sans selection:bg-[#FF6B4A]/20">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        business={business}
        onCreateInvoiceClick={handleCreateInvoiceClick}
        onOpenSetup={() => setIsOnboardingOpen(true)}
      />

      {/* Main View Area */}
      {activeTab === 'landing' ? (
        <LandingPage
          onEnterApp={(targetTab) => {
            if (targetTab === 'create-invoice') {
              handleCreateInvoiceClick();
            } else if (targetTab === 'settings') {
              setActiveTab('settings');
            } else {
              setActiveTab('dashboard');
            }
          }}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => {
                if (tab === 'create-invoice') {
                  handleCreateInvoiceClick();
                } else {
                  setActiveTab(tab);
                }
              }}
              onOpenAddCustomer={handleOpenAddCustomer}
              onOpenSetup={() => setIsOnboardingOpen(true)}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesList
              onCreateClick={handleCreateInvoiceClick}
              onEditClick={handleEditInvoiceClick}
            />
          )}

          {activeTab === 'create-invoice' && (
            <InvoiceBuilder
              initialInvoice={editingInvoice}
              onSaved={handleInvoiceSaved}
              onCancel={() => setActiveTab('invoices')}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManager
              onSelectInvoice={(inv) => setSelectedInvoiceForView(inv)}
              isOpenAddCustomerDirectly={openAddCustomerDirectly}
              onCloseAddCustomerDirectly={() => setOpenAddCustomerDirectly(false)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentTracker
              onViewInvoice={(inv) => setSelectedInvoiceForView(inv)}
            />
          )}

          {activeTab === 'settings' && <BusinessSettings />}
        </main>
      )}

      {/* First-Time User Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          currentBusiness={business}
          onComplete={handleCompleteSetup}
          isDismissable={isSetupComplete}
          onDismiss={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* Global Invoice & Receipt View / Print Modal */}
      <InvoiceViewModal
        invoice={selectedInvoiceForView}
        initialReceiptMode={initialReceiptMode}
        onClose={() => {
          setSelectedInvoiceForView(null);
          setInitialReceiptMode(false);
        }}
        onRecordPayment={(inv) => {
          setSelectedInvoiceForView(null);
          setPaymentTargetInvoice(inv);
          setIsRecordPaymentOpen(true);
        }}
        onEditInvoice={(inv) => {
          setSelectedInvoiceForView(null);
          handleEditInvoiceClick(inv);
        }}
      />

      {/* Global Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPaymentTargetInvoice(null);
        }}
        invoices={invoices}
        targetInvoice={paymentTargetInvoice}
        onRecord={handleRecordPaymentSubmit}
      />
    </div>
  );
}

export default function App() {
  return (
    <InvoiceProvider>
      <MainApp />
    </InvoiceProvider>
  );
}
