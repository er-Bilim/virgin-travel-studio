'use client';

import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { imageUrl, isDev } from '@/lib/constants';
import Image from 'next/image';
import { CircleCheck } from 'lucide-react';
import SectionHeaderSkeleton from '@/components/shared/skeletons/SectionHeaderSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import AdvantagesSkeleton from '@/components/shared/skeletons/AdvantagesSkeleton';
import { useCallback } from 'react';

export default function Advantages() {
  const {
    data: settings,
    isPending: isSettingsLoading,
    isError,
    refetch: refetchSettings,
  } = useHomepageSettings();
  const advantages = settings ? settings.advantages || [] : [];

  const handleRefetch = useCallback(() => {
    refetchSettings();
  }, [refetchSettings]);

  const renderSectionHeader = () => {
    if (isSettingsLoading) {
      return <SectionHeaderSkeleton />;
    }

    return (
      <>
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
            <CircleCheck className="size-[18px]" />
            Почему мы
          </p>
          <h2 className="text-3xl font-black tracking-tight text-navy-800">
            Наши преимущества
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-[15px]">
            Всё, что делает поездку с нами спокойной и предсказуемой
          </p>
        </div>
      </>
    );
  };

  return (
    <section className="my-24 ">
      <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {renderSectionHeader()}
      </div>

      {isSettingsLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdvantagesSkeleton key={index} />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={handleRefetch} />}

      {!isError && advantages.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((adv) => (
            <article
              className="group rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:shadow-softlg hover:-translate-y-1"
              key={adv._id}
            >
              <div className="mb-5 size-14 overflow-hidden rounded-2xl relative">
                <Image
                src={`${imageUrl}api/news/image/${adv.image}`}
                  alt={adv.title || 'Advantage image'}
                  fill
                  unoptimized={isDev}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-lg font-extrabold text-navy-800 leading-snug">
                {adv.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-navy-700/60">
                {adv.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
