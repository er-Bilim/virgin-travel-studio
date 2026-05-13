"use client";

import {useDeleteManager, useManagers} from "@/lib/hooks/managerHook";
import {useRouter} from "next/navigation";
import {CreateManagerForm} from "@/components/dashboard/managers/CreateManagerForm ";
import {DataTable} from "@/components/dashboard/shared/data-table/data-table";
import {getManagersColumns} from "@/components/dashboard/shared/data-table/columns/managers-columns";



export default function ManagersPage() {
    const router = useRouter();
    const { data = [], isLoading } = useManagers();
    const { mutate: deleteManager } = useDeleteManager();

    const columns = getManagersColumns({
        onView: (user) => router.push(`/admin/managers/${user._id}`),

        onDelete: (user) => {
            deleteManager(user._id);
        },
    });

    if (isLoading) {
        return <div className="p-6">Loading managers...</div>;
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Managers</h1>

            <CreateManagerForm/>

            <DataTable columns={columns} data={data} />
        </div>
    );
}