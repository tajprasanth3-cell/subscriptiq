import { useEffect } from 'react';
import {
  LayoutGrid,
  Layers,
  Activity,
  Receipt,
  Users,
  Bell,
  ShieldCheck,
  Building2,
  ChevronRight,
  X,
  Gauge,
  History,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';
import type { NavTabId } from '../../context/AppContext';

export const Sidebar = () => {
  const {
    currentTab,
    setCurrentTab,
    organizationName,
    role,
    toggleRole,
    unreadCount,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  // Lock background scrolling and allow Escape to close the mobile drawer.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  // Role-specific navigation items matching Slides 6, 7 & 9 in PDF
  const getNavItems = () => {
    if (role === 'Super Admin') {
      return [
        { id: 'admin' as NavTabId, label: 'Admin Dashboard', icon: ShieldCheck },
        { id: 'customers' as NavTabId, label: 'Organizations', icon: Users },
        { id: 'plans' as NavTabId, label: 'Subscription Plans', icon: Layers },
        { id: 'usage' as NavTabId, label: 'Usage Monitoring', icon: Activity },
        { id: 'billing' as NavTabId, label: 'Billing & Invoices', icon: Receipt },
        {
          id: 'notifications' as NavTabId,
          label: 'Notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ];
    }

    if (role === 'Customer') {
      return [
        { id: 'dashboard' as NavTabId, label: 'Overview', icon: LayoutGrid },
        { id: 'plans' as NavTabId, label: 'My Plan', icon: Layers },
        { id: 'usage' as NavTabId, label: 'Usage Details', icon: Gauge },
        { id: 'billing' as NavTabId, label: 'Billing History', icon: History },
        {
          id: 'notifications' as NavTabId,
          label: 'Notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ];
    }

    // Default: Business Owner (Acme Corp)
    return [
      { id: 'dashboard' as NavTabId, label: 'Dashboard', icon: LayoutGrid },
      { id: 'customers' as NavTabId, label: 'Customers', icon: Users },
      { id: 'plans' as NavTabId, label: 'My Subscription', icon: Layers },
      { id: 'usage' as NavTabId, label: 'Usage & Metering', icon: Activity },
      { id: 'notifications' as NavTabId, label: 'Usage Limits & Alerts', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
      { id: 'billing' as NavTabId, label: 'Billing & Invoices', icon: Receipt },
    ];
  };

  const navItems = getNavItems();

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full min-h-full justify-between select-none bg-white">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-slate-100">
          <div
            onClick={() => {
              setCurrentTab(role === 'Super Admin' ? 'admin' : 'dashboard');
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 18h16" />
                <path d="M7 14V6" />
                <path d="M12 14v-4" />
                <path d="M17 14v-2" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900 tracking-tight block">SubscriptIQ</span>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block -mt-1">
                {role}
              </span>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (isMobile) setIsMobileMenuOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left',
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={clsx(
                      'w-5 h-5 shrink-0 transition-colors',
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tenant / Organization Footer Card */}
      <div className="p-4 border-t border-slate-100 shrink-0 mt-auto bg-white">
        <div
          onClick={toggleRole}
          className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer group"
          title="Click to toggle between roles"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 group-hover:text-indigo-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-slate-900 leading-tight truncate">
                  {organizationName || 'TechCorp'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium truncate">Role: {role}</p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/90 flex-col shrink-0 h-screen max-h-screen sticky top-0 z-20 overflow-hidden">
        {renderContent(false)}
      </aside>

      {/* 2. Mobile & Tablet Slide-over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-dvh max-h-dvh flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200 overflow-hidden">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
