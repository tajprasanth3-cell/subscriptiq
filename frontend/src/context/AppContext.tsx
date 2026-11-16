import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Role,
  PlanTier,
  SubscriptionStatus,
  Customer,
  UsageMeter,
  UsageEvent,
  Invoice,
  AlertNotification,
  AlertRules,
  AuditLog,
  Plan,
} from '../types';
import {
  mockPlans,
  mockUsageMeters,
  mockUsageEvents,
  mockCurrentInvoice,
  mockBillingHistory,
  mockCustomers,
  mockNotifications,
  initialAlertRules,
  mockAuditLogs,
  mockAdminStats,
} from '../data/mockData';
import {
  ApiError,
  api,
  clearToken,
  setToken,
  type AuthUser,
  type Subscription,
} from '../services/api';
import type { PaymentGatewayOptions } from '../components/payment/PaymentGatewayModal';
import { downloadInvoicePdf } from '../utils/invoicePdf';

export type NavTabId =
  | 'dashboard'
  | 'plans'
  | 'usage'
  | 'billing'
  | 'customers'
  | 'notifications'
  | 'admin';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Auth & Session
  isAuthenticated: boolean;
  currentUserEmail: string;
  role: Role;
  organizationName: string;
  login: (email: string, password: string, role?: Role) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  register: (
    organizationName: string,
    email: string,
    password: string,
    roleToRegister?: Role,
    mobile?: string
  ) => Promise<boolean>;
  logout: () => void;
  toggleRole: () => void;
  setRole: (role: Role) => void;
  refreshWorkspace: () => Promise<void>;

  // Navigation
  currentTab: NavTabId;
  setCurrentTab: (tab: NavTabId) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Subscription & Plans
  plansList: Plan[];
  currentPlan: PlanTier;
  subscriptionStatus: SubscriptionStatus;
  billingCycle: 'monthly' | 'annual';
  setBillingCycle: (cycle: 'monthly' | 'annual') => void;
  upgradePlan: (plan: PlanTier) => Promise<boolean>;
  createPlan: (newPlan: Omit<Plan, 'id'>) => void;
  deletePlan: (id: string) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;

  // Usage & Events
  meters: UsageMeter[];
  events: UsageEvent[];
  simulateIngestion: (forceDuplicate?: boolean) => void;
  clearEvents: () => void;

  // Invoices & Billing
  currentInvoice: Invoice;
  billingHistory: Invoice[];
  selectedInvoiceForModal: Invoice | null;
  setSelectedInvoiceForModal: (inv: Invoice | null) => void;
  downloadInvoicePDF: (invoiceId: string) => void;
  previewInvoicePDF: (invoiceId: string) => void;
  payInvoice: (invoiceId: string) => Promise<Invoice | null>;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id'>) => void;
  updateCustomerStatus: (id: string, status: Customer['status']) => void;

  // Alerts & Rules
  alertRules: AlertRules;
  updateAlertRules: (rules: AlertRules) => void;
  notifications: AlertNotification[];
  triggerTestAlert: (msg?: string) => void;
  markNotificationsAsRead: () => void;
  markSingleNotificationAsRead: (id: string) => void;
  unreadCount: number;

  // Admin
  auditLogs: AuditLog[];
  adminStats: typeof mockAdminStats;

  // Payment Gateway
  isPaymentGatewayOpen: boolean;
  paymentGatewayOptions: PaymentGatewayOptions | null;
  openPaymentGateway: (options: PaymentGatewayOptions) => void;
  closePaymentGateway: () => void;
  handlePaymentSuccess: (result: {
    transactionId: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
  }) => Promise<void>;

  // Toast System
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  'Business Owner': { email: 'owner@acme.com', password: 'password123' },
  'Super Admin': { email: 'admin@subscriptiq.platform', password: 'adminpass' },
  Customer: { email: 'customer@techcorp.io', password: 'custpass' },
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Auth state - always display the Login Page first on fresh launch/visit
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [role, setRoleState] = useState<Role>('Business Owner');
  const [organizationName, setOrganizationName] = useState<string>('');

  // Navigation state
  const [currentTab, setCurrentTabState] = useState<NavTabId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const setCurrentTab = (tab: NavTabId) => {
    setCurrentTabState(tab);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Plan state
  const [plansList, setPlansList] = useState<Plan[]>(mockPlans);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('Professional');
  const [subscriptionStatus, setSubscriptionStatusState] =
    useState<SubscriptionStatus>('active');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Usage & Meter state
  const [meters, setMeters] = useState<UsageMeter[]>(mockUsageMeters);
  const [events, setEvents] = useState<UsageEvent[]>(mockUsageEvents);

  // Billing state
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(mockCurrentInvoice);
  const [billingHistory, setBillingHistory] = useState<Invoice[]>(mockBillingHistory);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);

  // Global Payment Gateway Modal State
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [paymentGatewayOptions, setPaymentGatewayOptions] = useState<PaymentGatewayOptions | null>(null);

  const openPaymentGateway = (options: PaymentGatewayOptions) => {
    setPaymentGatewayOptions(options);
    setIsPaymentGatewayOpen(true);
  };

  const closePaymentGateway = () => {
    setIsPaymentGatewayOpen(false);
    setPaymentGatewayOptions(null);
  };

  const handlePaymentSuccess = async (result: {
    transactionId: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
  }) => {
    try {
      if (paymentGatewayOptions?.invoiceId) {
        await payInvoice(paymentGatewayOptions.invoiceId);
      }
      if (paymentGatewayOptions?.planName) {
        await upgradePlan(paymentGatewayOptions.planName as PlanTier);
      }
      // Add notification matching Slide 13 of PDF
      const notif: AlertNotification = {
        id: `notif_${Date.now()}`,
        type: 'Billing',
        message: `Payment received: ₹${result.amount.toLocaleString()} received via ${result.paymentMethod}`,
        timestamp: 'Just now',
        unread: true,
      };
      setNotifications((prev) => [notif, ...prev]);
      showToast(
        `Payment of ₹${result.amount.toLocaleString()} authorized via ${result.paymentMethod}!`,
        'success'
      );
    } catch (e) {
      console.error('Payment callback error', e);
    }
  };

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  // Alerts state
  const [alertRules, setAlertRules] = useState<AlertRules>(initialAlertRules);
  const [notifications, setNotifications] = useState<AlertNotification[]>(mockNotifications);

  // Admin state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [adminStats, setAdminStats] = useState<typeof mockAdminStats>(mockAdminStats);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      toastCounterRef.current += 1;
      const id = `toast_${toastCounterRef.current}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  const fail = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearToken();
        setIsAuthenticated(false);
      }
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to reach the API. Is the backend running on port 4000?';
      showToast(message, 'error');
    },
    [showToast]
  );

  const applyUser = useCallback((user: AuthUser) => {
    const emailLower = user.email.toLowerCase().trim();
    let detectedRole: Role = user.role;
    if (emailLower.includes('customer') || emailLower.startsWith('cust')) {
      detectedRole = 'Customer';
    } else if (emailLower.includes('admin')) {
      detectedRole = 'Super Admin';
    } else if (emailLower.includes('owner')) {
      detectedRole = 'Business Owner';
    }

    setCurrentUserEmail(user.email);
    setRoleState(detectedRole);
    setOrganizationName(
      detectedRole === 'Customer'
        ? 'TechCorp'
        : detectedRole === 'Super Admin'
        ? 'SubscriptIQ Platform'
        : user.organizationName || 'Acme Corp'
    );
  }, []);

  const applySubscription = useCallback((subscription: Subscription) => {
    setCurrentPlan(subscription.plan as PlanTier);
    setSubscriptionStatusState(subscription.status);
    setBillingCycle(subscription.billingCycle);
  }, []);

  const loadWorkspace = useCallback(
    async (activeRole: Role) => {
      if (activeRole === 'Customer') {
        // Strict Customer Isolation: Never query or leak Business Owner customers or owner invoices
        setCustomers([]);

        // Dedicated Customer usage metrics matching Slide 9 of spec
        const customerMeters: UsageMeter[] = [
          {
            id: 'api_requests',
            name: 'API requests',
            used: 72450,
            limit: 100000,
            unit: 'reqs',
            percentage: 72.5,
            statusLabel: 'Within quota',
            statusType: 'normal',
          },
          {
            id: 'storage',
            name: 'Storage',
            used: 24,
            limit: 50,
            unit: 'GB',
            percentage: 48,
            statusLabel: 'Within limit',
            statusType: 'normal',
          },
        ];

        const customerInvoice: Invoice = {
          id: 'inv_00124',
          invoiceNumber: 'INV-00124',
          customer: 'TechCorp',
          period: 'March 2026',
          status: 'Paid',
          currency: '₹',
          total: 1499,
          dueDate: 'Apr 30, 2026',
          paymentMethod: 'Auto-debit via Visa ending in 1099',
          lineItems: [
            {
              id: 'li_tc_1',
              lineItem: 'TechCorp Growth Plan',
              sourceUsage: 'Base tier subscription',
              rate: 'Flat',
              amount: 1499,
            },
            {
              id: 'li_tc_2',
              lineItem: 'API requests',
              sourceUsage: 'Included in plan (72.5k used)',
              rate: 'Included',
              amount: 0,
            },
          ],
        };

        try {
          const [plans, rules, notificationsPage] = await Promise.all([
            api.plans.list(),
            api.alerts.rules(),
            api.alerts.notifications({ page: 1, pageSize: 100 }),
          ]);
          setPlansList(plans);
          setAlertRules(rules);
          setNotifications(notificationsPage.items);
        } catch {
          // Fallback to seeded catalog
        }

        applySubscription({
          id: 'sub_techcorp',
          plan: 'Professional',
          status: 'active',
          billingCycle: 'monthly',
          startedAt: new Date().toISOString(),
          renewalDate: 'Apr 30, 2026',
        });
        setMeters(customerMeters);
        setEvents([
          {
            id: 'evt_tc_1',
            customer: 'TechCorp',
            resource: 'API requests',
            quantity: 250,
            timestamp: '1 hour ago',
            status: 'Accepted',
            statusCategory: 'accepted',
          },
          {
            id: 'evt_tc_2',
            customer: 'TechCorp',
            resource: 'Storage',
            quantity: 500,
            timestamp: '5 hours ago',
            status: 'Accepted',
            statusCategory: 'accepted',
          },
        ]);
        setCurrentInvoice(customerInvoice);
        setBillingHistory([customerInvoice]);
        return;
      }

      const customersPage = await api.customers.list({ page: 1, pageSize: 100 });

      const [
        plans,
        subscription,
        meterList,
        eventsPage,
        invoice,
        invoicesPage,
        rules,
        notificationsPage,
      ] = await Promise.all([
        api.plans.list(),
        api.subscription.get(),
        api.usage.meters(),
        api.usage.events({ page: 1, pageSize: 100 }),
        api.billing.current(),
        api.billing.invoices({ page: 1, pageSize: 100 }),
        api.alerts.rules(),
        api.alerts.notifications({ page: 1, pageSize: 100 }),
      ]);

      setPlansList(plans);
      applySubscription(subscription);
      setMeters(meterList);
      setEvents(eventsPage.items);
      setCurrentInvoice(invoice);
      setBillingHistory(invoicesPage.items);
      setCustomers(customersPage.items);
      setAlertRules(rules);
      setNotifications(notificationsPage.items);

      if (activeRole === 'Super Admin') {
        const [stats, auditPage] = await Promise.all([
          api.admin.stats(),
          api.admin.auditLogs({ page: 1, pageSize: 100 }),
        ]);
        setAdminStats(stats);
        setAuditLogs(auditPage.items);
      }
    },
    [applySubscription]
  );

  // Serialize refreshes so an older in-flight load cannot overwrite newer state.
  const refreshChain = useRef<Promise<void>>(Promise.resolve());
  const refreshWorkspace = useCallback(() => {
    const next = refreshChain.current.then(() => loadWorkspace(role));
    refreshChain.current = next.catch(() => undefined);
    return next;
  }, [loadWorkspace, role]);

  // Always present the Login Page first when loading the hosted application.
  useEffect(() => {
    clearToken();
  }, []);

  const login = async (email: string, password: string, role?: Role): Promise<boolean> => {
    try {
      const emailLower = email.toLowerCase().trim();
      let detectedRole = role;
      if (!detectedRole) {
        if (emailLower.includes('customer') || emailLower.startsWith('cust')) {
          detectedRole = 'Customer';
        } else if (emailLower.includes('admin')) {
          detectedRole = 'Super Admin';
        } else if (emailLower.includes('owner')) {
          detectedRole = 'Business Owner';
        }
      }

      const result = await api.auth.login(email, password, detectedRole);
      setToken(result.token);

      const finalRole: Role =
        detectedRole === 'Customer' ||
        result.user.role === 'Customer' ||
        emailLower.includes('customer')
          ? 'Customer'
          : detectedRole === 'Super Admin' ||
            result.user.role === 'Super Admin' ||
            emailLower.includes('admin')
          ? 'Super Admin'
          : 'Business Owner';

      setRoleState(finalRole);
      setCurrentUserEmail(result.user.email);
      setOrganizationName(
        finalRole === 'Customer'
          ? 'TechCorp'
          : finalRole === 'Super Admin'
          ? 'SubscriptIQ Platform'
          : result.user.organizationName || 'Acme Corp'
      );
      setIsAuthenticated(true);
      setCurrentTabState(finalRole === 'Super Admin' ? 'admin' : 'dashboard');
      setIsMobileMenuOpen(false);

      try {
        await loadWorkspace(finalRole);
      } catch (error) {
        console.warn('Background workspace refresh error after login:', error);
      }
      showToast(`Welcome back, ${result.user.email}!`, 'success');
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const result = await api.auth.resetPassword(email, newPassword);
      setToken(result.token);
      applyUser(result.user);
      setIsAuthenticated(true);
      setCurrentTabState(result.user.role === 'Super Admin' ? 'admin' : 'dashboard');
      setIsMobileMenuOpen(false);
      try {
        await loadWorkspace(result.user.role);
      } catch (error) {
        console.warn('Background workspace refresh error after reset:', error);
      }
      showToast(`Password successfully updated! Welcome, ${result.user.email}`, 'success');
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const register = async (
    organizationNameInput: string,
    email: string,
    password: string,
    roleToRegister: Role = 'Business Owner',
    mobile?: string
  ): Promise<boolean> => {
    try {
      const result = await api.auth.register(
        organizationNameInput,
        email,
        password,
        roleToRegister,
        mobile
      );
      setToken(result.token);
      applyUser(result.user);
      setIsAuthenticated(true);
      setCurrentTabState(result.user.role === 'Super Admin' ? 'admin' : 'dashboard');
      setIsMobileMenuOpen(false);
      try {
        await loadWorkspace(result.user.role);
      } catch (error) {
        console.warn('Background workspace refresh error after register:', error);
      }
      showToast(
        roleToRegister === 'Customer'
          ? `Customer account for "${organizationNameInput}" created!`
          : `Organization "${organizationNameInput}" registered!`,
        'success'
      );
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
    setCurrentUserEmail('');
    setRoleState('Business Owner');
    setOrganizationName('');
    setCurrentTabState('dashboard');
    setIsMobileMenuOpen(false);
    showToast('Signed out successfully.', 'info');
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    setCurrentTabState(newRole === 'Super Admin' ? 'admin' : 'dashboard');
    setIsMobileMenuOpen(false);
  };

  const toggleRole = () => {
    const nextRole: Role =
      role === 'Business Owner'
        ? 'Super Admin'
        : role === 'Super Admin'
        ? 'Customer'
        : 'Business Owner';
    const credentials = DEMO_CREDENTIALS[nextRole];
    setIsMobileMenuOpen(false);
    showToast(`Switching to ${nextRole} workspace...`, 'info');
    login(credentials.email, credentials.password);
  };

  const upgradePlan = async (plan: PlanTier): Promise<boolean> => {
    try {
      const subscription = await api.subscription.change(plan, billingCycle);
      applySubscription(subscription);
      const [plans, invoice, notificationsPage] = await Promise.all([
        api.plans.list(),
        api.billing.current(),
        api.alerts.notifications({ page: 1, pageSize: 100 }),
      ]);
      setPlansList(plans);
      setCurrentInvoice(invoice);
      setNotifications(notificationsPage.items);

      // Update audit logs if admin endpoint is available
      try {
        const auditPage = await api.admin.auditLogs({ page: 1, pageSize: 100 });
        setAuditLogs(auditPage.items);
      } catch {
        // Non-admin roles might not have direct audit route access
      }

      showToast(`Plan successfully changed to ${plan}!`, 'success');
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const refreshAuditLogs = async () => {
    try {
      const auditPage = await api.admin.auditLogs({ page: 1, pageSize: 100 });
      setAuditLogs(auditPage.items);
    } catch {
      // Non-admin roles might not have direct audit route access
    }
  };

  const createPlan = (newPlan: Omit<Plan, 'id'>) => {
    void (async () => {
      try {
        await api.plans.create(newPlan);
        setPlansList(await api.plans.list());
        await refreshAuditLogs();
        showToast(`New tier "${newPlan.name}" created!`, 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const deletePlan = (id: string) => {
    void (async () => {
      try {
        await api.plans.remove(id);
        setPlansList(await api.plans.list());
        await refreshAuditLogs();
        showToast('Plan deleted from catalog.', 'info');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const cancelSubscription = () => {
    void (async () => {
      try {
        applySubscription(await api.subscription.cancel());
        await refreshAuditLogs();
        showToast('Subscription cancelled. Active until the end of the billing period.', 'warning');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const reactivateSubscription = () => {
    void (async () => {
      try {
        applySubscription(await api.subscription.reactivate());
        await refreshAuditLogs();
        showToast('Subscription reactivated successfully!', 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const setSubscriptionStatus = (status: SubscriptionStatus) => {
    void (async () => {
      try {
        applySubscription(await api.subscription.setStatus(status));
        await refreshAuditLogs();
        showToast(`Subscription status set to ${status}.`, 'info');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const simulateIngestion = (forceDuplicate = false) => {
    void (async () => {
      try {
        const [result] = await api.usage.simulate(forceDuplicate);
        const [eventsPage, meterList] = await Promise.all([
          api.usage.events({ page: 1, pageSize: 100 }),
          api.usage.meters(),
        ]);
        setEvents(eventsPage.items);
        setMeters(meterList);

        if (!result) return;
        if (result.metered) {
          showToast(`Ingested event ${result.event.id} (Accepted & metered)`, 'success');
        } else if (result.event.statusCategory === 'duplicate') {
          showToast(`Duplicate event ${result.event.id} safely ignored (Idempotent)`, 'info');
        } else {
          showToast(`Event ${result.event.id}: ${result.event.status}`, 'warning');
        }
      } catch (error) {
        fail(error);
      }
    })();
  };

  const clearEvents = () => {
    void (async () => {
      try {
        await api.usage.clearEvents();
        setEvents([]);
        showToast('Cleared events log.', 'info');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const downloadInvoicePDF = (invoiceId: string) => {
    const invoice =
      invoiceId === 'inv_current'
        ? currentInvoice
        : billingHistory.find((inv) => inv.id === invoiceId) || currentInvoice;
    void downloadInvoicePdf(invoice);
  };

  const previewInvoicePDF = (invoiceId: string) => {
    const invoice =
      invoiceId === 'inv_current'
        ? currentInvoice
        : billingHistory.find((inv) => inv.id === invoiceId) || currentInvoice;
    setSelectedInvoiceForModal(invoice);
  };

  const payInvoice = async (invoiceId: string): Promise<Invoice | null> => {
    try {
      const paid = await api.billing.pay(invoiceId);
      if (paid.id === currentInvoice.id || invoiceId === 'inv_current') {
        setCurrentInvoice(paid);
      }
      setBillingHistory((prev) =>
        prev.map((inv) => (inv.id === paid.id ? paid : inv))
      );
      setSelectedInvoiceForModal((prev) =>
        prev && (prev.id === paid.id || invoiceId === 'inv_current') ? paid : prev
      );
      showToast(`Invoice ${paid.invoiceNumber} marked as paid.`, 'success');
      return paid;
    } catch (error) {
      fail(error);
      return null;
    }
  };

  const addCustomer = (cust: Omit<Customer, 'id'>) => {
    void (async () => {
      try {
        await api.customers.create(cust);
        const page = await api.customers.list({ page: 1, pageSize: 100 });
        setCustomers(page.items);
        await refreshAuditLogs();
        showToast(`Customer "${cust.name}" registered successfully!`, 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const updateCustomerStatus = (id: string, status: Customer['status']) => {
    void (async () => {
      try {
        await api.customers.setStatus(id, status);
        const page = await api.customers.list({ page: 1, pageSize: 100 });
        setCustomers(page.items);
        await refreshAuditLogs();
        showToast(`Updated customer status to "${status}"`, 'info');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const updateAlertRules = (newRules: AlertRules) => {
    void (async () => {
      try {
        setAlertRules(await api.alerts.updateRules(newRules));
        showToast('Alert and limit rules saved!', 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const triggerTestAlert = (msg = 'Test Alert: API usage passed 90% threshold') => {
    void (async () => {
      try {
        await api.alerts.testNotification(msg);
        const page = await api.alerts.notifications({ page: 1, pageSize: 100 });
        setNotifications(page.items);
        showToast('Dispatched test threshold alert!', 'warning');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const markNotificationsAsRead = () => {
    void (async () => {
      try {
        await api.alerts.markRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      } catch (error) {
        fail(error);
      }
    })();
  };

  const markSingleNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUserEmail,
        role,
        organizationName,
        refreshWorkspace,
        login,
        resetPassword,
        register,
        logout,
        toggleRole,
        setRole,
        currentTab,
        setCurrentTab,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        plansList,
        currentPlan,
        subscriptionStatus,
        billingCycle,
        setBillingCycle,
        upgradePlan,
        createPlan,
        deletePlan,
        cancelSubscription,
        reactivateSubscription,
        setSubscriptionStatus,
        meters,
        events,
        simulateIngestion,
        clearEvents,
        currentInvoice,
        billingHistory,
        selectedInvoiceForModal,
        setSelectedInvoiceForModal,
        downloadInvoicePDF,
        previewInvoicePDF,
        payInvoice,
        customers,
        addCustomer,
        updateCustomerStatus,
        alertRules,
        updateAlertRules,
        notifications,
        triggerTestAlert,
        markNotificationsAsRead,
        markSingleNotificationAsRead,
        unreadCount,
        auditLogs,
        adminStats,
        isPaymentGatewayOpen,
        paymentGatewayOptions,
        openPaymentGateway,
        closePaymentGateway,
        handlePaymentSuccess,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';
