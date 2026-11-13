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
  getToken,
  setToken,
  type AuthUser,
  type Subscription,
} from '../services/api';

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
  login: (email: string, password: string) => void;
  register: (organizationName: string, email: string, password: string) => void;
  logout: () => void;
  toggleRole: () => void;
  setRole: (role: Role) => void;

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
  upgradePlan: (plan: PlanTier) => void;
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
  unreadCount: number;

  // Admin
  auditLogs: AuditLog[];
  adminStats: typeof mockAdminStats;

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
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getToken()));
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
    setCurrentUserEmail(user.email);
    setRoleState(user.role);
    setOrganizationName(user.organizationName);
  }, []);

  const applySubscription = useCallback((subscription: Subscription) => {
    setCurrentPlan(subscription.plan as PlanTier);
    setSubscriptionStatusState(subscription.status);
    setBillingCycle(subscription.billingCycle);
  }, []);

  const loadWorkspace = useCallback(
    async (activeRole: Role) => {
      const [
        plans,
        subscription,
        meterList,
        eventsPage,
        invoice,
        invoicesPage,
        customersPage,
        rules,
        notificationsPage,
      ] = await Promise.all([
        api.plans.list(),
        api.subscription.get(),
        api.usage.meters(),
        api.usage.events({ page: 1, pageSize: 100 }),
        api.billing.current(),
        api.billing.invoices({ page: 1, pageSize: 100 }),
        api.customers.list({ page: 1, pageSize: 100 }),
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

  // Restore an existing session on boot.
  useEffect(() => {
    if (!getToken()) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const { user } = await api.auth.me();
        if (cancelled) return;
        applyUser(user);
        setIsAuthenticated(true);
        setCurrentTabState(user.role === 'Super Admin' ? 'admin' : 'dashboard');
        try {
          await loadWorkspace(user.role);
        } catch (error) {
          fail(error);
        }
      } catch {
        if (cancelled) return;
        clearToken();
        setIsAuthenticated(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyUser, loadWorkspace, fail]);

  const login = (email: string, password: string) => {
    void (async () => {
      try {
        const result = await api.auth.login(email, password);
        setToken(result.token);
        applyUser(result.user);
        setIsAuthenticated(true);
        setCurrentTabState(result.user.role === 'Super Admin' ? 'admin' : 'dashboard');
        try {
          await loadWorkspace(result.user.role);
        } catch (error) {
          fail(error);
        }
        showToast(`Welcome back, ${result.user.email}!`, 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const register = (organizationNameInput: string, email: string, password: string) => {
    void (async () => {
      try {
        const result = await api.auth.register(organizationNameInput, email, password);
        setToken(result.token);
        applyUser(result.user);
        setIsAuthenticated(true);
        setCurrentTabState('dashboard');
        try {
          await loadWorkspace(result.user.role);
        } catch (error) {
          fail(error);
        }
        showToast(`Organization "${organizationNameInput}" registered!`, 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
    setCurrentTabState('dashboard');
    showToast('Signed out successfully.', 'info');
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const toggleRole = () => {
    const nextRole: Role =
      role === 'Business Owner'
        ? 'Super Admin'
        : role === 'Super Admin'
        ? 'Customer'
        : 'Business Owner';
    const credentials = DEMO_CREDENTIALS[nextRole];
    showToast(`Switching to ${nextRole} workspace...`, 'info');
    login(credentials.email, credentials.password);
  };

  const upgradePlan = (plan: PlanTier) => {
    void (async () => {
      try {
        const subscription = await api.subscription.change(plan, billingCycle);
        applySubscription(subscription);
        const [plans, invoice] = await Promise.all([api.plans.list(), api.billing.current()]);
        setPlansList(plans);
        setCurrentInvoice(invoice);
        showToast(`Plan successfully changed to ${plan}!`, 'success');
      } catch (error) {
        fail(error);
      }
    })();
  };

  const createPlan = (newPlan: Omit<Plan, 'id'>) => {
    void (async () => {
      try {
        await api.plans.create(newPlan);
        setPlansList(await api.plans.list());
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
    setSelectedInvoiceForModal(invoice);
  };

  const addCustomer = (cust: Omit<Customer, 'id'>) => {
    void (async () => {
      try {
        await api.customers.create(cust);
        const page = await api.customers.list({ page: 1, pageSize: 100 });
        setCustomers(page.items);
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

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUserEmail,
        role,
        organizationName,
        login,
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
        customers,
        addCustomer,
        updateCustomerStatus,
        alertRules,
        updateAlertRules,
        notifications,
        triggerTestAlert,
        markNotificationsAsRead,
        unreadCount,
        auditLogs,
        adminStats,
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
