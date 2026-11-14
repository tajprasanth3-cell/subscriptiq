import crypto from 'node:crypto';
import type { Store } from '../store/store';
import type { Invoice, PlanTier } from '../types';
import { ApiError } from '../utils/ApiError';

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  planName?: string;
  invoiceId?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  planName?: string;
  invoiceId?: string;
  customerName: string;
  customerEmail: string;
  status: 'created' | 'attempted' | 'paid';
  createdAt: string;
  keyId: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wave' | 'wallet';
  paymentDetails?: {
    upiId?: string;
    cardLast4?: string;
    bankName?: string;
    walletName?: string;
  };
  invoiceId?: string;
  planName?: string;
  amount: number;
  actor?: {
    who: string;
    role: string;
  };
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  timestamp: string;
  receiptNumber: string;
  invoice?: Invoice;
  subscriptionPlan?: string;
}

// In-memory registry of active gateway orders
const activeOrders = new Map<string, PaymentOrder>();

export function createPaymentOrder(
  store: Store,
  params: CreateOrderParams
): PaymentOrder {
  if (!params.amount || params.amount <= 0) {
    throw ApiError.badRequest('Payment amount must be greater than zero');
  }

  const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const order: PaymentOrder = {
    orderId,
    amount: params.amount,
    currency: params.currency || '₹',
    planName: params.planName,
    invoiceId: params.invoiceId,
    customerName: params.customerName || 'TechCorp',
    customerEmail: params.customerEmail || 'billing@techcorp.io',
    status: 'created',
    createdAt: new Date().toISOString(),
    keyId: 'rzp_live_subscriptiq_sec2026',
  };

  activeOrders.set(orderId, order);
  return order;
}

export async function verifyPayment(
  store: Store,
  params: VerifyPaymentParams
): Promise<PaymentVerificationResult> {
  const transactionId = `txn_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString();

  let formattedMethod = params.paymentMethod.toUpperCase();
  if (params.paymentMethod === 'upi') {
    formattedMethod = params.paymentDetails?.upiId
      ? `UPI (${params.paymentDetails.upiId})`
      : 'UPI / QR Code';
  } else if (params.paymentMethod === 'card') {
    formattedMethod = params.paymentDetails?.cardLast4
      ? `Card (•••• ${params.paymentDetails.cardLast4})`
      : 'Credit/Debit Card';
  } else if (params.paymentMethod === 'netbanking') {
    formattedMethod = params.paymentDetails?.bankName
      ? `Net Banking (${params.paymentDetails.bankName})`
      : 'Net Banking';
  } else if (params.paymentMethod === 'wave' || params.paymentMethod === 'wallet') {
    formattedMethod = params.paymentDetails?.walletName
      ? `Wallet (${params.paymentDetails.walletName})`
      : 'Wave / Digital Wallet';
  }

  const customerName = params.actor?.who ? params.actor.who.split(' ')[0] : 'TechCorp';

  // 1. If paying an existing invoice, mark it as Paid
  let targetInvoice: Invoice | undefined;
  if (params.invoiceId) {
    const invIndex = store.data.invoices.findIndex((i) => i.id === params.invoiceId);
    if (invIndex !== -1) {
      store.data.invoices[invIndex].status = 'Paid';
      store.data.invoices[invIndex].paymentMethod = formattedMethod;
      targetInvoice = store.data.invoices[invIndex];
    }
  }

  // 2. If upgrading or choosing a plan, update the customer's subscription plan & quotas
  if (params.planName) {
    const planName = params.planName as PlanTier;
    const plan = store.data.plans.find((p) => p.name.toLowerCase() === planName.toLowerCase());
    
    // Update customer plan in store
    const customer = store.data.customers.find(
      (c) => c.name.toLowerCase() === customerName.toLowerCase()
    );
    if (customer) {
      customer.plan = planName;
      customer.status = 'Active';
      customer.renewalDate = 'Apr 30, 2026';
    }

    // Generate fresh paid invoice for this plan checkout
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: customerName,
      period: 'Apr 01, 2026 - Apr 30, 2026',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Paid',
      total: params.amount,
      currency: '₹',
      paymentMethod: formattedMethod,
      dueDate: 'Paid instantly',
      lineItems: [
        {
          id: `li_plan_${Date.now()}`,
          lineItem: `${planName} Subscription Plan`,
          sourceUsage: plan?.apiLimit || '100,000 API requests',
          rate: `₹${params.amount}/month`,
          amount: params.amount,
        },
      ],
    };
    store.data.invoices.unshift(newInvoice);
    targetInvoice = newInvoice;
  }

  // 3. Dispatch Notification (Matching Slide 13 of PDF: "Payment received - ₹1,499 received from ...")
  store.data.notifications.unshift({
    id: `notif_${Date.now()}`,
    type: 'Billing',
    message: `Payment received: ₹${params.amount.toLocaleString()} received via ${formattedMethod}`,
    timestamp: 'Just now',
    unread: true,
  });

  // 4. Record Audit Log
  store.data.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    who: params.actor?.who || 'Customer Portal',
    role: params.actor?.role || 'Customer',
    change: `Processed payment of ₹${params.amount.toLocaleString()} for ${params.planName || targetInvoice?.invoiceNumber || 'Subscription'} via ${formattedMethod}`,
    timestamp: 'Just now',
  });

  // 5. Persist store asynchronously
  await store.persist();

  return {
    success: true,
    transactionId,
    orderId: params.orderId,
    amount: params.amount,
    currency: '₹',
    paymentMethod: formattedMethod,
    timestamp,
    receiptNumber,
    invoice: targetInvoice,
    subscriptionPlan: params.planName,
  };
}

export function getAvailablePaymentGateways() {
  return {
    gateways: [
      {
        id: 'upi',
        name: 'UPI / Instant QR',
        supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred'],
        processingTime: 'Instant',
        charges: '0%',
      },
      {
        id: 'card',
        name: 'Credit / Debit Cards',
        supportedCards: ['Visa', 'Mastercard', 'RuPay', 'American Express'],
        processingTime: 'Instant (3D Secure)',
        charges: '0%',
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        supportedBanks: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'],
        processingTime: 'Instant',
        charges: '0%',
      },
      {
        id: 'wave',
        name: 'Wave / Digital Wallets',
        supportedWallets: ['Wave Money', 'Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'],
        processingTime: 'Instant',
        charges: '0%',
      },
    ],
    currency: '₹',
    country: 'IN',
  };
}
