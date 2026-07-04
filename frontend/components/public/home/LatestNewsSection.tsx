'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IoIosJournal } from 'react-icons/io';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import SectionHeaderSkeleton from '@/components/shared/skeletons/SectionHeaderSkeleton';
import LatestNews from '../news/LatestNews';

const LatestNewsSection = () => {
  const { data: settings, isPending: isSettingsLoading } =
    useHomepageSettings();

  const renderSectionHeader = () => {
    if (isSettingsLoading) {
      return <SectionHeaderSkeleton />;
    }

    return (
      <div>
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
          <IoIosJournal className="size-[18px]" />
          Журнал путешествий
        </p>
        <h2 className="text-3xl font-black tracking-tight text-navy-800">
          {settings?.mainLatestNews?.title || 'Последние новости'}
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-[15px]">
          {settings?.mainLatestNews?.subtitle ||
            'Свежие обновления, полезные заметки и вдохновение для будущих путешествий'}
        </p>
      </div>
    );
  };

  return (
    <section className="my-24">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {renderSectionHeader()}

        <Link
          href="/news"
          className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-navy-700 transition hover:border-cyan-600 hover:text-cyan-600"
        >
          Все новости
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <LatestNews />
    </section>
  );
};

export default LatestNewsSection;
