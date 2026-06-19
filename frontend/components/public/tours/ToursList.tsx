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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearch(value);
  }

  if (isToursError) {
    return (
      <section className="mx-auto max-w-[640px] px-4 py-24 text-center flex flex-col items-center justify-center">
        <div className="mb-5 inline-flex p-5 items-center justify-center rounded-full bg-red-50 text-red-500">
          <WifiOff className="size-8" aria-hidden="true" />
        </div>

        <h2 className="mb-2 text-2xl font-black text-gray-900">
          Не удалось загрузить туры
        </h2>

        <p className="mb-6 text-sm text-muted-foreground max-w-sm">
          Что-то пошло не так – возможно, возникли проблемы с подключением.
          Попробуйте обновить страницу.
        </p>

        <div className="flex justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => refetchTours()}
            className="inline-flex rounded-xl items-center px-5 py-2.5 cursor-pointer bg-[#1E2B6D] text-white hover:bg-[#152054] transition font-medium text-sm shadow-sm"
          >
            <RefreshCw
              className="size-4 mr-2 animate-spin-slow"
              aria-hidden="true"
            />
            Повторить
          </button>
          <Link
            href="/"
            className="inline-flex rounded-xl items-center px-5 py-2.5 cursor-pointer border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
          >
            <House className="size-4 mr-2" aria-hidden="true" />
            На главную
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="px-4 max-w-7xl mx-auto w-full pb-16">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Туры', href: '/tours' },
        ]}
        className="mt-5"
      />

      <header className="mt-8 mb-8">
        <p className="text-cyan-800 font-semibold uppercase text-sm tracking-wider">
          {settings?.toursPage?.badge || 'Авторские маршруты'}
        </p>

        <h1 className="font-black text-navy-800 text-4xl mt-3 md:text-5xl">
          {settings?.toursPage?.title || 'Путешествия'}
        </h1>

        <p className="text-gray-500 mt-3 max-w-2xl whitespace-pre-line text-base">
          {settings?.toursPage?.subtitle ||
            'Каждый тур – частный проект нашей команды, без шаблонов и групп по 50 человек.'}
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

      {meta && toursData && toursData.tours.length > 0 && (
        <div className="mb-6 text-sm text-gray-500 flex flex-row gap-1 items-center font-medium">
          <span className="capitalize">Найдено:</span>
          <span className="font-bold text-[#1E2B6D] bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs">
            {meta.total} {pluralize(meta.total, 'тур', 'тура', 'туров')}
          </span>
        </div>
      )}

      {toursData && toursData.tours.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-20 text-center gap-4 max-w-md mx-auto">
          <div className="bg-muted rounded-full p-5 text-gray-400">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">
              Такого тура пока нет
            </h2>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              Но вы можете создать его под себя — мы соберём уникальный маршрут
              под ваши индивидуальные пожелания.
            </p>
          </div>
          <Link
            href="/tours/custom"
            className="mt-2 inline-flex rounded-xl items-center px-6 py-3 bg-[#1E2B6D] text-white font-semibold text-sm hover:bg-[#152054] transition shadow-sm"
          >
            Создать кастомный тур
          </Link>
        </section>
      ) : (
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
      )}

      {meta && toursData && toursData.tours.length > 0 && (
        <div className="my-12 border-t border-gray-100 pt-6">
          <PaginationCustom
            page={page}
            limit={meta.limit}
            totalPage={meta.totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ToursList;
