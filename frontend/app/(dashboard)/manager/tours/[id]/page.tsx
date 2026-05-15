'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useTourById,
  useDeleteTour,
  useTogglePublish,
} from '@/lib/hooks/tourHooks';
import { useUser } from '@/lib/hooks/authHooks';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Globe, GlobeLock, ArrowLeft } from 'lucide-react';
import { imageUrl } from '@/lib/constants';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TourDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useUser().data;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: tour, isLoading } = useTourById(id as string);
  const { mutate: deleteTour, isPending: isDeleting } = useDeleteTour();
  const { mutate: togglePublish, isPending: isPublishing } = useTogglePublish();

  const confirmDelete = () => {
    deleteTour(id as string, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push('/manager/tours');
      },
    });
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Загрузка данных...</div>
    );
  if (!tour)
    return <div className="p-8 text-center text-red-500">Тур не найден</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[11px] font-bold uppercase tracking-widest text-[#64748B] hover:text-[#1E2B6D] transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к списку
          </button>
          <span className="text-[11px] font-mono text-[#64748B]">
            UUID: {tour._id}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D] leading-none">
                {tour.title}
              </h1>
              {!tour.isPublished && (
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider border border-gray-300 px-2 py-0.5 rounded">
                  Черновик
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
              <span>
                Категория:{' '}
                <span className="text-[#1E2B6D]">
                  {(tour.category as any)?.title || '—'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              disabled={isPublishing}
              onClick={() =>
                togglePublish({ id: tour._id, isPublished: !tour.isPublished })
              }
              className={`w-[185px] h-10 rounded-xl font-semibold text-sm transition-all ${
                tour.isPublished
                  ? 'bg-white border-2 border-gray-100 text-gray-500 hover:bg-gray-50'
                  : 'bg-[#1E2B6D] text-white hover:bg-[#162356] shadow-sm'
              }`}
            >
              {tour.isPublished ? (
                <GlobeLock className="w-4 h-4 mr-2" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              {tour.isPublished ? 'Снять с публикации' : 'Опубликовать'}
            </Button>

            <Link href={`/manager/tours/edit/${tour._id}`}>
              <Button
                variant="outline"
                className="h-10 rounded-xl border-gray-200 text-[#1E2B6D] font-semibold"
              >
                <Edit className="w-4 h-4 mr-2" /> Правка
              </Button>
            </Link>

            {user?.role === 'ADMIN' && (
              <Button
                variant="destructive"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h3 className="text-[16px] font-bold tracking-tight text-[#1E2B6D] leading-none">
                Описание тура
              </h3>
              <p className="text-[#1E2B6D] text-[16px] leading-relaxed whitespace-pre-wrap">
                {tour.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-[16px] font-bold tracking-tight text-[#1E2B6D] leading-none">
                Базовые преимущества тура
              </h3>
              <div className="flex flex-wrap gap-2">
                {tour.baseAdvantages?.map((adv, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-[#1E2B6D]"
                  >
                    {adv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
              Изображения
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {tour.images?.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={imageUrl + img}
                  className="w-full h-20 object-cover rounded-lg border"
                  alt=""
                />
              ))}
            </div>
            {tour.images && tour.images.length > 4 && (
              <p className="text-[10px] text-center text-gray-400 font-medium">
                + еще {tour.images.length - 4} фото
              </p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>Вы уверены, что хотите удалить этот тур?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
