'use client';
import { useParams } from 'next/navigation';
import { useOneManager } from '@/lib/hooks/managerHook';
import { Spinner } from '@/components/ui/spinner';
import { UpdateManagerForm } from '@/components/dashboard/managers/UpdateManagerForm';
import OrderTable from '@/components/dashboard/orders/OrderTable';

export default function Manager() {
  const { id } = useParams();
  const { data: manager, isLoading, error } = useOneManager(id as string);

  if (!manager) {
    return <h1>Менеджер не найден</h1>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Страница просмотра менеджера</h1>
      <UpdateManagerForm initialValues={manager} />
      <div className="my-3"></div>
      <OrderTable />
    </section>
  );
}
