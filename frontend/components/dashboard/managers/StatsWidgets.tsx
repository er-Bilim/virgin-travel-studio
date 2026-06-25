'use client';

import {useOrderStats} from '@/lib/hooks/orderHooks';
import {formatToReadablePrice} from '@/lib/utils';
import {
  CheckCircle,
  CircleDollarSign,
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';
import {Spinner} from '@/components/ui/spinner';
import {useUser} from '@/lib/hooks/authHooks';


export const StatsWidgets = () => {
  const { data, isLoading, isError } = useOrderStats();
  const { data: user } = useUser();

  if (isLoading) {
    return (
        <Spinner />
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">Не удалось загрузить статистику</p>
    );
  }

  const widgets = [
    user?.role === 'MANAGER'
      ? {
          key: 'contract_pending',
          label: 'Ожидают контракта',
          icon: FileText,
          colorClass: 'bg-purple-100 text-purple-700',
          iconBg: 'bg-purple-200',
          value: data.byStatus.CONTRACT_PENDING,
        }
      : {
          key: 'new',
          label: 'Новые заявки',
          icon: Clock,
          colorClass: 'bg-blue-100 text-blue-700',
          iconBg: 'bg-blue-200',
          value: data.byStatus.NEW,
        },
    {
      key: 'in_progress',
      label: 'В работе',
      icon: TrendingUp,
      colorClass: 'bg-yellow-100 text-yellow-700',
      iconBg: 'bg-yellow-200',
      value: data.byStatus.IN_PROGRESS,
    },
    {
      key: 'completed_today',
      label: 'Выполнено сегодня',
      icon: CheckCircle,
      colorClass: 'bg-green-100 text-green-700',
      iconBg: 'bg-green-200',
      value: data.completedToday,
    },
    {
      key: 'revenue',
      label: 'Выручка за месяц',
      icon: CircleDollarSign,
      colorClass: 'bg-purple-100 text-purple-700',
      iconBg: 'bg-purple-200',
      value: formatToReadablePrice(data.monthRevenue).price,
    },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-5">
      {widgets.map(({ key, label, icon: Icon, colorClass, iconBg, value }) => (
        <div
          key={key}
          className={`rounded-2xl border p-5 flex flex-col gap-3 ${colorClass}`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-0.5">
              {value}{key === 'revenue' && ' сом'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};