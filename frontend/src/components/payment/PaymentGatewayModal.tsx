import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Download,
  AlertCircle,
  Smartphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { downloadReceiptPdf } from '../../utils/invoicePdf';

export interface PaymentGatewayOptions {
  title?: string;
  itemTitle: string;
  itemSubtitle?: string;
  amount: number;
  currency?: string;
  planName?: string;
  invoiceId?: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess?: (result: {
    transactionId: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
  }) => void;
  onClose?: () => void;
}

interface PaymentGatewayModalProps {
  isOpen: boolean;
  options: PaymentGatewayOptions | null;
  onClose: () => void;
  onSuccess: (result: {
    transactionId: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
  }) => void;
}

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wave';
type Step = 'select' | 'processing' | 'success';

export const PaymentGatewayModal = ({
  isOpen,
  options,
  onClose,
  onSuccess,
}: PaymentGatewayModalProps) => {
  const [method, setMethod] = useState<PaymentMethodType>('upi');
  const [step, setStep] = useState<Step>('select');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Wave Money');
  const [processingMessage, setProcessingMessage] = useState('Initiating secure gateway handshake...');
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<{
    transactionId: string;
    receiptNumber: string;
    date: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setErrorMsg('');
      setReceipt(null);
      if (!cardName && options?.customerName) {
        setCardName(options.customerName);
      }
    }
  }, [isOpen, options]);

  if (!isOpen || !options) return null;

  const currency = options.currency || '₹';
  const amount = options.amount;
  const total = amount;

  const handleDownloadReceipt = () => {
    if (!receipt) return;
    let methodLabel = 'UPI';
    if (method === 'card') methodLabel = `Card (•••• ${cardNumber.slice(-4)})`;
    if (method === 'netbanking') methodLabel = `Net Banking (${selectedBank})`;
    if (method === 'wave') methodLabel = `Wallet (${selectedWallet})`;
    downloadReceiptPdf({
      ...receipt,
      currency,
      itemTitle: options.itemTitle,
      itemSubtitle: options.itemSubtitle,
      paymentMethod: methodLabel,
    });
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Card';
  };

  const handlePay = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // Basic validation
    if (method === 'upi' && !upiId.trim() && !upiId.includes('@')) {
      if (!upiId) {
        // If user didn't type UPI ID, let them proceed with QR scan flow
      } else if (!upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. name@okaxis)');
        return;
      }
    }

    if (method === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setErrorMsg('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMsg('Please enter expiration as MM/YY');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMsg('Please enter 3-digit CVV');
        return;
      }
    }

    setStep('processing');
    setProcessingMessage('Initiating 256-bit bank handshake...');

    setTimeout(() => {
      setProcessingMessage('Verifying authorization with banking network...');
    }, 700);

    setTimeout(() => {
      setProcessingMessage('Capturing payment and generating tax invoice...');
    }, 1400);

    setTimeout(() => {
      const txnId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const recNum = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const recData = {
        transactionId: txnId,
        receiptNumber: recNum,
        date: new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        amount: total,
      };

      setReceipt(recData);
      setStep('success');

      let methodDisplay = 'UPI';
      if (method === 'card') methodDisplay = `Card (•••• ${cardNumber.slice(-4)})`;
      if (method === 'netbanking') methodDisplay = `Net Banking (${selectedBank})`;
      if (method === 'wave') methodDisplay = `Wallet (${selectedWallet})`;

      onSuccess({
        transactionId: txnId,
        receiptNumber: recNum,
        amount: total,
        paymentMethod: methodDisplay,
      });

      if (options.onSuccess) {
        options.onSuccess({
          transactionId: txnId,
          receiptNumber: recNum,
          amount: total,
          paymentMethod: methodDisplay,
        });
      }
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Gateway Security Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">SubscriptIQ Checkout</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                256-Bit SSL Encrypted • PCI-DSS Level 1 Certified
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cancel payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'processing' ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold text-lg">
                ₹
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Authorizing Payment</h3>
              <p className="text-sm text-slate-500 max-w-sm">{processingMessage}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Do not refresh or close this window
            </div>
          </div>
        ) : step === 'success' && receipt ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Authorized
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {currency}{receipt.amount.toLocaleString()} Paid Successfully
              </h2>
              <p className="text-sm text-slate-500">
                Your subscription and quotas have been upgraded instantly.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full max-w-md bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-semibold text-slate-800">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment For:</span>
                <span className="font-semibold text-slate-900">{options.itemTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-700">{receipt.date}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-900">Total Paid:</span>
                <span className="font-extrabold text-emerald-600">
                  {currency}{receipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
              <Button
                variant="outline"
                fullWidth
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadReceipt}
              >
                Download Receipt
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={onClose}
              >
                Done & Return
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-y-auto">
            {/* Left Column: Order Summary (5 cols) */}
            <div className="md:col-span-5 bg-slate-50/70 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Order Summary
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{options.itemTitle}</h3>
                  {options.itemSubtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{options.itemSubtitle}</p>
                  )}
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Amount:</span>
                    <span className="font-mono font-medium">{currency}{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Included GST / Platform fee:</span>
                    <span className="font-mono text-emerald-600 font-medium">Included (₹0)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Billing Interval:</span>
                    <span className="font-medium text-slate-900">Monthly</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm">
                    <span className="font-bold text-slate-900">Total Payable:</span>
                    <span className="text-2xl font-extrabold text-indigo-600">
                      {currency}{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Instant Metered Quota Upgrade
                  </div>
                  <p className="text-indigo-700/90 text-[11px] leading-relaxed">
                    Once payment is verified, your organization API quota, storage tier and automated invoice receipt activate immediately.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-200 pt-4">
                <span>Account: {options.customerName || 'TechCorp'}</span>
                <span>ID: {options.customerEmail || 'billing@techcorp.io'}</span>
              </div>
            </div>

            {/* Right Column: Payment Gateway Selection (7 cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-5">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Select Gateway Mode
                </span>

                {/* Gateway Mode Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setMethod('upi'); setErrorMsg(''); }}
                    className={clsx(
                      'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                      method === 'upi'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('card'); setErrorMsg(''); }}
                    className={clsx(
                      'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                      method === 'card'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('netbanking'); setErrorMsg(''); }}
                    className={clsx(
                      'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                      method === 'netbanking'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">NetBanking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('wave'); setErrorMsg(''); }}
                    className={clsx(
                      'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                      method === 'wave'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}
                  >
                    <Wallet className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">Wave / Wallets</span>
                  </button>
                </div>

                {/* Form based on Method */}
                {method === 'upi' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                      {/* Simulated QR Code */}
                      <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                        <QrCode className="w-20 h-20 text-slate-900" />
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
                      </div>

                      <div className="space-y-1.5 text-center sm:text-left">
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">Scan & Pay via any UPI App</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Scan using Google Pay, PhonePe, Paytm, BHIM or Cred.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start pt-1">
                          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                            <span key={app} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                        Or enter UPI ID
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {method === 'card' && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Card Number</label>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {getCardBrand(cardNumber)}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8821"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          maxLength={19}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          maxLength={5}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name as on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div className="space-y-4 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">Popular Banks</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={clsx(
                            'p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer truncate',
                            selectedBank === bank
                              ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          )}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {method === 'wave' && (
                  <div className="space-y-4 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">Digital Wallets & Wave</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['Wave Money', 'Amazon Pay', 'Paytm Wallet', 'PhonePe Wallet'].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWallet(w)}
                          className={clsx(
                            'p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between',
                            selectedWallet === w
                              ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          )}
                        >
                          <span>{w}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClose}
                  className="w-1/3"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={handlePay}
                >
                  Authorize & Pay {currency}{total.toLocaleString()}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
