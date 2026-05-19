'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TourSetType } from '@/types/tourSets';
import { useDeleteTourSet, useTourSets } from '@/lib/hooks/tourSets';

interface Props {
  tourId: string;
  baseToursPath: string;
  userRole?: string;
}

export default function TourSetsTable({
  tourId,
  baseToursPath,
  userRole,
}: Props) {
  const [page, setPage] = useState(1);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<TourSetType | null>(null);

  const { data, isLoading, isError, refetch } = useTourSets(page, 5, tourId);
  const { mutate: deleteTourSet, isPending: isDeleting } = useDeleteTourSet();

  const confirmDelete = () => {
    if (setToDelete) {
      deleteTourSet(setToDelete, {
        onSuccess: () => setSetToDelete(null),
      });
    }
  };

  const totalPages = data?.meta.totalPages || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
            Открыт
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
            Мест нет
          </span>
        );
      case 'FINISHED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">
            Завершен
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-500">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#1E2B6D]">Потоки тура</h3>
        <Button
          asChild
          size="sm"
          className="bg-[`#1E2B6D`] hover:bg-[`#162356`] rounded-xl h-9 text-xs font-semibold shadow-sm"
        >
          <Link href={`${baseToursPath}/${tourId}/groups/new`}>
            <Plus className="w-4 h-4 mr-1.5" /> Добавить поток
          </Link>
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#1E2B6D]" />
            <span>Загрузка потоков...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-[#1E2B6D] font-bold text-sm">
              Не удалось загрузить потоки
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-gray-200 text-[#1E2B6D]"
            >
              Повторить попытку
            </Button>
          </div>
        ) : !data?.tourSets || data.tourSets.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 font-medium">
            Для этого тура ещё не создано ни одного потока.
          </div>
        ) : (
          <>
            <div className="w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="p-4 font-medium">Старт потока</th>
                    <th className="p-4 font-medium">Конец потока</th>
                    <th className="p-4 font-medium">Отель</th>
                    <th className="p-4 font-medium">Стоимость</th>
                    <th className="p-4 font-medium text-center">Статус</th>
                    <th className="p-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.tourSets.map((set: TourSetType) => (
                    <tr
                      key={set._id}
                      className="transition-colors hover:bg-[#07224D]/5 border-b border-gray-100"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>
                            {format(new Date(set.startDate), 'dd.MM.yyyy')}
                          </span>
                          {set.isHot && (
                            <Badge className="bg-red-500 hover:bg-red-500 text-[9px] text-white font-bold px-1 py-0 rounded">
                              HOT
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {format(new Date(set.endDate), 'dd.MM.yyyy')}
                      </td>
                      <td className="p-4 text-gray-500 max-w-[160px] truncate">
                        {set.hotelName}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {set.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="text-emerald-600 font-bold">
                              {set.discountPrice} KGS
                            </span>
                            <span className="text-[11px] text-gray-400 line-through font-normal">
                              {set.price} KGS
                            </span>
                          </div>
                        ) : (
                          <span>{set.price} KGS</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(set.status)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Просмотр"
                            onClick={() => setSelectedSet(set)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                          >
                            <Link
                              href={`${baseToursPath}/${tourId}/groups/${set._id}/edit`}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" /> Правка
                            </Link>
                          </Button>
                          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSetToDelete(set._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 bg-white border-t flex items-center justify-between">
                <div className="text-xs text-gray-500 font-medium">
                  Страница <span className="text-[#1E2B6D]">{page}</span> из{' '}
                  <span className="text-[#1E2B6D]">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-8 border-gray-200 text-xs"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-8 border-gray-200 text-xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selectedSet} onOpenChange={() => setSelectedSet(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1E2B6D]">
              Детальная информация о потоке
            </DialogTitle>
          </DialogHeader>
          {selectedSet && (
            <div className="space-y-3 pt-2 text-sm text-gray-700">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Период потока:</span>
                <span className="font-medium">
                  {format(new Date(selectedSet.startDate), 'dd MMMM yyyy', {
                    locale: ru,
                  })}{' '}
                  —{' '}
                  {format(new Date(selectedSet.endDate), 'dd MMMM yyyy', {
                    locale: ru,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Отель и локация:</span>
                <span className="font-medium">
                  {selectedSet.hotelName} ({selectedSet.hotelLocation})
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Авиакомпания:</span>
                <span className="font-medium">
                  {selectedSet.airline || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Детали рейса:</span>
                <span className="font-medium">
                  {selectedSet.flightDetails || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Свободные места:</span>
                <span className="font-medium">
                  {selectedSet.totalSeats - (selectedSet.bookedSeats || 0)} из{' '}
                  {selectedSet.totalSeats}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Базовая стоимость:</span>
                <span className="font-bold text-[#1E2B6D]">
                  {selectedSet.price} KGS
                </span>
              </div>
              {selectedSet.discountPrice && (
                <div className="flex justify-between border-b pb-1.5 text-emerald-600">
                  <span className="font-semibold">Цена по акции:</span>
                  <span className="font-bold">
                    {selectedSet.discountPrice} KGS
                  </span>
                </div>
              )}
              {selectedSet.saleDeadline && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block uppercase tracking-wider text-[10px]">
                      Дедлайн акции:
                    </span>
                    {format(new Date(selectedSet.saleDeadline), 'PP в HH:mm', {
                      locale: ru,
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!setToDelete} onOpenChange={() => setSetToDelete(null)}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Вы уверены, что хотите удалить этот поток?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSetToDelete(null)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
