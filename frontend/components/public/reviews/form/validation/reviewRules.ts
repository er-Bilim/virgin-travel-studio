import type { IReviewMutation } from "@/types/review";
import type { RegisterOptions } from "react-hook-form";

export const ratingRule = {
  required: 'Поставьте оценку, чтобы отправить отзыв',
  min: { value: 1, message: 'Поставьте оценку, чтобы отправить отзыв' },
  max: { value: 5, message: 'Максимальная оценка 5' }
} satisfies RegisterOptions<IReviewMutation, 'rating'>

export const commentRule = {
  required: 'Напишите текст отзыва',
  minLength: { value: 1, message: 'Минимум 1 символ' },
  maxLength: { value: 255, message: 'Максимум 255 символов' },
} satisfies RegisterOptions<IReviewMutation, 'comment'>