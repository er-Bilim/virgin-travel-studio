'use client';

import Sidebar from '@/components/dashboard/layout/Sidebar';
import MobileSidebar from '@/components/dashboard/layout/MobileSidebar';
import MobileTopbar from '@/components/dashboard/layout/MobileTopbar';
import ProtectedLayout from '@/middleware/ProtectedLayout';
import { type ReactNode, useState} from "react";

type Props = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <ProtectedLayout roles={['ADMIN', 'MANAGER']}>
            <div className="min-h-screen bg-[#F7F8F4]">
                <div className="flex min-h-screen">
                    <Sidebar />

                    <MobileSidebar
                        open={isMobileSidebarOpen}
                        onClose={() => setIsMobileSidebarOpen(false)}
                    />

                    <div className="flex min-h-screen flex-1 flex-col">
                        <MobileTopbar
                            onMenuClick={() => setIsMobileSidebarOpen(true)}
                        />

                        <main className="flex-1 p-4 md:p-6 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
};

export default DashboardLayout;