import CustomTourForm from '@/components/shared/order/customTourForm/CustomTourForm';
import { steps, tags } from '@/lib/customTour/constants';
import { ClockArrowUp, Route, Sparkles } from 'lucide-react';

const CustomTourPage = () => {
  return (
    <>
      <div className="mx-auto max-w-full px-6 py-10">
        <header
          aria-labelledby="custom-title"
          className="mb-6 flex flex-col justify-between gap-6 rounded-[18px] border border-border bg-card px-7 py-6 sm:flex-row sm:items-center"
        >
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-cyan-800">
              <Route className="size-4" />
              Индивидуальный маршрут
            </p>
            <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-[var(--navy-700)]">
              Составь свой тур
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Расскажите о поездке мечты. Мы соберём маршрут специально для вас.
              Это заявка, а не бронь.
            </p>
          </div>

          <aside className="flex shrink-0 items-center gap-3 rounded-2xl bg-slate-100 px-[18px] py-3">
            <ClockArrowUp className="size-6 text-cyan-800" />
            <div>
              <div className="text-[13px] font-bold text-[var(--navy-700)]">
                <span>Ответим за час</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span>Консультация бесплатно</span>
              </div>
            </div>
          </aside>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <CustomTourForm />

          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <section
              aria-labelledby="hot-title"
              className="relative overflow-hidden rounded-[20px] bg-[var(--navy-800)] p-[26px]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -rigth-10 -top-12 size-52 rounded-full bg-cyan-400/[0.08]"
              />
              <p className="relative z-10 mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-300">
                <Sparkles className="size-4" />
                Как это работает
              </p>
              <h2
                id="how-title"
                className="relative z-10 mb-2 text-sl font-bold text-white"
              >
                4 шага до вашего путешествия
              </h2>
              <p className="relative z-10 mb-5 text-[13px] leading-relaxed text-[var(--silver)]">
                Вы оставляете заявку – остальное берём на себя. Без шаблонов,
                всё под вас
              </p>

              <div
                aria-hidden
                className="relative z-10 mb-5 h-px bg-slate-50"
              />

              <ol className="relative z-10">
                {steps.map((step, index) => (
                  <li
                    className="relative flex gap-4 pb-[30px] last:pb-0"
                    key={step.title + index}
                  >
                    {index < steps.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[19px] top-7 h-[calc(100%-10px)] w-0.5 bg-white/[0.15]"
                      />
                    )}
                    <span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-200/[0.2] text-[14px] font-bold text-cyan-300">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-white">
                        <span>{step.title}</span>
                      </div>
                      <div className="text-xs text-[var(--silver)]">
                        <span>{step.description}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section
              aria-labelledby="feats-title"
              className="rounded-[20px] border border-border bg-card p-[22px]"
            >
              <h2 id="feats-title" className="sr-only">
                Преимущества индивидуального тура
              </h2>
              <ul>
                {tags.map((tag, index) => {
                  const Icon = tag.icon;

                  return (
                    <li
                      className="flex items-center gap-3 py-4 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border"
                      key={tag.label + index}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[9px] bg-[#eef6f9] text-cyan-800">
                        <Icon className="size-4" />
                      </span>

                      <span className="text-[13px] font-semibold text-[var(--navy-700)]">
                        {tag.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
};

export default CustomTourPage;
