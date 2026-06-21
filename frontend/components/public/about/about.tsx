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
  Star,
} from 'lucide-react';
import type { AboutUsFields } from '@/types/aboutUs';

interface Props {
  about?: AboutUsFields;
}

const About = ({ about }: Props) => {
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
    <main className="min-h-screen bg-background text-foreground">
      {!about && <h2 className='fixed right-2 bottom-2 p-2 bg-gray-100 text-black rounded-xl z-10'>Применились дефолтные значения</h2>}
      <section className="relative px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.35),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(30,43,109,0.16),transparent_28%)]" />
        <div className="absolute left-8 top-16 hidden h-24 w-24 rounded-full border border-navy-700/20 md:block" />
        <div className="absolute bottom-10 right-12 hidden h-40 w-40 rounded-full bg-navy-700/10 md:block" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] text-navy-700 md:text-7xl">
              {about?.pageTitle
                ? about.pageTitle
                : `Путешествия, которые начинаются с доверия`}
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {about?.description
                ? about.description
                : `Virgin Travel помогает выбрать тур без лишнего стресса: посмотреть
              детали поездки, сравнить предложения, узнать важную информацию и
              сделать первый шаг к новому путешествию.`}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 rounded-full bg-navy-700 px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-navy-800"
              >
                Смотреть туры
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-bold text-navy-700 transition hover:-translate-y-0.5"
              >
                На главную
              </Link>
            </div>
          </section>

          <aside className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-3xl bg-yellow-400/70 blur-2xl" />
            <div className="relative rounded-[2.5rem] bg-navy-700 p-6 text-white shadow-2xl shadow-navy-700/25">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-navy-700">
                    <Plane size={28} />
                  </div>

                  <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80">
                    Travel studio
                  </span>
                </div>

                <h2 className="text-3xl font-black leading-tight">
                  Мы соединяем мечту о поездке с понятным выбором тура
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/75">
                  На странице тура клиент видит даты, стоимость, отель, перелёт,
                  наличие мест и отзывы — всё, что помогает принять решение.
                </p>

                <div className="mt-8 grid gap-3">
                  {steps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-navy-700">
                        {index + 1}
                      </span>

                      <span className="text-sm font-semibold">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item, index) => {
            const Icon = contentBlocksIcons[index];

            return (
              <article
                key={index}
                className="group rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E2B6D]/10 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-white">
                  <Icon size={26} />
                </div>

                <h2 className="text-2xl font-black text-navy-700">
                  {item.title}
                </h2>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-300/40" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-navy-700/10" />

          <div className="relative">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-navy-700 text-white">
              <MapPinned size={30} />
            </div>

            <h2 className="text-3xl font-black leading-tight text-navy-700">
              {about?.missionTitle
                ? about.missionTitle
                : `Мы делаем выбор тура понятнее`}
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              {about?.missionBody
                ? about.missionBody
                : `Virgin Travel Studio — это пространство, где клиент может спокойно
              изучить туры, увидеть реальные отзывы и понять, какое направление
              подходит именно ему.`}
            </p>
          </div>
        </aside>

        <article className="rounded-[2.5rem] bg-navy-700 p-8 text-white shadow-xl shadow-navy-700/20">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
            {about?.ideaLabel ? about.ideaLabel : `Наша идея`}
          </p>

          <h2 className="mt-4 text-4xl font-black leading-tight">
            {about?.ideaTitle
              ? about.ideaTitle
              : `Не просто показать тур, а помочь почувствовать будущую поездку`}
          </h2>

          <p className="mt-6 leading-8 text-white/75">
            {about?.ideaDescription
              ? about.ideaDescription
              : `Мы хотим, чтобы каждый клиент видел не только цену, но и полную
            картину путешествия: где он будет жить, когда вылетает, сколько мест
            осталось, какие преимущества есть у тура и что говорят другие
            путешественники.`}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-5">
              <Compass className="mb-4 text-yellow-300" size={28} />
              <h3 className="font-black">
                {about?.ideaBlocks ? about.ideaBlocks[0].title : `Ориентир`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {about?.ideaBlocks
                  ? about.ideaBlocks[0].body
                  : `Помогаем быстро найти подходящее направление.`}
              </p>
            </div>
            {/* className="mb-4 text-yellow-300" size={28} */}
            <div className="rounded-3xl bg-white/10 p-5">
              <BadgeCheck className="mb-4 text-yellow-300" size={28} />
              <h3 className="font-black">
                {about?.ideaBlocks ? about.ideaBlocks[1].title : `Прозрачность`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {about?.ideaBlocks
                  ? about.ideaBlocks[1].body
                  : `Показываем детали тура до принятия решения.`}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <article className="p-8 md:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-navy-700">
                Почему нам доверяют
              </p>

              <h2 className="mt-4 text-4xl font-black text-navy-700">
                {about?.heroCardTitle
                  ? about.heroCardTitle
                  : `Мы рядом на каждом этапе путешествия`}
              </h2>

              <p className="mt-6 max-w-2xl leading-8 text-gray-600">
                {about?.heroCardBody
                  ? about.heroCardBody
                  : `От первого просмотра тура до возвращения домой — мы стремимся
                сделать путь клиента спокойным, понятным и вдохновляющим.`}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {(about?.steps ? about.steps : ['Актуальные туры', 'Отзывы клиентов', 'Удобная заявка']).map(
                  (text) => (
                    <div
                      key={text}
                      className="rounded-2xl border border-gray-100 p-4 text-sm font-bold text-navy-700"
                    >
                      <Star
                        size={18}
                        className="mb-3 fill-yellow-400 text-yellow-400"
                      />
                      {text}
                    </div>
                  ),
                )}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
