import ClientAvatar from '@/components/shared/ClientAvatar';
import Rating from '@/components/shared/Rating';
import { formatDateToWords, getYearFullNumber } from '@/lib/utils';
import type { IReview } from '@/types/review';
import ReviewPhoto from './ReviewPhoto';

interface Props {
  review: IReview;
}

const Review = ({ review }: Props) => {
  return (
    <div className="border-1 border-[var(--border)] p-5 rounded-2xl bg-gray-50">
      <div className="flex flex-row items-center gap-3 justify-between">
        <div className="flex flex-row items-center gap-3 ">
          <ClientAvatar name={review.clientName} />
          <div>
            <p>{review.clientName}</p>
            <p className="text-gray-500 text-sm flex gap-1">
              <span>{formatDateToWords(review.createdDate)}</span>
              <span>{getYearFullNumber(review.createdDate)}</span>
            </p>
          </div>
        </div>
        <Rating value={review.rating} starSize={4} />
      </div>

      <p className="mt-5 text-[var(--primary)]">{review.comment}</p>
      {review.image && (
        <div className="mt-5">
          <ReviewPhoto
            src={review.image}
            authorName={review.clientName}
            rating={review.rating}
          />
        </div>
      )}
    </div>
  );
};

export default Review;
