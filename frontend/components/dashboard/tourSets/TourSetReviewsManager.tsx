'use client';

import { useState } from 'react';
import { Edit, MessageSquareReply, Plus, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import CreateReviewForm from '@/components/public/reviews/form/CreateReviewForm';
import { useModalStore } from '@/lib/stores/modalStore';
import { imageUrl } from '@/lib/constants';
import type { IReview } from '@/types/review';
import {
    useAdminReviews,
    useDeleteReview,
    useUpdateReview,
} from '@/lib/hooks/reviewHooks';

type Props = {
    tourId: string;
};

const ADD_REVIEW_MODAL_ID = 'add-tour-review-modal';
const EDIT_REVIEW_MODAL_ID = 'edit-tour-review-modal';
const REPLY_MODAL_ID = 'reply-tour-review-modal';

const TourSetReviewsManager = ({ tourId }: Props) => {
    const { openModal, closeModal } = useModalStore();

    const [reviewToEdit, setReviewToEdit] = useState<IReview | null>(null);
    const [reviewToDelete, setReviewToDelete] = useState<IReview | null>(null);
    const [replyReview, setReplyReview] = useState<IReview | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data: reviews = [], isLoading, isError } = useAdminReviews(tourId);
    const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
    const { mutate: updateReview, isPending: updatingReply } = useUpdateReview();

    const handleEdit = (review: IReview) => {
        setReviewToEdit(review);
        openModal(EDIT_REVIEW_MODAL_ID);
    };

    const handleReply = (review: IReview) => {
        setReplyReview(review);
        setReplyText(review.companyReply || '');
        openModal(REPLY_MODAL_ID);
    };

    const handleDelete = () => {
        if (!reviewToDelete) return;

        deleteReview(reviewToDelete._id, {
            onSuccess: () => {
                setReviewToDelete(null);
            },
        });
    };

    const handleSaveReply = () => {
        if (!replyReview) return;

        updateReview(
            {
                id: replyReview._id,
                data: {
                    companyReply: replyText,
                },
            },
            {
                onSuccess: () => {
                    closeModal();
                    setReplyReview(null);
                    setReplyText('');
                },
            },
        );
    };

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-[#1E2B6D]">
                        Отзывы тура
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Управление отзывами для выбранного тура
                    </p>
                </div>

                <Button
                    type="button"
                    className="bg-[#1E2B6D] hover:bg-[#162356]"
                    onClick={() => openModal(ADD_REVIEW_MODAL_ID)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить отзыв
                </Button>
            </div>

            {isLoading && (
                <p className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                    Загрузка отзывов...
                </p>
            )}

            {isError && (
                <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
                    Не удалось загрузить отзывы.
                </p>
            )}

            {!isLoading && !isError && reviews.length === 0 && (
                <p className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                    Для этого тура пока нет отзывов.
                </p>
            )}

            {!isLoading && !isError && reviews.length > 0 && (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <article
                            key={review._id}
                            className="rounded-2xl border border-gray-100 p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {review.clientName}
                                    </h3>

                                    <div className="mt-1 flex items-center gap-1 text-amber-500">
                                        {Array.from({ length: review.rating }).map((_, index) => (
                                            <Star
                                                key={index}
                                                className="h-4 w-4 fill-amber-500"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleReply(review)}
                                    >
                                        <MessageSquareReply className="mr-1 h-4 w-4" />
                                        {review.companyReply ? 'Редактировать ответ' : 'Ответить от Virgin Travel'}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(review)}
                                    >
                                        <Edit className="mr-1 h-4 w-4" />
                                        Редактировать отзыв
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setReviewToDelete(review)}
                                    >
                                        <Trash2 className="mr-1 h-4 w-4" />
                                        Удалить
                                    </Button>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-gray-600">
                                {review.comment}
                            </p>

                            {review.companyReply && (
                                <div className="mt-4 rounded-2xl border border-[#DCE4FF] bg-[#F4F7FF] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#1E2B6D]">
                                                Ответ Virgin Travel
                                            </p>

                                            <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                                {review.companyReply}
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() =>
                                                updateReview({
                                                    id: review._id,
                                                    data: {
                                                        companyReply: '',
                                                    },
                                                })
                                            }
                                        >
                                            Удалить ответ
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {review.image && (
                                <img
                                    src={imageUrl + review.image}
                                    alt={`Фото отзыва ${review.clientName}`}
                                    className="mt-4 h-32 w-32 rounded-2xl object-cover"
                                />
                            )}
                        </article>
                    ))}
                </div>
            )}

            <Modal id={ADD_REVIEW_MODAL_ID} title="Добавить отзыв">
                <CreateReviewForm tourId={tourId} onSuccess={closeModal} />
            </Modal>

            <Modal id={EDIT_REVIEW_MODAL_ID} title="Редактировать отзыв">
                {reviewToEdit && (
                    <CreateReviewForm
                        tourId={tourId}
                        reviewId={reviewToEdit._id}
                        isEditing
                        initialData={{
                            clientName: reviewToEdit.clientName,
                            rating: reviewToEdit.rating,
                            comment: reviewToEdit.comment,
                        }}
                        onSuccess={() => {
                            closeModal();
                            setReviewToEdit(null);
                        }}
                    />
                )}
            </Modal>

            <Modal id={REPLY_MODAL_ID} title="Ответить от имени Virgin Travel">
                <div className="space-y-4">
          <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Введите ответ компании..."
              className="min-h-35 w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-[#1E2B6D]"
          />

                    <Button
                        className="w-full bg-[#1E2B6D] hover:bg-[#162356]"
                        disabled={updatingReply}
                        onClick={handleSaveReply}
                    >
                        Сохранить ответ
                    </Button>
                </div>
            </Modal>

            <ConfirmDialog
                open={!!reviewToDelete}
                title="Удалить отзыв?"
                description="Это действие нельзя отменить."
                confirmText="Удалить"
                loading={isDeleting}
                onCancel={() => setReviewToDelete(null)}
                onConfirm={handleDelete}
            />
        </section>
    );
};

export default TourSetReviewsManager;