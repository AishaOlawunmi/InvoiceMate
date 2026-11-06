export type PaymentMethod = 'bank_transfer' | 'cash' | 'pos' | 'ussd' | 'mobile_banking';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'partially_paid';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  tagline?: string;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  rcNumber?: string;
  taxId?: string;
  bankDetails: BankDetails;
  invoicePrefix: string;
  defaultTerms: string;
  defaultNotes: string;
  defaultTaxRate: number;
  currency: string;
  isSetupComplete: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  email?: string;
  address: string;
  state?: string;
  createdAt: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  businessProfile: BusinessProfile;
  customerId: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discountPercent: number;
  taxPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentRecords: PaymentRecord[];
  notes: string;
  paymentInstructions?: string;
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'invoices' | 'create-invoice' | 'customers' | 'payments' | 'settings' | 'landing';
