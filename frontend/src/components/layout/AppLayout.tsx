import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { InvoiceModal } from '../billing/InvoiceModal';
import { useApp } from '../../context/AppContext';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { selectedInvoiceForModal, setSelectedInvoiceForModal } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden overflow-y-auto">
        {children}
      </main>

      {/* Global Invoice Preview Modal */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          invoice={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
};
