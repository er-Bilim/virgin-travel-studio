import { IoSparkles } from 'react-icons/io5';

const ReviewCarouselSkeleton = () => {

  return (
    <section>
      <div className="mb-9">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
          <IoSparkles className="size-[15px]" />
          Отзывы
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-navy-800">
          Что говорят путешественники
        </h2>
        <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
          Реальные впечатления тех, кто уже съездил с нами
        </p>
      </div>

      <div className="flex gap-[22px] overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex w-full shrink-0 flex-col rounded-[20px] border border-border p-[26px] md:basis-1/2 lg:basis-1/3"
          >
            <div className="mb-4 size-5 animate-pulse rounded bg-slate-200" />

            <div className="mb-3.5 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, star) => (
                <div key={star} className="size-4 animate-pulse rounded-sm bg-slate-200" />
              ))}
            </div>

            <div className="mb-5 flex-1 space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-[92%] animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-[85%] animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-[60%] animate-pulse rounded bg-slate-200" />
            </div>

            <div className="flex items-center gap-3 border-t border-border pt-5">
              <div className="size-11 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ReviewCarouselSkeleton;