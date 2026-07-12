'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
  useFeatureReview,
} from '@/lib/hooks/reviewHooks';
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
  const router = useRouter();

  const [modearateStatusFilter, setModearateStatusFilter] = useState('all');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const limit = 10;

  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const { mutate: updateReview } = useApproveReview();
  const { mutate: featureReview } = useFeatureReview();

  const {
    data: reviewsData,
    isLoading,
    isError,
    refetch: refetchReviews,
  } = useAdminReviews({
    page,
    limit,
    isModerated: modearateStatusFilter,
  });

  const reviews = reviewsData?.reviews;

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

            onDelete: (review: IReview) => {
              setReviewToDelete(review._id);
            },

            onTogglePublish: (review: IReview) => {
              const status =
                  review.isModerated === 'approved' ? 'rejected' : 'approved';

              updateReview({
                id: review._id,
                isModerated: status,
              });
            },

            onCheckedChange: (review: IReview) => {
              featureReview(review._id);
            },
          }),
      [featureReview, router, updateReview],
  );

  const confirmDelete = () => {
    if (!reviewToDelete) {
      return;
    }

    deleteReview(reviewToDelete, {
      onSuccess: () => {
        setReviewToDelete(null);
      },
    });
  };

  const handleRefetch = async () => {
    await refetchReviews();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleRowClick = (review: IReview) => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.startsWith('/manager')
        ? '/manager'
        : '/admin';

    router.push(
        `${basePath}/tours/${review.tourId._id}#review-${review._id}`,
    );
  };

  return (
      <div className="min-h-screen space-y-8 bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex w-full min-w-0 flex-col items-start gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="shrink-0 text-3xl font-bold tracking-tight text-[#1E2B6D]">
            Отзывы
          </h1>

          <div className="w-full min-w-0 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Tabs
                value={modearateStatusFilter}
                onValueChange={(value) => {
                  setModearateStatusFilter(value);
                  setPage(1);
                }}
                className="w-max min-w-max xl:ml-auto"
            >
              <TabsList
                  variant="default"
                  className="inline-flex h-auto w-max min-w-max flex-nowrap gap-1.5 rounded-xl border border-gray-200/60 bg-gray-100 p-1"
              >
                <TabsTrigger
                    value="all"
                    className="shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Все отзывы
                </TabsTrigger>

                <TabsTrigger
                    value="pending"
                    className="shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Новые отзывы
                </TabsTrigger>

                <TabsTrigger
                    value="approved"
                    className="shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Одобренные отзывы
                </TabsTrigger>

                <TabsTrigger
                    value="rejected"
                    className="shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  Отклоненные отзывы
                </TabsTrigger>

                <TabsTrigger
                    value="featured"
                    className="shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:text-[#1E2B6D] data-[state=active]:bg-white data-[state=active]:text-[#1E2B6D] data-[state=active]:shadow-sm"
                >
                  На главной
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
            onRowClick={handleRowClick}
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
            Boolean(reviewsData.totalReviews) &&
            Boolean(reviewsData.totalPage) && (
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
            open={Boolean(reviewToDelete)}
            title="Вы уверены, что хотите удалить отзыв?"
            description="Это действие нельзя отменить"
            loading={isDeleting}
            confirmText="Удалить"
            onCancel={() => setReviewToDelete(null)}
            onConfirm={confirmDelete}
        />
      </div>
  );
}