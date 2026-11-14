import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth
import { LoginPage } from './pages/LoginPage';

// Role Dashboards (Slides 6, 7 & 9)
import { AdminPage } from './pages/AdminPage'; // Super Admin (Slide 6)
import { BusinessDashboard } from './portals/business/BusinessDashboard'; // Business Owner (Slide 7)
import { CustomerDashboard } from './portals/customer/CustomerDashboard'; // Customer Portal (Slide 9)

// Shared Platform Modules
import { PlansPage } from './pages/PlansPage';
import { UsagePage } from './pages/UsagePage';
import { BillingPage } from './pages/BillingPage';
import { CustomersPage } from './pages/CustomersPage';
import { AlertsPage } from './pages/AlertsPage';

function AppContent() {
  const { isAuthenticated, currentTab, role } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      {/* Dynamic Role-Based Dashboard View */}
      {currentTab === 'dashboard' && (
        <>
          {role === 'Customer' && <CustomerDashboard />}
          {role === 'Super Admin' && <AdminPage />}
          {role === 'Business Owner' && <BusinessDashboard />}
        </>
      )}

      {currentTab === 'admin' && role === 'Super Admin' && <AdminPage />}
      {currentTab === 'plans' && <PlansPage />}
      {currentTab === 'usage' && <UsagePage />}
      {currentTab === 'billing' && <BillingPage />}
      {currentTab === 'customers' && role !== 'Customer' && <CustomersPage />}
      {currentTab === 'notifications' && <AlertsPage />}
    </AppLayout>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
