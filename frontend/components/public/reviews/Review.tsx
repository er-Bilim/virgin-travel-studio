import ClientAvatar from '@/components/shared/ClientAvatar';
import Rating from '@/components/shared/Rating';
import {formatDayAndMonthWords, getYearFullNumber} from '@/lib/utils';
import type {IReview} from '@/types/review';
import ReviewPhoto from './ReviewPhoto';

interface Props {
  review: IReview;
}

const Review = ({ review }: Props) => {

  const { day, month } = formatDayAndMonthWords(review.createdDate);

  return (
    <div className="border-1 border-[var(--border)] p-5 rounded-2xl bg-gray-50">
      <div className="flex flex-row items-center gap-3 justify-between">
        <div className="flex flex-row items-center gap-3 ">
          <ClientAvatar name={review.clientName} />
          <div>
            <p>{review.clientName}</p>
            <p className="text-gray-500 text-sm flex gap-1">
              <span>{day}</span>
              <span>{month}</span>
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

      {review.companyReply && (
        <div className="items-end mt-3 sm:mt-4 rounded-xl sm:rounded-2xl border border-[#DCE4FF] bg-[#F4F7FF] p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div>
              <p className="text-[10px] sm:text-[14px] font-bold uppercase tracking-wide text-[#1E2B6D]">
                Ответ Virgin Travel
              </p>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-gray-700">
                {review.companyReply}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
