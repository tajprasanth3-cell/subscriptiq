import type {
  AlertNotification,
  AlertRules,
  AuditLog,
  Customer,
  Invoice,
  Plan,
  Role,
  UsageEvent,
  UsageMeter,
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
import type {
  AuthResult,
  AuthUser,
  Subscription,
  Paginated,
  IngestResult,
  AdminStats,
  NotificationPage,
} from './api';

// In-memory persistent state across requests
let currentAuthUser: AuthUser = {
  id: 'user_owner',
  email: 'owner@acme.com',
  name: 'John Smith',
  role: 'Business Owner',
  organizationId: 'org_acme',
  organizationName: 'Acme Corp',
};

let plansState: Plan[] = [...mockPlans];
let subscriptionState: Subscription = {
  id: 'sub_pro_001',
  plan: 'Professional',
  status: 'active',
  billingCycle: 'monthly',
  startedAt: '2026-01-01T00:00:00Z',
  renewalDate: 'Apr 30, 2026',
};
let metersState: UsageMeter[] = [...mockUsageMeters];
let eventsState: UsageEvent[] = [...mockUsageEvents];
let currentInvoiceState: Invoice = { ...mockCurrentInvoice };
let invoicesState: Invoice[] = [...mockBillingHistory];
let customersState: Customer[] = [...mockCustomers];
let alertRulesState: AlertRules = { ...initialAlertRules };
let notificationsState: AlertNotification[] = [...mockNotifications];
let auditLogsState: AuditLog[] = [...mockAuditLogs];

const DEMO_ACCOUNTS: Record<string, { role: Role; name: string; orgName: string; orgId: string }> = {
  'owner@acme.com': {
    role: 'Business Owner',
    name: 'John Smith',
    orgName: 'Acme Corp',
    orgId: 'org_acme',
  },
  'admin@subscriptiq.platform': {
    role: 'Super Admin',
    name: 'Platform Admin',
    orgName: 'SubscriptIQ Platform',
    orgId: 'org_platform',
  },
  'customer@techcorp.io': {
    role: 'Customer',
    name: 'Alex Johnson',
    orgName: 'TechCorp',
    orgId: 'org_techcorp',
  },
};

export async function mockApiHandler<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const url = new URL(path, 'http://localhost');
  const pathname = url.pathname;
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. Auth endpoints
  if (pathname === '/auth/login' && method === 'POST') {
    const { email, role } = body;
    const lowerEmail = (email || '').toLowerCase().trim();

    let account = DEMO_ACCOUNTS[lowerEmail];
    if (role === 'Customer') {
      account = DEMO_ACCOUNTS['customer@techcorp.io'];
    } else if (role === 'Super Admin') {
      account = DEMO_ACCOUNTS['admin@subscriptiq.platform'];
    } else if (role === 'Business Owner') {
      account = DEMO_ACCOUNTS['owner@acme.com'];
    } else if (!account) {
      if (lowerEmail.includes('admin')) {
        account = {
          role: 'Super Admin',
          name: 'Platform Admin',
          orgName: 'SubscriptIQ Platform',
          orgId: 'org_platform',
        };
      } else if (lowerEmail.includes('customer')) {
        account = {
          role: 'Customer',
          name: 'Alex Johnson',
          orgName: 'TechCorp',
          orgId: 'org_techcorp',
        };
      } else {
        account = {
          role: 'Business Owner',
          name: email.split('@')[0] || 'Business Owner',
          orgName: 'Acme Corp',
          orgId: 'org_acme',
        };
      }
    }

    currentAuthUser = {
      id: `user_${Date.now()}`,
      email: email || (account.role === 'Customer' ? 'customer@techcorp.io' : 'owner@acme.com'),
      name: account.name,
      role: account.role,
      organizationId: account.orgId,
      organizationName: account.orgName,
    };

    const result: AuthResult = {
      token: `mock_jwt_token_${currentAuthUser.role.replace(/\s+/g, '_')}_${Date.now()}`,
      user: currentAuthUser,
    };
    return result as T;
  }

  if (pathname === '/auth/reset-password' && method === 'POST') {
    const { email } = body;
    const lowerEmail = (email || '').toLowerCase().trim();
    let account = DEMO_ACCOUNTS[lowerEmail];
    if (!account) {
      if (lowerEmail.includes('admin')) {
        account = {
          role: 'Super Admin',
          name: 'Platform Admin',
          orgName: 'SubscriptIQ Platform',
          orgId: 'org_platform',
        };
      } else if (lowerEmail.includes('customer')) {
        account = {
          role: 'Customer',
          name: 'Alex Johnson',
          orgName: 'TechCorp',
          orgId: 'org_techcorp',
        };
      } else {
        account = {
          role: 'Business Owner',
          name: email.split('@')[0] || 'Business Owner',
          orgName: 'Acme Corp',
          orgId: 'org_acme',
        };
      }
    }

    currentAuthUser = {
      id: `user_${Date.now()}`,
      email: email || 'owner@acme.com',
      name: account.name,
      role: account.role,
      organizationId: account.orgId,
      organizationName: account.orgName,
    };

    const result: AuthResult = {
      token: `mock_jwt_token_${currentAuthUser.role.replace(/\s+/g, '_')}_${Date.now()}`,
      user: currentAuthUser,
    };
    return result as T;
  }

  if (pathname === '/auth/register' && method === 'POST') {
    const { organizationName, email, role } = body;
    const assignedRole: Role = role === 'Customer' ? 'Customer' : 'Business Owner';
    currentAuthUser = {
      id: `user_${Date.now()}`,
      email: email || (assignedRole === 'Customer' ? 'customer@techcorp.io' : 'owner@newbiz.com'),
      name: organizationName
        ? `${organizationName} User`
        : assignedRole === 'Customer'
        ? 'Customer Client'
        : 'Founder',
      role: assignedRole,
      organizationId: `org_${Date.now()}`,
      organizationName:
        organizationName || (assignedRole === 'Customer' ? 'TechCorp' : 'My Organization'),
    };

    const result: AuthResult = {
      token: `mock_jwt_token_${assignedRole.replace(/\s+/g, '_')}_${Date.now()}`,
      user: currentAuthUser,
    };
    return result as T;
  }

  if (pathname === '/auth/me' && method === 'GET') {
    return { user: currentAuthUser } as T;
  }

  // 2. Plans endpoints
  if (pathname === '/plans' && method === 'GET') {
    return plansState as T;
  }

  if (pathname === '/plans' && method === 'POST') {
    const newPlan: Plan = {
      id: `plan_${Date.now()}`,
      ...body,
    };
    plansState = [...plansState, newPlan];
    auditLogsState = [
      {
        id: `audit_${Date.now()}`,
        who: currentAuthUser.name,
        role: currentAuthUser.role,
        change: `Created new subscription tier: ${newPlan.name}`,
        timestamp: 'Just now',
      },
      ...auditLogsState,
    ];
    return newPlan as T;
  }

  if (pathname.startsWith('/plans/') && method === 'DELETE') {
    const id = pathname.replace('/plans/', '');
    const toDelete = plansState.find((p) => p.id === id);
    plansState = plansState.filter((p) => p.id !== id);
    if (toDelete) {
      auditLogsState = [
        {
          id: `audit_${Date.now()}`,
          who: currentAuthUser.name,
          role: currentAuthUser.role,
          change: `Deleted subscription tier: ${toDelete.name}`,
          timestamp: 'Just now',
        },
        ...auditLogsState,
      ];
    }
    return undefined as T;
  }

  // 3. Subscription endpoints
  if (pathname === '/subscription' && method === 'GET') {
    return subscriptionState as T;
  }

  if (pathname === '/subscription/change' && method === 'POST') {
    const oldPlan = subscriptionState.plan;
    const targetPlanName = body.plan;
    subscriptionState = {
      ...subscriptionState,
      plan: targetPlanName,
      billingCycle: body.billingCycle || subscriptionState.billingCycle,
      status: 'active',
    };

    // 1. Update plans isCurrent flag
    plansState = plansState.map((p) => ({
      ...p,
      isCurrent: p.name === targetPlanName,
    }));

    // 2. Recalculate current invoice recurring fee according to selected plan
    const selectedPlan = plansState.find((p) => p.name === targetPlanName);
    if (selectedPlan) {
      const overage = currentInvoiceState.lineItems
        .filter((li) => li.id !== 'li_1')
        .reduce((sum, li) => sum + li.amount, 0);
      const recurringFee =
        subscriptionState.billingCycle === 'annual'
          ? Math.round(selectedPlan.price * 0.8 * 12)
          : selectedPlan.price;

      currentInvoiceState = {
        ...currentInvoiceState,
        status:
          oldPlan !== targetPlanName && currentInvoiceState.status === 'Paid'
            ? 'Open'
            : currentInvoiceState.status,
        total: recurringFee + overage,
        lineItems: [
          {
            id: 'li_1',
            lineItem: 'Recurring fee',
            sourceUsage: `Plan (${selectedPlan.name})`,
            rate: 'Flat',
            amount: recurringFee,
          },
          ...currentInvoiceState.lineItems.filter((li) => li.id !== 'li_1'),
        ],
      };
    }

    // 3. Add persistent notification to the in-app notification center
    const planNotif: AlertNotification = {
      id: `notif_${Date.now()}`,
      type: 'Renewal',
      message: `Subscription successfully switched to ${targetPlanName} (${subscriptionState.billingCycle} billing)`,
      timestamp: 'Just now',
      unread: true,
    };
    notificationsState = [planNotif, ...notificationsState];

    // 4. Record tamper-evident audit log
    const planAudit: AuditLog = {
      id: `audit_${Date.now()}`,
      who: currentAuthUser?.name || 'Business Owner',
      role: currentAuthUser?.role || 'Business Owner',
      change: `Upgraded subscription from ${oldPlan} to ${targetPlanName}`,
      timestamp: 'Just now',
    };
    auditLogsState = [planAudit, ...auditLogsState];

    return subscriptionState as T;
  }

  if (pathname === '/subscription/cancel' && method === 'POST') {
    subscriptionState = {
      ...subscriptionState,
      status: 'cancelled',
    };
    return subscriptionState as T;
  }

  if (pathname === '/subscription/reactivate' && method === 'POST') {
    subscriptionState = {
      ...subscriptionState,
      status: 'active',
    };
    return subscriptionState as T;
  }

  if (pathname === '/subscription/status' && method === 'PATCH') {
    subscriptionState = {
      ...subscriptionState,
      status: body.status,
    };
    return subscriptionState as T;
  }

  // 4. Usage endpoints
  if (pathname === '/usage/meters' && method === 'GET') {
    return metersState as T;
  }

  if (pathname === '/usage/events' && method === 'GET') {
    const result: Paginated<UsageEvent> = {
      items: eventsState,
      total: eventsState.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    };
    return result as T;
  }

  if (pathname === '/usage/events' && method === 'DELETE') {
    eventsState = [];
    return undefined as T;
  }

  if (pathname === '/usage/simulate' && method === 'POST') {
    const isDuplicate = Boolean(body.duplicate);
    let event: UsageEvent;

    if (isDuplicate) {
      // Pick existing event ID to demonstrate idempotency
      const existingId = eventsState[0]?.id || 'evt_101';
      event = {
        id: existingId,
        customer: 'Acme Corp',
        resource: 'API requests',
        quantity: 500,
        timestamp: 'Just now',
        status: 'Duplicate, ignored',
        statusCategory: 'duplicate',
      };
      eventsState = [event, ...eventsState];
      const res: IngestResult[] = [{ event, metered: false }];
      return res as T;
    } else {
      const newId = `evt_${Math.floor(1000 + Math.random() * 9000)}`;
      event = {
        id: newId,
        customer: 'Acme Corp',
        resource: 'API requests',
        quantity: 1000,
        timestamp: 'Just now',
        status: 'Accepted',
        statusCategory: 'accepted',
      };
      eventsState = [event, ...eventsState];
      // Increment meter
      metersState = metersState.map((m) =>
        m.id === 'api_requests'
          ? {
              ...m,
              used: Math.min(m.limit, m.used + 1000),
              percentage: Math.min(100, Math.round(((m.used + 1000) / m.limit) * 100)),
            }
          : m
      );
      const res: IngestResult[] = [{ event, metered: true }];
      return res as T;
    }
  }

  // 5. Billing endpoints
  if (pathname === '/billing/current' && method === 'GET') {
    return currentInvoiceState as T;
  }

  if (pathname === '/billing/invoices' && method === 'GET') {
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const requestedPage = Number(url.searchParams.get('page') ?? 1) || 1;
    const pageSize = Number(url.searchParams.get('pageSize') ?? 100) || 100;

    const filtered = invoicesState.filter(
      (inv) =>
        search === '' ||
        inv.invoiceNumber.toLowerCase().includes(search) ||
        (inv.customer ?? '').toLowerCase().includes(search)
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const start = (page - 1) * pageSize;

    const result: Paginated<Invoice> = {
      items: filtered.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
    return result as T;
  }

  if (
    pathname.startsWith('/billing/invoices/') &&
    pathname.endsWith('/pay') &&
    method === 'POST'
  ) {
    const id = decodeURIComponent(
      pathname.replace('/billing/invoices/', '').replace('/pay', '')
    );
    const target =
      id === 'inv_current'
        ? currentInvoiceState
        : invoicesState.find((inv) => inv.id === id || inv.invoiceNumber === id);

    if (!target) {
      throw new Error(`Invoice "${id}" was not found`);
    }
    if (target.status === 'Paid') {
      throw new Error(`Invoice ${target.invoiceNumber} is already paid`);
    }

    const paid: Invoice = { ...target, status: 'Paid' };
    if (id === 'inv_current') {
      currentInvoiceState = paid;
    } else {
      invoicesState = invoicesState.map((inv) => (inv.id === paid.id ? paid : inv));
    }
    return paid as T;
  }

  if (pathname.startsWith('/billing/invoices/') && method === 'GET') {
    const id = decodeURIComponent(pathname.replace('/billing/invoices/', ''));
    const invoice =
      id === 'inv_current'
        ? currentInvoiceState
        : invoicesState.find((inv) => inv.id === id || inv.invoiceNumber === id);
    if (!invoice) {
      throw new Error(`Invoice "${id}" was not found`);
    }
    return invoice as T;
  }

  // 5b. Payments endpoints
  if (pathname === '/payments/methods' && method === 'GET') {
    return {
      gateways: [
        { id: 'upi', name: 'UPI / Instant QR' },
        { id: 'card', name: 'Credit / Debit Cards' },
        { id: 'netbanking', name: 'Net Banking' },
        { id: 'wave', name: 'Wave / Digital Wallets' },
      ],
      currency: '₹',
    } as T;
  }

  if (pathname === '/payments/create-order' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return {
      orderId: `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      amount: Number(body.amount) || 1499,
      currency: '₹',
      keyId: 'rzp_live_subscriptiq_mock2026',
    } as T;
  }

  if (pathname === '/payments/verify' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const amount = Number(body.amount) || 1499;
    const methodStr = (body.paymentMethod || 'UPI').toUpperCase();
    const txnId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (body.invoiceId) {
      if (body.invoiceId === 'inv_current') {
        currentInvoiceState = { ...currentInvoiceState, status: 'Paid', paymentMethod: methodStr };
      } else {
        invoicesState = invoicesState.map((inv) =>
          inv.id === body.invoiceId || inv.invoiceNumber === body.invoiceId
            ? { ...inv, status: 'Paid', paymentMethod: methodStr }
            : inv
        );
      }
    }

    if (body.planName) {
      subscriptionState = {
        ...subscriptionState,
        plan: body.planName,
        status: 'active',
        renewalDate: 'Apr 30, 2026',
      };
    }

    // Add notification
    notificationsState.unshift({
      id: `notif_${Date.now()}`,
      type: 'Billing',
      message: `Payment received: ₹${amount.toLocaleString()} received via ${methodStr}`,
      timestamp: 'Just now',
      unread: true,
    });

    return {
      success: true,
      transactionId: txnId,
      orderId: body.orderId || 'order_mock',
      receiptNumber: receiptNum,
      amount,
      currency: '₹',
      paymentMethod: methodStr,
    } as T;
  }

  // 6. Customers endpoints
  if (pathname === '/customers' && method === 'GET') {
    const result: Paginated<Customer> = {
      items: customersState,
      total: customersState.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    };
    return result as T;
  }

  if (pathname === '/customers' && method === 'POST') {
    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      ...body,
    };
    customersState = [newCust, ...customersState];
    auditLogsState = [
      {
        id: `audit_${Date.now()}`,
        who: currentAuthUser.name,
        role: currentAuthUser.role,
        change: `Registered new customer: ${newCust.name}`,
        timestamp: 'Just now',
      },
      ...auditLogsState,
    ];
    return newCust as T;
  }

  if (pathname.includes('/status') && pathname.startsWith('/customers/') && method === 'PATCH') {
    const id = pathname.replace('/customers/', '').replace('/status', '');
    customersState = customersState.map((c) => (c.id === id ? { ...c, status: body.status } : c));
    const updated = customersState.find((c) => c.id === id);
    if (updated) {
      auditLogsState = [
        {
          id: `audit_${Date.now()}`,
          who: currentAuthUser.name,
          role: currentAuthUser.role,
          change: `Updated customer ${updated.name} status to ${body.status}`,
          timestamp: 'Just now',
        },
        ...auditLogsState,
      ];
    }
    return updated as T;
  }

  // 7. Alerts endpoints
  if (pathname === '/alerts/rules' && method === 'GET') {
    return alertRulesState as T;
  }

  if (pathname === '/alerts/rules' && method === 'PUT') {
    alertRulesState = { ...body };
    return alertRulesState as T;
  }

  if (pathname === '/alerts/notifications' && method === 'GET') {
    const result: NotificationPage = {
      items: notificationsState,
      total: notificationsState.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
      unreadCount: notificationsState.filter((n) => n.unread).length,
    };
    return result as T;
  }

  if (pathname === '/alerts/notifications/test' && method === 'POST') {
    const newNotif: AlertNotification = {
      id: `notif_${Date.now()}`,
      type: 'Threshold',
      message: body.message || 'Alert: API usage passed threshold limit (Simulated)',
      timestamp: 'Just now',
      unread: true,
    };
    notificationsState = [newNotif, ...notificationsState];
    return newNotif as T;
  }

  if (pathname === '/alerts/notifications/read' && method === 'POST') {
    notificationsState = notificationsState.map((n) => ({ ...n, unread: false }));
    return { updated: notificationsState.length } as T;
  }

  // 8. Admin endpoints
  if (pathname === '/admin/stats' && method === 'GET') {
    const stats: AdminStats = {
      totalBusinesses: mockAdminStats.totalBusinesses,
      activeSubscriptions: mockAdminStats.activeSubscriptions,
      monthlyRevenue: mockAdminStats.monthlyRevenue,
      eventsProcessed: mockAdminStats.eventsProcessed,
      subscriptionDistribution: [
        { tier: 'Basic', percentage: 38.7, count: 96, color: '#4F46E5' },
        { tier: 'Professional', percentage: 42.3, count: 105, color: '#10B981' },
        { tier: 'Enterprise', percentage: 18.9, count: 47, color: '#F59E0B' },
      ],
    };
    return stats as T;
  }

  if (pathname === '/admin/audit-logs' && method === 'GET') {
    const result: Paginated<AuditLog> = {
      items: auditLogsState,
      total: auditLogsState.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    };
    return result as T;
  }

  // Default empty object
  return {} as T;
}
