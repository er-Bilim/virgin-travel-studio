'use client'

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  Globe2,
  HeartHandshake,
  MapPinned,
  Plane,
  ShieldCheck,
  ClipboardCheck,
  Map
} from 'lucide-react';
import { useAboutUsData } from '@/lib/hooks/aboutUs';

const About = () => {

  const {data: about} = useAboutUsData();

  const values = about?.contentBlocks
    ? about.contentBlocks
    : [
        {
          title: 'Надёжность',
          body: 'Мы собираем важные детали тура в одном месте: даты, отели, перелёты, цены и отзывы.',
        },
        {
          title: 'Забота',
          body: 'Помогаем клиентам чувствовать себя спокойно до поездки, во время путешествия и после него.',
        },
        {
          title: 'Выбор',
          body: 'Подбираем направления под разные цели: отдых, вдохновение, семейные поездки и новые впечатления.',
        },
      ];

  const contentBlocksIcons = [ShieldCheck, HeartHandshake, Globe2];

  const steps = [
    'Выберите направление',
    'Изучите детали тура',
    'Оставьте заявку',
    'Отправляйтесь в путешествие',
  ];



  return (
    <>
      <section aria-labelledby="about-title" className="relative overflow-hidden py-20 md:py-28">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-2 border-cyan-400/30" />
        <div aria-hidden className="pointer-events-none absolute right-10 top-8 size-36 rounded-full border-2 border-navy-700/15" />
        <div aria-hidden className="pointer-events-none absolute -left-0 bottom-26 size-40 rounded-full border-2 border-cyan-400/25" />
        <div aria-hidden className="pointer-events-none absolute left-1/3 top-12 size-3 rounded-full bg-cyan-400" />
        <div aria-hidden className="pointer-events-none absolute right-1/4 bottom-16 size-2.5 rounded-full bg-navy-700/40" />

        <div aria-hidden className="absolute bottom-15 -right-0 size-45 rounded-full bg-navy-700/[0.06]" />

        <div aria-hidden className="absolute left-15 top-30 size-45 rounded-full bg-navy-700/[0.06]md:block" />

        <div className='relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]'>
          <div>
            <h1 id='about-title' className='max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-navy-700 md:text-6xl'>
              {about?.pageTitle ?? 'Путешествия, которые начинаются с доверия'}
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {about?.description ?? 'Virgin Travel помогает выбрать тур без лишнего стресса: посмотреть детали поездки, сравнить предложения и сделать первый шаг к новому путешествию'}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/tours" className="inline-flex items-center gap-2 rounded-full bg-navy-700 px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-navy-800">
                Смотреть туры
                <ArrowRight size={15} className="text-cyan-400"/>
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-bold text-navy-700 transition">
                На главную
              </Link>
            </div>
          </div>

          <aside className='relative'>
            <div aria-hidden className="absolute -left-2 -top-6 size-32 rounded-3xl bg-cyan-400 blur-3xl" />
            <div aria-hidden className="absolute -right-4 bottom-8 size-28 rounded-full bg-cyan-400 blur-2xl" />

            <div className="relative rounded-[2rem] bg-navy-700 p-6 text-white shadow-2xl shadow-navy-700/25">
              <div className='rounded-[1.6rem] border border-white/15 bg-white/10 p-6 backdrop-blur'>
                <div className='mb-8 flex items-center justify-between'>
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-400 text-navy-700">
                    <Plane size={28}/>
                  </div>

                  <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80">
                    Travel studio
                  </span>
                </div>

                <h2 className="text-2xl font-black leading-tight">
                  Мы соединяем мечту о поездке с понятным выбором тура
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/75">
                  На странице тура клиент видит даты, стоимость, отель, перелёт, наличие мест и отзывы — всё, что помогает принять решение
                </p>

                <ol className="mt-8 grid gap-3">
                  {
                    steps.map((step, index) => (
                      <li key={step} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-sm font-black text-navy-700">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold">{step}</span>
                      </li>
                    ))
                  }
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby='values-title' className="mx-auto max-w-6xl py-10">
        <h2 id='values-title' className="sr-only">Наши ценности</h2>

        <ul className="grid gap-6 md:grid-cols-3">
          {
            values.map((value, index) => {
              const Icon = contentBlocksIcons[index] ?? ShieldCheck;

              return (
                <li key={index} className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 transition group-hover:bg-navy-700 group-hover:text-cyan-400">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-2xl font-black text-navy-700">{value.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-600">{value.body}</p>
                </li>
              )
            })
          }
        </ul>
      </section>

      <section aria-labelledby='mission-title' className="mx-auto grid max-w-6xl gap-8  py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className='relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm'>
          <div aria-hidden className="absolute -right-16 -top-16 size-40 rounded-full bg-cyan-400/10" />
          <div aria-hidden className="absolute -bottom-20 -left-20 size-56 rounded-full bg-navy-700/[0.06]" />

          <div className='relative'>
            <div className="mb-8 flex size-16 items-center justify-center rounded-3xl bg-navy-700 text-cyan-400">
              <MapPinned size={30}/>
            </div>

            <h2 id="mission-title" className="text-3xl font-black leading-tight text-navy-700">
              {about?.missionTitle ?? 'Мы делаем выбор тура понятнее'}
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              {about?.missionBody ??
                'Virgin Travel Studio — пространство, где клиент может спокойно изучить туры, увидеть реальные отзывы и понять, какое направление подходит именно ему.'}
            </p>
          </div>
        </div>

        <article className="rounded-[2rem] bg-navy-700 p-8 text-white shadow-xl shadow-navy-700/20">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            {about?.ideaLabel ?? 'Наша идея'}
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
            {about?.ideaTitle ?? 'Не просто показать тур, а помочь почувствовать будущую поездку'}
          </h2>

          <p className="mt-6 leading-8 text-white/75">
            {about?.ideaDescription ??
              'Мы хотим, чтобы каждый клиент видел не только цену, но и полную картину путешествия: где он будет жить, когда вылетает, сколько мест осталось и что говорят другие путешественники.'}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-5">
              <Compass className="mb-4 text-cyan-300" size={28} />
              <h3 className="font-black">{about?.ideaBlocks?.[0]?.title ?? 'Ориентир'}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {about?.ideaBlocks?.[0]?.body ?? 'Помогаем быстро найти подходящее направление.'}
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <BadgeCheck className="mb-4 text-cyan-300" size={28} />
              <h3 className="font-black">{about?.ideaBlocks?.[1]?.title ?? 'Прозрачность'}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {about?.ideaBlocks?.[1]?.body ?? 'Показываем детали тура до принятия решения.'}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section aria-labelledby="trust-title" className="mx-auto max-w-6xl pb-24">
        <div className="grid items-center gap-10 rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm md:p-12 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-800">
              Почему нам доверяют
            </p>
            <h2 id="trust-title" className="mt-7 text-3xl font-black leading-tight text-navy-700 md:text-4xl">
              {about?.heroCardTitle ?? 'Мы соединяем мечту о поездке с понятным выбором тура'}
            </h2>
            <p className="mt-8 leading-8 text-gray-600">
              {about?.heroCardBody ??
                'На странице тура клиент видит даты, стоимость, отель, перелёт, наличие мест и отзывы — всё, что помогает принять решение.'}
            </p>
          </div>

          <ul className="grid gap-3">
            {(about?.steps ?? [
              'Выберите направление',
              'Изучите детали тура',
              'Оставьте заявку',
              'Отправляйтесь в путешествие',
            ]).map((text, index) => {
              const Icon = [Map, ClipboardCheck, BadgeCheck, Plane][index] ?? Map;
              return (
                <li
                  key={text + index}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-300 px-8 py-6 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800 transition group-hover:bg-navy-700 group-hover:text-cyan-400">
                    <Icon size={20} />
                  </span>
                  <span className="text-[15px] font-bold text-navy-700">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>

  );
};

export default About;
