'use client';

import {
  MapPin,
  Calendar,
  User,
  Car,
  Building2,
  Telescope,
  CalendarHeart,
  Route,
  Rocket,
} from 'lucide-react';
import Link from 'next/link'


const steps = [
  { title: 'Оставляете заявку', description: 'Куда, когда и что хотите' },
  { title: 'Менеджер подбирает', description: 'Варианты отелей, рейсов, цены' },
  { title: 'Согласуем маршрут', description: 'Дорабатываем под вас' },
  { title: 'В путь!', description: 'Всё готово к поездке' },
];

const tags = [
  { icon: MapPin, label: 'Любое направление' },
  { icon: Calendar, label: 'Ваши даты' },
  { icon: User, label: 'Личный менеджер' },
  { icon: Car, label: 'Трансфер включён' },
  { icon: Building2, label: 'Отель на выбор' },
  { icon: Telescope, label: 'Экскурсии по желанию' },
];

const CustomTourCard = () => {
  return (
    <>
      <section>
        <div className="grid overflow-hidden rounded-3xl bg-card lg:grid-cols-[1fr_1fr] border border-slate-300">
          <div className="relative flex flex-col justify-between overflow-hidden bg-white p-10">
            <div className="relative z-10">
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">
                <Route className="size-3.5" />
                Индивидуальный маршрут
              </p>
              <h3 className="mb-4 text-3xl font-black leading-tight tracking-tight text-navy-900 md:text-4xl">
                Тур, которого ещё нет
              </h3>
              <p className="max-w-sm leading-relaxed text-slate-700">
                Тур, которого ещё нет Расскажите, куда мечтаете поехать и когда
                – мы создадим маршрут под вас
              </p>
            </div>

            <div className="relative z-10 mt-15 flex flex-wrap gap-4">
              {tags.map((tag, index) => {
                const Icon = tag.icon;

                return (
                  <span
                    key={tag.label + index}
                    className="inline-flex items-center gap-2 rounded-3xl border border-slate-400/15 bg-cyan-600/[0.06] px-3.5 py-2 text-sm text-cyan-700 tracking-wide font-semibold hover:scale-110 duration-300 cursor-default select-none"
                  >
                    <Icon className="size-4 text-cyan-700" />
                    {tag.label}
                  </span>
                );
              })}
            </div>
            <div className="flex flex-col gap-2 mt-15">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarHeart className="size-4 text-cyan-900" />
                Доступно круглый год
              </span>
              <div className="text-sm text-slate-900 inline-flex gap-2 items-center">
                <span className="text-slate-800">Констультация:</span>
                <span className="font-bold text-cyan-700 bg-cyan-800/[0.08] px-2 py-1 border-1 border-cyan-600 rounded-xl">бесплатно</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-10 border-l pe-2">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Как это работает
            </p>

            <ol className="mb-7 flex flex-col">
              {steps.map((step, index) => (
                <li
                  key={step.title + index}
                  className="relative flex gap-4 pb-12 last:pb-0"
                >
                  {index < steps.length - 1 && (
                    <span className="absolute left-5 top-8 h-[calc(100%-1px)] w-0.5 -translate-x-1/2 bg-slate-400" />
                  )}

                  <span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-800/15 bg-slate-100 text-lg font-bold text-cyan-700">
                    {index + 1}
                  </span>

                  <div>
                    <div className="text-sm font-semibold text-[var(--navy-700)]">
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/tours/custom"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--navy-700)] py-4 text-[15px] font-semibold text-white transition hover:bg-[var(--navy-800)] mt-5 cursor-pointer"
            >
              <Rocket className="size-[18px] text-cyan-500" />
              Составить свой тур
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default CustomTourCard;
