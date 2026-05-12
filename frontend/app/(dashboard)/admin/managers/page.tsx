"use client";

import {useDeleteManager, useManagers} from "@/lib/hooks";
import {useRouter} from "next/navigation";
import {CreateManagerForm} from "@/components/dashboard/managers/CreateManagerForm ";


export default function ManagersPage() {
    const router = useRouter();
    const { data, isLoading } = useManagers();
    const { mutate: deleteManager } = useDeleteManager();

    if (isLoading) {
        return <div className="p-6">Loading managers...</div>;
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Managers</h1>

            <CreateManagerForm/>

            <table className="w-full border">
                <thead>
                <tr className="text-left border-b">
                    <th className="p-2">Full Name</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Actions</th>
                </tr>
                </thead>

                <tbody>
                {data?.map((m) => (
                    <tr key={m._id} className="border-b">
                        <td className="p-2">{m.fullName}</td>
                        <td className="p-2">{m.phone}</td>
                        <td className="p-2">
                            {new Date(m.createdAt).toLocaleDateString()}
                        </td>

                        <td className="p-2 flex gap-2">
                            <button
                                className="text-blue-500"
                                onClick={() =>
                                    router.push(`/admin/managers/${m._id}`)
                                }
                            >
                                View
                            </button>

                            <button
                                className="text-red-500"
                                onClick={() => {
                                    if (confirm("Delete this manager?")) {
                                        deleteManager(m._id);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}