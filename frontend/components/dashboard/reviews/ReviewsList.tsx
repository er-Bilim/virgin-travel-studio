'use client';

import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
} from '@/lib/hooks/reviewHooks';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IReview } from '@/types/review';
import { getReviewColumns } from '@/components/dashboard/shared/data-table/columns/createColumnInTable/review-colum';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import {
  headerRowClassName,
  rowClassName,
  tableClassName,
} from '@/lib/constants';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReviewsList() {
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const { mutate: updateReview } = useApproveReview();
  const [modearateStatusFilter, setModearateStatusFilter] = useState('all');
  const router = useRouter();
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [enabled, setEnabled] = useState<boolean>(false)
  
  const {
    data: reviewsData,
    isLoading,
    isError,
    refetch: refetchReviews,
  } = useAdminReviews({ page, limit, isModerated: modearateStatusFilter });
  const reviews = reviewsData?.reviews;

  useEffect(() => {
    const changePage = () => {
      setPage(1);
    };

    void changePage();
  }, []);

  const columns = useMemo(
    () =>
      getReviewColumns({
        onView: (review: IReview) => {
          const currentPath = window.location.pathname;
          const basePath = currentPath.startsWith('/manager')
            ? '/manager'
            : '/admin';

          router.push(
            `${basePath}/tours/${review.tourId._id}#review-${review._id}`,
          );
        },
        onDelete: (review: IReview) => setReviewToDelete(review._id),
        onTogglePublish: (review: IReview) => {
          const status =
            review.isModerated === 'approved' ? 'rejected' : 'approved';
          updateReview({ id: review._id, isModerated: status });
        },
        onCheckedChange(value) {
          
        },
      }),
    [updateReview],
  );

  const confirmDelete = () => {
    if (reviewToDelete) {
      deleteReview(reviewToDelete, {
        onSuccess: () => setReviewToDelete(null),
      });
    }
  };

  const handleRefetch = async () => {
    await refetchReviews();
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="p-8 space-y-8 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
              Отзывы
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <Tabs
              value={modearateStatusFilter}
              onValueChange={(value) => {
                setModearateStatusFilter(value);
                setPage(1);
              }}
              className="w-full sm:w-auto"
            >
              <TabsList
                variant="default"
                className="bg-gray-100 p-1 rounded-xl inline-flex gap-1.5 border border-gray-200/60"
              >
                <TabsTrigger
                  value="all"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-500 hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Все отзывы
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-500 hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Новые отзывы
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-500 hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Одобренные отзывы
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-500 hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Отклоненные отзывы
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DataTable
          data={reviews || []}
          columns={columns}
          isError={isError}
          isLoading={isLoading}
          headerRowClassName={headerRowClassName}
          rowClassName={rowClassName}
          className={tableClassName}
          onRowClick={(review) => {
            const currentPath = window.location.pathname;
            const basePath = currentPath.startsWith('/manager')
              ? '/manager'
              : '/admin';
            router.push(
              `${basePath}/tours/${review.tourId._id}#review-${review._id}`,
            );
          }}
        />

        {isError && (
          <div className="my-10 text-center">
            <p className="mb-4 text-lg font-semibold text-red-500">
              Не удалось загрузить отзывы
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

        {reviewsData &&
          reviewsData.reviews.length > 0 &&
          reviewsData.totalReviews &&
          reviewsData.totalPage && (
            <div className="my-8">
              <PaginationCustom
                page={page}
                limit={limit}
                totalPage={reviewsData.totalPage}
                onChange={handlePageChange}
              />
            </div>
          )}

        <ConfirmDialog
          open={!!reviewToDelete}
          title="Вы уверенны что хотите удалить отзыв?"
          description="Это действие нельзя отменить"
          loading={isDeleting}
          confirmText="Удалить"
          onCancel={() => setReviewToDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}
