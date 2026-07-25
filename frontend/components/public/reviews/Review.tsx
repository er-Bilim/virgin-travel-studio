import ClientAvatar from '@/components/shared/ClientAvatar';
import Rating from '@/components/shared/Rating';
import { formatDayAndMonthWords } from '@/lib/utils';
import type { IReview } from '@/types/review';
import ReviewPhoto from './ReviewPhoto';

interface Props {
  review: IReview;
}

const Review = ({ review }: Props) => {
  const { day, month, year } = formatDayAndMonthWords(review.createdAt);

  return (
    <div className="border border-slate-100 p-3 min-[340px]:p-4 sm:p-5 rounded-2xl bg-gray-50/60 w-full transition shadow-sm hover:shadow-md/5">
      <div className="flex flex-col gap-2.5 min-[350px]:flex-row min-[350px]:items-start min-[350px]:justify-between border-b border-slate-100/70 pb-3">
        <div className="flex items-center gap-3 text-left">
          <ClientAvatar name={review.clientName}/>
          <div>
            <p className="font-bold text-sm sm:text-base text-slate-800 leading-tight">{review.clientName}</p>
            <p className="text-gray-400 text-[11px] sm:text-xs flex gap-1 mt-0.5">
              <span>{day}</span>
              <span>{month}</span>
              <span>{year}</span>
            </p>
          </div>
        </div>
        <div className="shrink-0 transition-transform origin-left scale-90 min-[350px]:scale-100 min-[350px]:mt-0.5">
          <Rating value={review.rating} starSize={4} />
        </div>
      </div>

      <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed text-left font-medium">
        {review.comment}
      </p>

      {review.image && (
        <div className="mt-4 flex justify-start">
          <ReviewPhoto
            src={review.image}
            authorName={review.clientName}
            rating={review.rating}
          />
        </div>
      )}

      {review.companyReply && (
        <div className="mt-4 rounded-xl border border-[#DCE4FF] bg-[#F4F7FF] p-3 min-[340px]:p-3.5 text-left shadow-sm">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#1E2B6D]">
            Ответ Virgin Travel
          </p>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
            {review.companyReply}
          </p>
        </div>
      )}
    </div>
  );
};

export default Review;