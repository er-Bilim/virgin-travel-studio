'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2, Loader, Globe, Lock } from 'lucide-react';
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
import {
  headerRowClassName,
  rowClassName,
  tableClassName,
} from '@/lib/constants';
import { useUser } from '@/lib/hooks/authHooks';
import { usePathname, useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import { getToursColumns } from '@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-colum';
import type { TourType } from '@/types/tour';
import { Badge } from '@/components/ui/badge';
import { TourImageCell } from '@/components/dashboard/shared/data-table/columnComponent/TourImageCell';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';

export default function ToursManagePage() {
  const router = useRouter();
  const user = useUser().data;
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('all');
  const [publishStatus, setPublishStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tourToDelete, setTourToDelete] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(1200);

  const path = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 700;

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

  const columns = useMemo(() => {
    const allColumns = getToursColumns({
      onDelete: (tour: TourType) => setTourToDelete(tour._id),
      onView: (tour: TourType) => router.push(`${path}/${tour._id}`),
      onEdit: (tour: TourType) => router.push(`${path}/edit/${tour._id}`),
      onTogglePublish: (tour: TourType) =>
        togglePublish({
          id: tour._id,
          isPublished: !tour.isPublished,
        }),
      visible: isAdmin,
    });

    if (windowWidth >= 700 && windowWidth < 1200) {
      return allColumns.filter((col) => {
        const target = col as { id?: string; accessorKey?: string };
        return target.id !== 'image' && target.accessorKey !== 'category';
      });
    }

    return allColumns;
  }, [router, isAdmin, path, togglePublish, windowWidth]);

  const confirmDelete = () => {
    if (tourToDelete) {
      deleteTour(tourToDelete, {
        onSuccess: () => setTourToDelete(null),
      });
    }
  };

  const totalPages = Math.ceil((data?.meta.total || 0) / 10);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1E2B6D]">
          Туры
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию"
            className="w-full sm:w-60 bg-white"
          />

          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white">
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
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Статус публикации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="true">Опубликованные</SelectItem>
              <SelectItem value="false">Черновики</SelectItem>
            </SelectContent>
          </Select>

          <Link href={`${path}/new`} className="w-full sm:w-auto">
            <Button className="w-full bg-[#1E2B6D] hover:bg-[#162356]">
              <Plus className="w-4 h-4 mr-2" /> Добавить тур
            </Button>
          </Link>
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

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Загрузка туров...
            </div>
          ) : isError ? (
            <div className="p-12 text-center space-y-4">
              <p className="text-[#1E2B6D] font-bold">
                Не удалось загрузить список туров
              </p>
              <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                Проверьте интернет-соединение или попробуйте перезагрузить
                данные вручную.
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
                onPageChange: setPage,
              }}
              headerRowClassName={headerRowClassName}
              rowClassName={rowClassName}
              className={tableClassName}
              onRowClick={(tour) => router.push(`${path}/${tour._id}`)}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!tourToDelete}
        title="Вы уверены, что хотите удалить тур?"
        description="Это действие нельзя отменить"
        loading={isDeleting}
        confirmText="Удалить"
        onCancel={() => setTourToDelete(null)}
        onConfirm={confirmDelete}
      />

      {!mounted ? (
        <div className="bg-white border rounded-xl p-12 text-center flex items-center justify-center shadow-sm">
          <Loader className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500 shadow-sm">
              <Loader className="animate-spin w-5 h-5 mx-auto" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-sm text-red-500 bg-white rounded-2xl border">
              Ошибка при загрузке туров
            </div>
          ) : !data?.tours.length ? (
            <div className="text-center py-12 bg-white rounded-2xl border text-gray-400 text-sm">
              Туры не найдены
            </div>
          ) : (
            data.tours.map((tour: TourType) => (
              <div
                key={tour._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center border border-gray-100 p-1 [&_*]:text-[9px] [&_*]:tracking-tighter [&_*]:leading-none [&_*]:text-center [&_*]:whitespace-normal [&_*]:break-all">
                    <TourImageCell tour={tour} iconOnly />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#1E2B6D] truncate max-w-[140px]">
                        {tour.category?.title || 'Без категории'}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          tour.isPublished
                            ? 'bg-[#1E2B6D] text-white border-[#1E2B6D] text-[10px] px-1.5 py-0.5 whitespace-nowrap'
                            : 'bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-1.5 py-0.5 whitespace-nowrap'
                        }
                      >
                        {tour.isPublished ? 'Опубликован' : 'Черновик'}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug break-words line-clamp-2">
                      {tour.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2.5 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-gray-500 rounded-xl hover:bg-gray-50"
                    onClick={() => router.push(`${path}/${tour._id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-gray-500 rounded-xl hover:bg-gray-50"
                    onClick={() =>
                      togglePublish({
                        id: tour._id,
                        isPublished: !tour.isPublished,
                      })
                    }
                  >
                    {tour.isPublished ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-gray-500 rounded-xl hover:bg-gray-50"
                    onClick={() => router.push(`${path}/edit/${tour._id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      onClick={() => setTourToDelete(tour._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="p-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-center">
              <PaginationCustom
                page={page}
                limit={10}
                totalPage={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <DataTable
            data={data?.tours || []}
            isError={isError}
            columns={columns}
            isLoading={isLoading}
            pagination={{
              page,
              pageSize: 10,
              total: data?.meta.total || 0,
              onPageChange: setPage,
            }}
            headerRowClassName={headerRowClassName}
            rowClassName={rowClassName}
            className={tableClassName}
          />
        </div>
      )}
    </div>
  );
}
