import { useState } from "react";
import {useUser} from "@/lib/hooks";
import {itemsMenu} from "@/lib/constants";
import {useRouter} from "next/navigation";

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { data: user } = useUser();
    const router = useRouter();

    const role = user?.role;
    return (
        <aside
            className={`hidden md:flex flex-col border-r bg-white transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
        >

            <div className="flex items-center justify-between p-4">
                {!collapsed && <div className="font-bold">Virgin Travel</div>}
                <button onClick={() => setCollapsed(!collapsed)}>
                    ☰
                </button>
            </div>

            <nav className="flex flex-col gap-2 p-2">
                {itemsMenu
                    .filter(item => role && item.roles.includes(role))
                    .map((item) => (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
                        >
                            <span>{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
            </nav>
        </aside>
    );
}   