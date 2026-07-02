'use client';

import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { IoIosQuote } from 'react-icons/io';
import ReviewsCarousel from '@/components/public/reviews/ReviewsCarousel';
import SectionHeaderSkeleton from '@/components/shared/skeletons/SectionHeaderSkeleton';

const ReviewsSection = () => {
  const {
    data: settings,
    isPending: isSettingsLoading,
  } = useHomepageSettings();

  const renderSectionHeader = () => {
    if (isSettingsLoading) {
      return <SectionHeaderSkeleton />;
    }

    return (
      <>
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
            <IoIosQuote className="size-[18px]" />
            Отзывы
          </p>
          <h2
            id="reviews-title"
            className="text-3xl font-black tracking-tight text-navy-800"
          >
            {settings?.reviewsPage?.title || 'Что говорят путешественники'}
          </h2>
          <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
            {settings?.reviewsPage?.subtitle ||
              'Реальные впечатления тех, кто уже съездил с нами'}
          </p>
        </div>
      </>
    );
  };

  return (
    <section
      aria-labelledby="reviews-title"
      className="mx-auto max-w-full py-14"
    >
      <div className="mb-9 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        {renderSectionHeader()}
      </div>

      <ReviewsCarousel />
    </section>
  );
};

export default ReviewsSection;
