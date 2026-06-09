'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {Plus, Search} from 'lucide-react';
import {
  useCountries,
  useDeleteTour,
  useTogglePublish,
  useTours
} from '@/lib/hooks/tourHooks';
import {useCategories} from '@/lib/hooks/categoryHooks';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  headerRowClassName,
  rowClassName,
  tableClassName
} from '@/lib/constants';
import {useUser} from '@/lib/hooks/authHooks';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {
  ConfirmDialog
} from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import {DataTable} from '@/components/dashboard/shared/data-table/data-table';
import {
  getToursColumns
} from '@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-colum';
import type {TourType} from '@/types/tour';
import {toast} from 'sonner';

export default function ToursManagePage() {
  const router = useRouter();
  const user = useUser().data;
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('all');
  const [publishStatus, setPublishStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tourToDelete, setTourToDelete] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const countryCode = searchParams.get('countryCode') ?? null;
  const path = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories

  const { data, isLoading, isError, refetch } = useTours(
    {
      page,
      limit: 10,
      categoryId: categoryId === 'all' ? undefined : categoryId,
      search: debouncedSearch || undefined,
      isPublished: publishStatus === 'all' ? undefined : publishStatus,
      countryCode: countryCode === 'all' ? undefined : countryCode,
    }
  );

  const {data: countries} = useCountries();

  const onChangeCountryCode = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (val === 'all') {
      params.delete('countryCode');
    } else {
      params.set('countryCode', val);
    }

    setPage(1);
    router.push(`${path}?${params.toString()}`);
  };

  const { mutate: deleteTour, isPending: isDeleting } = useDeleteTour();
  const { mutate: togglePublish } = useTogglePublish();

  const isAdmin = user?.role === 'ADMIN';

  const columns = useMemo(
    () =>
      getToursColumns({
        onDelete: (tour: TourType) => setTourToDelete(tour._id),
        onView: (tour: TourType) => router.push(`${path}/${tour._id}`),
        onEdit: (tour: TourType) => router.push(`${path}/edit/${tour._id}`),
        onTogglePublish: (tour: TourType) =>
          togglePublish({
            id: tour._id,
            isPublished: !tour.isPublished,
          }),
        visible: isAdmin,
      }),
    [router, isAdmin, path, togglePublish],
  );

  const confirmDelete = () => {
    if (tourToDelete) {
      deleteTour(tourToDelete, {
        onSuccess: () => setTourToDelete(null),
        onError: (error) => {
          setTourToDelete(null);

          const serverError =
            error.response?.data?.error || 'Произошла ошибка при удалении тура';
          toast.error(serverError, { duration: 5000 });
        },
      });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
            Туры
          </h1>
          <Link href={`${path}/new`}>
            <Button className="bg-[#1E2B6D] hover:bg-[#162356]">
              <Plus className="w-4 h-4 mr-2" /> Добавить тур
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="pl-9 bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors focus-visible:border-primary h-8"
            />
          </div>

          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full lg:w-48 bg-white border-gray-300">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent position="popper">
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
            <SelectTrigger className="w-full lg:w-48 bg-white border-gray-300">
              <SelectValue placeholder="Статус публикации" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="true">Опубликованные</SelectItem>
              <SelectItem value="false">Черновики</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={countryCode ?? 'all'}
            onValueChange={onChangeCountryCode}
          >
            <SelectTrigger className="w-full lg:w-48 bg-white border-gray-300">
              <SelectValue placeholder="Все страны" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">Все страны</SelectItem>
              {countries?.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            limit: 10,
            totalPages: data?.meta.totalPages || 0,
            onPageChange: setPage,
          }}
          headerRowClassName={headerRowClassName}
          rowClassName={rowClassName}
          className={tableClassName}
          onRowClick={(tour) => router.push(`${path}/${tour._id}`)}
        />
      )}
    </div>
  );
}
