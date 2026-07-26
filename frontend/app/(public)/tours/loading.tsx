import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import TourCardSkeleton from '@/components/public/tours/TourCardSkeleton';
import CategoryFilterSkeleton from '@/components/shared/skeletons/FilterSkeleton';

const ToursLoading = () => {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Туры', href: '/tours' },
        ]}
        className="mt-10"
      />

      <header className="mb-7 max-w-[720px] flex flex-col gap-3">
        <p className="uppercase text-base font-semibold text-cyan-800">
          Авторские маршруты
        </p>
        <h1 className="text-4xl font-semibold">Путешествия</h1>
        <p className="text-slate-500">
          Каждый тур – частный проект нашей команды, без шаблонов и групп по 50 человек
        </p>
      </header>

      <div className="flex justify-between gap-4 mb-10 flex-wrap items-center">
        <CategoryFilterSkeleton />
      </div>

      <p className="mb-5 text-sm text-muted-foreground">Загружаем туры...</p>

      <section aria-labelledby="tours-list-title">
        <h2 id="tours-list-title" className="sr-only">Список туров</h2>
        <ul
          role="list"
          className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 10 }, (_, index) => `skeleton-${index}`).map((id) => (
            <li key={id}>
              <TourCardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default ToursLoading;