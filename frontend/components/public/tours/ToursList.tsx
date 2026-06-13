'use client';

import { useState } from 'react';

import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import {useGetTourCategories, useTours} from '@/lib/hooks/tourHooks';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import Filter from '@/components/shared/Filter';
import { pluralize } from '@/lib/utils';
import {
  ArrowBigDown,
  ArrowBigUp,
  CalendarPlus2,
  House,
  RefreshCw,
  Star,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import Sort from '@/components/shared/Sort';
import {toursLimitPag} from "@/lib/constants";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import countriesLib from 'i18n-iso-countries';
import ru from 'i18n-iso-countries/langs/ru.json';
import CountryCombobox from "../../shared/CountryCombobox";

countriesLib.registerLocale(ru);

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новые сверху', icon: CalendarPlus2 },
  { value: 'price-asc', label: 'Сначала дешевле', icon: ArrowBigUp },
  { value: 'price-desc', label: 'Сначала дороже', icon: ArrowBigDown },
  { value: 'rating', label: 'По рейтингу', icon: Star },
];

const ToursList = () => {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null | undefined>(null);
  const [sort, setSort] = useState<string | null | undefined>(null);

    const searchParams = useSearchParams();
    const countryCode = searchParams.get('countryCode') ?? null;
    const path = usePathname();
    const router = useRouter();

  const {
    data: toursData,
    isError: isToursError,
    refetch: refetchTours,
  } = useTours({
    page,
    limit: toursLimitPag,
    isPublished: true,
    categoryId,
    sort,
      countryCode: countryCode === 'all' ? undefined : countryCode,
  });

  const { data: categories } = useGetTourCategories();

  const meta = toursData?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleRefetch = () => {
    refetchTours();
  };

  const renderErrorCard = () => {
    return (
      <section className="mx-auto max-w-[640px] px-4 py-16 text-center">
        <div className="mb-5 inline-flex size-18 items-center justify-center rounded-full bg-cyan-50 text-cyan-900">
          <WifiOff className="size-8" aria-hidden="true" />
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          Не удалось загрузить
        </h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Что-то пошло не так – возможно проблемы с подключением. Попробуйте ещё
          раз, обычно это помогает
        </p>

        <div className="flex justify-center gap-2.5 flex-wrap mb-4">
          <button
            type="button"
            onClick={handleRefetch}
            className="inline-flex rounded-xl border-1 items-center px-4 py-3 cursor-pointer border-[var(--primary)] bg-[var(--primary)] text-cyan-50 hover:bg-indigo-900 hover:text-indigo-50 duration-400"
          >
            <RefreshCw className="size-4 mr-1.5" aria-hidden="true" />
            Повторить
          </button>
          <Link
            href="/"
            className="inline-flex rounded-xl border-1 items-center px-4 py-3 cursor-pointer border-[var(--primary)] bg-cyan-50 text-cyan-900 hover:bg-cyan-100 hover:text-cyan-900 duration-400"
          >
            <House className="size-4 mr-1.5" aria-hidden="true" />
            На главную
          </Link>
        </div>
      </section>
    );
  };

  if (isToursError) {
    return <>{renderErrorCard()}</>;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          {
            label: 'Главная',
            href: '/',
          },
          {
            label: 'Туры',
            href: '/tours',
          },
        ]}
        className="mt-10"
      />

      <header className="mb-7 max-w-[720px] flex flex-col gap-3">
        <p className="uppercase text-base font-semibold text-cyan-800">
          Авторские маршруты
        </p>

        <h1 className="text-4xl font-semibold">Путешествия</h1>

        <p className="text-slate-500">
          Каждый тур – частный проект нашей команды, без шаблонов и групп по 50
          человек
        </p>
      </header>

      <div className="flex justify-between gap-4 mb-10 flex-wrap items-center">
        {categories && (
          <Filter
            tags={categories}
            labelKey="title"
            setId={setCategoryId}
            title="категории"
            mainTag="все направления"
            href="tours"
            searchParamsName="categories"
          />
        )}
          <div className="flex gap-2">
              <Sort options={SORT_OPTIONS} setSort={setSort} />
              <CountryCombobox
                  value={countryCode}
                  onChange={(val) => {
                      const params = new URLSearchParams(searchParams.toString());

                      if (!val) {
                          params.delete('countryCode');
                      } else {
                          params.set('countryCode', val);
                      }

                      setPage(1);
                      router.push(`${path}?${params.toString()}`);
                  }}
              />
          </div>
      </div>

        {!isToursError && toursData && toursData.tours.length === 0 && (
            <>
                <Breadcrumbs
                    items={[
                        { label: 'Главная', href: '/' },
                        { label: 'Туры', href: '/tours' },
                    ]}
                    className="mt-10"
                />

                <section className="mx-auto max-w-[720px] px-4 py-20 text-center">
                    <h2 className="mb-3 text-2xl font-semibold text-foreground">
                        Такого тура пока нет
                    </h2>

                    <p className="mb-8 text-sm text-muted-foreground">
                        Но вы можете создать его под себя — мы соберём маршрут под ваши пожелания.
                    </p>

                    <Link
                        href="/tours/custom"
                        className="inline-flex rounded-xl border-1 items-center px-5 py-3
          border-[var(--primary)] bg-[var(--primary)] text-cyan-50
          hover:bg-indigo-900 duration-300"
                    >
                        Создать кастомный тур
                    </Link>
                </section>
            </>
        )}
      {toursData && meta && (
        <div className="mb-5 text-sm text-muted-foreground flex flex-row gap-1">
          <span className="capitalize">найдено</span>
          <p className="font-semibold inline-flex gap-1 text-[var(--primary)]">
            <span>{meta.total}</span>
            <span>
              {pluralize(meta.total, 'тур', 'тура', 'туров')}
            </span>
          </p>
        </div>
      )}

      <section aria-labelledby="tours-list-title">
        <h2 id="tours-list-title" className="sr-only">
          Список туров
        </h2>

        <ul
          role="list"
          className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3"
        >
          {toursData &&
            toursData.tours.length > 0 &&
            toursData.tours.map((tour) => (
              <PublicTourCard tour={tour} key={tour._id} />
            ))}
        </ul>
      </section>

      {meta && toursData.tours.length > 0 && (
        <div className="my-10 border-t pt-6">
          <PaginationCustom
            page={page}
            limit={meta.limit}
            totalPage={meta.totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default ToursList;
