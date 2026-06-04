'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {Plus} from 'lucide-react';
import {
  useTours,
  useDeleteTour,
  useTogglePublish,
} from '@/lib/hooks/tourHooks';
import { useCategories } from '@/lib/hooks/categoryHooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {headerRowClassName, rowClassName, tableClassName} from '@/lib/constants';
import { useUser } from '@/lib/hooks/authHooks';
import {usePathname, useRouter} from 'next/navigation';
import {ConfirmDialog} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import {DataTable} from "@/components/dashboard/shared/data-table/data-table";
import {getToursColumns} from "@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-colum";
import type {TourType} from "@/types/tour";

export default function ToursManagePage() {
  const router = useRouter();
  const user = useUser().data;
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('all');
  const [publishStatus, setPublishStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tourToDelete, setTourToDelete] = useState<string | null>(null);

  const path = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories } = useCategories();

  const { data, isLoading, isError, refetch } = useTours(
      page,
      10,
      categoryId === 'all' ? undefined : categoryId,
      debouncedSearch || undefined,
      publishStatus === 'all' ? undefined : publishStatus,
  );

  const { mutate: deleteTour, isPending: isDeleting } = useDeleteTour();
  const { mutate: togglePublish } = useTogglePublish();

  const isAdmin = user?.role === 'ADMIN';

  const columns = useMemo(() => getToursColumns({
    onDelete: (tour: TourType) => setTourToDelete(tour._id),
    onView: (tour: TourType) => router.push(`${path}/${tour._id}`),
    onEdit: (tour: TourType) => router.push(`${path}/edit/${tour._id}`),
    onTogglePublish: (tour: TourType) => togglePublish({
      id: tour._id,
      isPublished: !tour.isPublished,
    }),
    visible: isAdmin,
  }), [router,isAdmin, path, togglePublish]);

  const confirmDelete = () => {
    if (tourToDelete) {
      deleteTour(tourToDelete, {
        onSuccess: () => setTourToDelete(null),
      });
    }
  };

  return (
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
            Туры
          </h1>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию"
                className="w-60 bg-white"
            />

            <Select
                value={categoryId}
                onValueChange={(val) => {
                  setCategoryId(val);
                  setPage(1);
                }}
            >
              <SelectTrigger className="w-50 bg-white">
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

            <Select
                value={publishStatus}
                onValueChange={(val) => {
                  setPublishStatus(val);
                  setPage(1);
                }}
            >
              <SelectTrigger className="w-50 bg-white">
                <SelectValue placeholder="Статус публикации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="true">Опубликованные</SelectItem>
                <SelectItem value="false">Черновики</SelectItem>
              </SelectContent>
            </Select>

            <Link href={`${path}/new`}>
              <Button className="bg-[#1E2B6D] hover:bg-[#162356]">
                <Plus className="w-4 h-4 mr-2" /> Добавить тур
              </Button>
            </Link>
          </div>
        </div>

        <ConfirmDialog
            open={!!tourToDelete}
            title="Вы уверенны что хотите удалить тур?"
            description="Это действие нельзя отменить"
            loading={isDeleting}
            confirmText="Удалить"
            onCancel={() => setTourToDelete(null)}
            onConfirm={confirmDelete}
        />

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
              <DataTable
                  data={data?.tours || []}
                  isError={isError}
                  columns={columns}
                  isLoading={isLoading}
                  pagination={{
                    page,
                    pageSize: 10,
                    total: data?.meta.total || 0,
                    onPageChange: setPage
                  }}
                  headerRowClassName={headerRowClassName}
                  rowClassName={rowClassName}
                  className={tableClassName}
                  onRowClick={(tour) => router.push(`${path}/${tour._id}`)}
              />
          )}
        </div>
      </div>
  );
}