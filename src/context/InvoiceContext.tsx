import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessProfile, Customer, Invoice, PaymentMethod, PaymentRecord } from '../types';
import {
  DEFAULT_INITIAL_BUSINESS,
  INITIAL_CUSTOMERS,
  INITIAL_SEED_INVOICES,
} from '../data/mockData';
import { generateInvoiceNumber } from '../utils/formatters';

interface InvoiceContextType {
  business: BusinessProfile;
  updateBusiness: (updated: BusinessProfile) => void;
  isSetupComplete: boolean;
  completeOnboarding: (setupData: BusinessProfile) => void;
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber' | 'businessProfile'> & { customInvoiceNumber?: string }) => Invoice;
  updateInvoice: (inv: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordPayment: (payment: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    date?: string;
  }) => void;
  selectedInvoiceForView: Invoice | null;
  setSelectedInvoiceForView: (inv: Invoice | null) => void;
  isRecordPaymentOpen: boolean;
  setIsRecordPaymentOpen: (open: boolean) => void;
  paymentTargetInvoice: Invoice | null;
  setPaymentTargetInvoice: (inv: Invoice | null) => void;
  resetToFreshSetup: () => void;
}

const STORAGE_PREFIX = 'invoicemate_production_sme_v2';

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Business Profile: User's own company
  const [business, setBusiness] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_business`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load business profile', e);
    }
    return DEFAULT_INITIAL_BUSINESS;
  });

  // Customer Directory
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_customers`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load customers', e);
    }
    return INITIAL_CUSTOMERS;
  });

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_invoices`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load invoices', e);
    }
    // Seed initial records linked to current business
    return INITIAL_SEED_INVOICES(DEFAULT_INITIAL_BUSINESS);
  });

  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_business`, JSON.stringify(business));
    } catch (e) {
      console.error('Failed to save business', e);
    }
  }, [business]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_customers`, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_invoices`, JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save invoices', e);
    }
  }, [invoices]);

  // Keep active invoice updated if invoices change
  useEffect(() => {
    if (selectedInvoiceForView) {
      const fresh = invoices.find((i) => i.id === selectedInvoiceForView.id);
      if (fresh) setSelectedInvoiceForView(fresh);
    }
  }, [invoices]);

  const updateBusiness = (updated: BusinessProfile) => {
    setBusiness(updated);
    // Propagate updated business details to all invoices
    setInvoices((prev) =>
      prev.map((inv) => ({
        ...inv,
        businessProfile: updated,
      }))
    );
  };

  const completeOnboarding = (setupData: BusinessProfile) => {
    const finalized: BusinessProfile = {
      ...setupData,
      isSetupComplete: true,
    };
    setBusiness(finalized);
    // Update existing invoices with these details
    setInvoices((prev) =>
      prev.map((inv) => ({
        ...inv,
        businessProfile: finalized,
      }))
    );
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setInvoices((prev) =>
      prev.map((inv) => (inv.customerId === updated.id ? { ...inv, customer: updated } : inv))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addInvoice = (
    invData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber' | 'businessProfile'> & {
      customInvoiceNumber?: string;
    }
  ): Invoice => {
    const invoiceNumber =
      invData.customInvoiceNumber ||
      generateInvoiceNumber(invoices, business.invoicePrefix || 'INV-');

    const newInvoice: Invoice = {
      ...invData,
      id: `inv_${Date.now()}`,
      invoiceNumber,
      businessProfile: business,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updated.id ? updated : inv))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    if (selectedInvoiceForView?.id === id) {
      setSelectedInvoiceForView(null);
    }
  };

  const recordPayment = ({
    invoiceId,
    amount,
    method,
    reference,
    notes,
    date,
  }: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    date?: string;
  }) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;

        const newPayment: PaymentRecord = {
          id: `pay_${Date.now()}`,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customer.name,
          date: date || new Date().toISOString().split('T')[0],
          amount,
          method,
          reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          notes,
        };

        const updatedPaid = (inv.amountPaid || 0) + amount;
        const newBalance = Math.max(0, inv.totalAmount - updatedPaid);

        let newStatus: Invoice['status'] = inv.status;
        if (newBalance <= 0.01) {
          newStatus = 'paid';
        } else if (updatedPaid > 0) {
          newStatus = 'partially_paid';
        }

        return {
          ...inv,
          amountPaid: updatedPaid,
          balanceDue: newBalance,
          status: newStatus,
          paymentRecords: [newPayment, ...(inv.paymentRecords || [])],
        };
      })
    );
  };

  const resetToFreshSetup = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}_business`);
    localStorage.removeItem(`${STORAGE_PREFIX}_customers`);
    localStorage.removeItem(`${STORAGE_PREFIX}_invoices`);
    setBusiness(DEFAULT_INITIAL_BUSINESS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_SEED_INVOICES(DEFAULT_INITIAL_BUSINESS));
  };

  return (
    <InvoiceContext.Provider
      value={{
        business,
        updateBusiness,
        isSetupComplete: business.isSetupComplete,
        completeOnboarding,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPayment,
        selectedInvoiceForView,
        setSelectedInvoiceForView,
        isRecordPaymentOpen,
        setIsRecordPaymentOpen,
        paymentTargetInvoice,
        setPaymentTargetInvoice,
        resetToFreshSetup,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};
