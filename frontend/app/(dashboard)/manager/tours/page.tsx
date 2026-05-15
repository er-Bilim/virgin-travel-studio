'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  Globe,
  GlobeLock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useTours,
  useDeleteTour,
  useTogglePublish,
} from '@/lib/hooks/tourHooks';
import { useCategories } from '@/lib/hooks/categoryHooks';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { imageUrl } from '@/lib/constants';
import { useUser } from '@/lib/hooks/authHooks';

export default function ToursPage() {
  const user = useUser().data;
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('all');
  const [tourToDelete, setTourToDelete] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data, isLoading, isError, refetch } = useTours(
    page,
    10,
    categoryId === 'all' ? undefined : categoryId,
  );
  const { mutate: deleteTour, isPending: isDeleting } = useDeleteTour();
  const { mutate: togglePublish, isPending: isPublishing } = useTogglePublish();

  const confirmDelete = () => {
    if (tourToDelete) {
      deleteTour(tourToDelete, {
        onSuccess: () => setTourToDelete(null),
      });
    }
  };

  const totalPages = data?.meta.totalPages || 1;

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
          Туры
        </h1>
        <div className="flex items-center gap-4">
          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/manager/tours/new">
            <Button className="bg-[#1E2B6D] hover:bg-[#162356]">
              <Plus className="w-4 h-4 mr-2" /> Добавить тур
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Загрузка туров...</div>
        ) : isError ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-[#1E2B6D] font-bold">
              Не удалось загрузить список туров
            </p>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              Проверьте интернет-соединение или попробуйте перезагрузить данные
              вручную.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2 border-gray-200 text-[#1E2B6D]"
            >
              Повторить попытку
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="p-4 font-medium">Фото</th>
                    <th className="p-4 font-medium">Название</th>
                    <th className="p-4 font-medium">Категория</th>
                    <th className="p-4 font-medium text-center">Статус</th>
                    <th className="p-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.tours.map((tour) => (
                    <tr
                      key={tour._id}
                      className="transition-colors hover:bg-[#07224D]/5 border-b border-gray-100"
                    >
                      <td className="p-4">
                        {tour.images?.[0] ? (
                          <img
                            src={imageUrl + tour.images[0]}
                            className="w-12 h-12 rounded-lg object-cover border"
                            alt=""
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200" />
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{tour.title}</span>
                          {!tour.isPublished && (
                            <span className="text-[10px] text-[#C8D2DC] font-bold uppercase tracking-wider">
                              Черновик
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {(tour.category as any)?.title || '—'}
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPublishing}
                          onClick={() =>
                            togglePublish({
                              id: tour._id,
                              isPublished: !tour.isPublished,
                            })
                          }
                          className={`w-[185px] transition-all duration-200 h-9 rounded-xl font-semibold ${
                            tour.isPublished
                              ? 'bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                              : 'bg-[#1E2B6D] text-white hover:bg-[#162356] hover:text-white shadow-md'
                          }`}
                        >
                          {tour.isPublished ? (
                            <GlobeLock className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                          {tour.isPublished
                            ? 'Снять с публикации'
                            : 'Опубликовать'}
                        </Button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/manager/tours/${tour._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Просмотр"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/manager/tours/edit/${tour._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" /> Правка
                            </Button>
                          </Link>
                          {user?.role === 'ADMIN' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setTourToDelete(tour._id)}
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

            <div className="px-4 py-3 bg-white border-t flex items-center justify-between">
              <div className="text-sm text-gray-500 font-medium">
                Страница <span className="text-[#1E2B6D]">{page}</span> из{' '}
                <span className="text-[#1E2B6D]">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9 border-gray-200"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9 border-gray-200"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Вперед <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={!!tourToDelete} onOpenChange={() => setTourToDelete(null)}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>Вы уверены, что хотите удалить этот тур?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTourToDelete(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
