'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Globe, GlobeLock } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useToggleCategoryPublish,
  useDeleteCategory,
} from '@/lib/hooks/categoryHooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { inputClass } from '@/lib/constants';

interface CategoryFormInput {
  title: string;
}

export default function CategoriesManagePage() {
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data: categories, isLoading, isError, refetch } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: togglePublish, isPending: isPublishing } =
    useToggleCategoryPublish();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    defaultValues: {
      title: '',
    },
  });

  const onCreateSubmit = (data: CategoryFormInput) => {
    createCategory(data, {
      onSuccess: () => {
        reset();
        toast.success('Категория успешно создана');
      },
      onError: (error: any) => {
        const serverError =
          error.response?.data?.error || 'Не удалось создать категорию';
        toast.error(serverError);
      },
    });
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete, {
        onSuccess: () => {
          setCategoryToDelete(null);
          toast.success('Категория успешно удалена');
        },
        onError: (error: any) => {
          setCategoryToDelete(null);
          const serverError =
            error.response?.data?.error || 'Произошла ошибка при удалении';
          toast.error(serverError, { duration: 5000 });
        },
      });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
          Управление категориями
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Создание, публикация и удаление категорий для туров.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onCreateSubmit)}
        className="flex flex-col md:flex-row gap-4 items-start p-6 bg-white border border-gray-100 rounded-3xl shadow-sm"
        autoComplete="off"
      >
        <div className="w-full md:max-w-md space-y-1">
          <Input
            {...register('title', { required: 'Введите название категории' })}
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

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E2B6D]" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-[#1E2B6D] font-bold">
              Не удалось загрузить список категорий
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="p-4 font-medium">Название категории</th>
                  <th className="p-4 font-medium text-center">
                    Статус публикации
                  </th>
                  <th className="p-4 font-medium text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <tr
                      key={category._id}
                      className="transition-colors hover:bg-[#07224D]/5 border-b border-gray-100"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{category.title}</span>
                          {!category.isPublished && (
                            <span className="text-[10px] text-[#C8D2DC] font-bold uppercase tracking-wider">
                              Скрыта
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPublishing}
                          onClick={() => togglePublish(category._id)}
                          className={`w-[185px] transition-all duration-200 h-9 rounded-xl font-semibold ${
                            category.isPublished
                              ? 'bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                              : 'bg-[#1E2B6D] text-white hover:bg-[#162356] hover:text-white shadow-md'
                          }`}
                        >
                          {category.isPublished ? (
                            <GlobeLock className="w-4 h-4 mr-2" />
                          ) : (
                            <Globe className="w-4 h-4 mr-2" />
                          )}
                          {category.isPublished
                            ? 'Снять с публикации'
                            : 'Опубликовать'}
                        </Button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCategoryToDelete(category._id)}
                            className="rounded-xl"
                            title="Удалить категорию"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">
                      Список категорий пуст. Создайте первую категорию выше.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>
              Вы уверены, что хотите удалить эту категорию?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Удаление невозможно, если к категории привязан хотя бы один
            существующий тур.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Удаление...
                </span>
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
