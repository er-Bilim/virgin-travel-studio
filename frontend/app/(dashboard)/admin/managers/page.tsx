'use client';

import { useDeleteManager, useManagers } from '@/lib/hooks/managerHook';
import { useRouter } from 'next/navigation';
import { CreateManagerForm } from '@/components/dashboard/managers/CreateManagerForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ManagersPage() {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const router = useRouter();
  const { data, isLoading } = useManagers();
  const { mutate: deleteManager, isPending: isDeleting } = useDeleteManager();

  if (isLoading) {
    return <div className="p-6">Loading managers...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Managers</h1>

      <CreateManagerForm />

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
                <Button
                  className="text-blue-500 bg-blue-100 hover:text-blue-900 cursor-pointer hover:bg-blue-200"
                  onClick={() => router.push(`/admin/managers/${m._id}`)}
                >
                  View
                </Button>

                <AlertDialog
                  open={openDialogId === m._id}
                  onOpenChange={(open) => setOpenDialogId(open ? m._id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="cursor-pointer">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить менеджера?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Отмена
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting && openDialogId === m._id}
                        onClick={() => deleteManager(m._id, {
                            onSuccess: () => setOpenDialogId(null)
                        })}
                        className="bg-red-500 cursor-pointer hover:bg-red-700"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
