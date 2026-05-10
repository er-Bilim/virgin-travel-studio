import Sidebar from "@/components/dashboard/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
