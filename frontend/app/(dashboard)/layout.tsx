'use client';

import Sidebar from '@/components/dashboard/layout/Sidebar';
import MobileSidebar from '@/components/dashboard/layout/MobileSidebar';
import MobileTopbar from '@/components/dashboard/layout/MobileTopbar';
import ProtectedLayout from '@/middleware/ProtectedLayout';
import { type ReactNode, useState } from 'react';

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <ProtectedLayout roles={['ADMIN', 'MANAGER']}>
      <div className="min-h-screen bg-slate-100">

        <Sidebar />

        <MobileSidebar
          open={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex flex-col min-w-0 lg:pl-72">
          <MobileTopbar
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default DashboardLayout;