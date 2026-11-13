import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { InvoiceModal } from '../billing/InvoiceModal';
import { useApp } from '../../context/AppContext';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { selectedInvoiceForModal, setSelectedInvoiceForModal } = useApp();

  return (
    <div className="app-shell h-screen max-h-screen overflow-hidden bg-slate-50 flex text-slate-800 font-sans antialiased w-full max-w-full">
      <Sidebar />
      <main className="flex-1 h-screen max-h-screen overflow-y-auto overflow-x-hidden min-w-0 w-full flex flex-col">
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
