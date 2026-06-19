'use client';

import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowBigDown,
  ArrowBigUp,
  CalendarPlus2,
  House,
  RefreshCw,
  Star,
  WifiOff,
  Compass,
  Search,
  Globe,
  Paintbrush,
} from 'lucide-react';

import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import Sort from '@/components/shared/Sort';
import FilterCombobox from '../../shared/FilterCombobox';

import { useGetTourCategories, useTours } from '@/lib/hooks/tourHooks';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { toursLimitPag } from '@/lib/constants';
import { getCountryOptions, pluralize } from '@/lib/utils';
import { StyledInput } from '@/components/shared/form/field-styles';
import { useDebounce } from 'use-debounce';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новые сверху', icon: CalendarPlus2 },
  { value: 'price-asc', label: 'Сначала дешевле', icon: ArrowBigUp },
  { value: 'price-desc', label: 'Сначала дороже', icon: ArrowBigDown },
  { value: 'rating', label: 'По рейтингу', icon: Star },
];

const ToursList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const countryOptions = getCountryOptions();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort');
  const categoryId = searchParams.get('categories');
  const rawCountryCode = searchParams.get('countryCode');

  const { data: categories } = useGetTourCategories();

  const countryCode = rawCountryCode === 'all' ? undefined : rawCountryCode;
  const selectedCountry = countryOptions.find(
    (option) => option.code === countryCode,
  );
  
  const selectedCategory = categories ? categories.find((category) => category._id === categoryId) : null;

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
    countryCode: countryCode ?? undefined,
    search: debouncedSearch[0],
  });  

  const meta = toursData?.meta;

  const categorySettingsCombobox = {
    title: 'Все категории',
    icon: Paintbrush,
    queryParamsName: 'categories',
    searchPlaceholder: 'Поиск категории'
  };

  const countrySettingsCombobox = {
    title: 'Все страны',
    icon: Globe,
    queryParamsName: 'countryCode',
    searchPlaceholder: 'Поиск страны'
  };

  const { data: settings } = useHomepageSettings();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearch(value);
  }

  if (isToursError) {
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

        <h1 className="font-black text-navy-800 text-4xl mt-3 md:text-5xl">
          {settings?.toursPage?.title || 'Путешествия'}
        </h1>

        <p className="text-slate-500">
          Каждый тур – частный проект нашей команды, без шаблонов и групп по 50
          человек
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-6 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="tour-search"
            className="pl-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Поиск
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <StyledInput
              id="tour-search"
              type="text"
              placeholder="Название тура"
              className="h-[50px] w-full rounded-xl border-1 border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition hover:border-slate-300 focus:border-cyan-700 focus:ring-[3px] focus:ring-cyan-700/10"
              onChange={handleSearch}
            />
          </div>
        </div>

        {categories && (
          <div className="flex flex-col gap-1 lg:w-52">
            <span className="pl-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Категория
            </span>
            <FilterCombobox
              options={categories}
              labelKey="title"
              settings={categorySettingsCombobox}
              queryParamsKey="_id"
              selected={selectedCategory ? selectedCategory.title : null}
            />
          </div>
        )}

        {countryOptions && (
          <div className="flex flex-col gap-1 lg:w-52">
            <span className="pl-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Страна
            </span>
            <FilterCombobox
              options={countryOptions}
              labelKey="name"
              settings={countrySettingsCombobox}
              queryParamsKey="code"
              selected={selectedCountry ? selectedCountry.name : null}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 lg:w-48">
          <span className="pl-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Сортировка
          </span>
          <Sort options={SORT_OPTIONS}/>
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
