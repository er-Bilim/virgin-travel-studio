'use client';

import {useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {Loader2, Plus} from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/lib/hooks/categoryHooks';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {
  headerRowClassName,
  inputClass,
  rowClassName,
  tableClassName,
} from '@/lib/constants';
import {
  getCategoryColumns
} from '@/components/dashboard/shared/data-table/columns/createColumnInTable/category-column';
import {DataTable} from '@/components/dashboard/shared/data-table/data-table';
import {
  ConfirmDialog
} from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import {PaginationCustom} from "@/components/pagination/PaginationCustom";

interface CategoryFormInput {
  title: string;
}

export default function CategoriesManagePage() {
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const {
    data: categoriesData,
    isLoading,
    isError,
    refetch: categoryRefetch
  } = useCategories({
    page,
    limit
  });
  const categories = categoriesData?.categories;
  const meta = categoriesData?.meta;
  const {mutate: createCategory, isPending: isCreating} = useCreateCategory();
  const {mutate: deleteCategory, isPending: isDeleting} = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<CategoryFormInput>({
    defaultValues: {
      title: '',
    },
  });

  const columns = useMemo(
    () =>
      getCategoryColumns({
        onDelete: (category) => setCategoryToDelete(category._id),
      }),
    [],
  );

  const onCreateSubmit = (data: CategoryFormInput) => {
    createCategory(
      {title: data.title.trim()},
      {
        onSuccess: () => {
          reset();
          toast.success('Категория успешно создана');
        },
        onError: (error) => {
          const serverError =
            error.response?.data?.error || 'Не удалось создать категорию';
          toast.error(serverError);
        },
      },
    );
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete, {
        onSuccess: () => {
          setCategoryToDelete(null);
          toast.success('Категория успешно удалена');
        },
        onError: (error) => {
          setCategoryToDelete(null);

          const serverError =
            error.response?.data?.error || 'Произошла ошибка при удалении';
          toast.error(serverError, {duration: 5000});
        },
      });
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo(0, 0);
  }

  const handleRefetch = async () => {
    await categoryRefetch();
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
          Управление категориями
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Создание и удаление категорий для туров
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onCreateSubmit)}
        className="flex flex-col md:flex-row gap-4 items-start p-6 bg-white border border-gray-100 rounded-3xl shadow-sm"
        autoComplete="off"
      >
        <div className="w-full md:max-w-md space-y-1">
          <Input
            {...register('title', {
              required: 'Введите название категории',
              validate: (value) =>
                value.trim().length > 0 || 'Введите название категории',
            })}
            placeholder="Например: Экскурсионные туры"
            className={`${inputClass} ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isCreating}
          />
          {errors.title && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.title.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isCreating}
          className="bg-[#1E2B6D] hover:bg-[#162356] h-12 px-6 rounded-2xl font-semibold shrink-0 w-full md:w-auto"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Добавить категорию
        </Button>
      </form>

      <DataTable
        data={categories || []}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        headerRowClassName={headerRowClassName}
        rowClassName={rowClassName}
        className={tableClassName}
      />

      {isError && (
        <div className="my-10 text-center">
          <p className="mb-4 text-lg font-semibold text-red-500">
            Не удалось загрузить категории
          </p>
          <button
            type="button"
            className="rounded-2xl border px-5 py-3 font-semibold"
            onClick={handleRefetch}
          >
            Повторить
          </button>
        </div>
      )}

      {meta && categories && categories.length > 0 && (
        <div className="my-8">
          <PaginationCustom
            page={page}
            limit={meta.limit}
            totalPage={meta.totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!categoryToDelete}
        title="Вы уверенны что хотите удалить категорию тура?"
        description="Категорию тура нельзя удалить пока есть тур с такой категорией. Сначала удалите тур!"
        loading={isDeleting}
        confirmText="Удалить"
        onCancelAction={() => setCategoryToDelete(null)}
        onConfirmAction={confirmDelete}
      />
    </div>
  );
}
