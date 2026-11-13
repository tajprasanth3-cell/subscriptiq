import { useEffect, useRef, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { InvoiceModal } from '../billing/InvoiceModal';
import { useApp } from '../../context/AppContext';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { selectedInvoiceForModal, setSelectedInvoiceForModal, currentTab } = useApp();
  const mainRef = useRef<HTMLElement>(null);

  // When switching pages/tabs, always open scrolled to the very top
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentTab]);

  return (
    <div className="app-shell h-screen max-h-screen overflow-hidden bg-slate-50 flex text-slate-800 font-sans antialiased w-full max-w-full">
      <Sidebar />
      <main
        ref={mainRef}
        className="flex-1 h-screen max-h-screen overflow-y-auto overflow-x-hidden min-w-0 w-full flex flex-col"
      >
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
