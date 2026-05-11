"use client";

import { useState } from "react";

import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import {MobileTopbar} from "@/components/dashboard/layout/MobileTopbar";
import {MobileSidebar} from "@/components/dashboard/layout/MobileSidebar";
import ProtectedLayout from "@/middleware/ProtectedLayout";

export default function DashboardLayout({children}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <ProtectedLayout roles={["ADMIN", "MANAGER"]}>
            <div className="flex min-h-screen">
                <Sidebar />

                <div className="flex-1">
                    <MobileTopbar onMenuClick={() => setOpen(true)} />

                    <main className="p-6">{children}</main>
                </div>

                <MobileSidebar open={open} onClose={() => setOpen(false)} />
            </div>
        </ProtectedLayout>
    );
}