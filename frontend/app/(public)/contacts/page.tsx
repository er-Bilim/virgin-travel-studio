"use client";

import {Breadcrumbs} from "@/components/shared/Breadcrumbs";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertTriangle, Clock, Mail, MapPin, Phone} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import ShareButton from "@/components/public/buttons/share/ShareButton";
import Link from "next/link";
import {useContacts} from "@/lib/hooks/contactSettings";
import { usePublicFaqs } from "@/lib/hooks/faq";


export default function ContactsPage() {
  const { data: settings, isLoading, isError } = useContacts();
  const { data: faqs, isPending, isError: isFaqError } = usePublicFaqs();

  if (isLoading || isPending) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Skeleton className="w-48 h-6 mt-5 mb-8" />

        <main className="space-y-12 md:space-y-16">
          <Skeleton className="w-full h-[250px] md:h-[350px] rounded-3xl" />

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="space-y-3">
                <Skeleton className="w-1/2 md:w-1/3 h-10 rounded-lg" />
                <Skeleton className="w-full md:w-3/4 h-4 rounded" />
                <Skeleton className="w-[80%] md:w-2/3 h-4 rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="w-20 h-3 rounded" />
                      <Skeleton className="w-3/4 md:w-full h-4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Skeleton className="h-[300px] sm:h-[400px] lg:h-auto rounded-3xl" />
          </section>

          <section className="flex justify-center flex-wrap items-center gap-5">
            <Skeleton className="w-180 h-10"/>
            <div className="p-5 space-y-3 w-150">
              <Skeleton className="rounded-2xl h-6 w-full px-5 sm:px-6 md:px-8 shadow-sm" />
              <Skeleton className="rounded-2xl h-6 w-full px-5 sm:px-6 md:px-8 shadow-sm" />
              <Skeleton className="rounded-2xl h-6 w-full px-5 sm:px-6 md:px-8 shadow-sm" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (isError || isFaqError) {
    return (
      <div className="container mx-auto px-4 py-20 md:py-32 text-center flex flex-col items-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Упс, что-то пошло не так
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto mb-8 px-4">
          Не удалось загрузить контактную информацию. Пожалуйста, проверьте
          подключение к интернету или попробуйте обновить страницу.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-[#1E2B6D] hover:bg-blue-900 w-full sm:w-auto"
        >
          Обновить страницу
        </Button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Свяжитесь с нами</h1>
        <p className="text-slate-500">К сожалению, контактная информация временно не заполнена.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
      <Breadcrumbs
        className="mt-5"
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Контакты', href: '/contacts' },
        ]}
      />

      <main className="mt-8 space-y-12 md:space-y-16">
        <section className="relative overflow-hidden rounded-3xl py-12 px-6 md:py-16 md:px-16 min-h-[300px] md:min-h-[350px] flex items-center shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#101947]/95 via-[#1E2B6D]/80 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-blue-950/40" />

          <div className="relative z-10 max-w-2xl space-y-3 md:space-y-4">
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-blue-400 uppercase">
              Ваш проводник в мире путешествий
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Свяжитесь с нами
            </h1>
            <p className="text-gray-200 text-sm md:text-lg leading-relaxed font-light">
              Планируете отпуск или деловую поездку? Наша команда Travel Virgin
              поможет вам с выбором туров, бронированием отелей, покупкой
              авиабилетов и оформлением всех необходимых документов.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="flex flex-col justify-between space-y-6 md:space-y-8 bg-white p-5 sm:p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="space-y-2 md:space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Офис в Бишкеке
              </h2>
              <p className="text-slate-500 leading-relaxed max-w-md text-xs md:text-sm">
                Мы с радостью ответим на все ваши вопросы. Позвоните нам,
                напишите на почту или загляните в наш уютный офис.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex flex-col gap-4">
                {settings.email && (
                  <div className="flex items-center gap-3 md:gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                      <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#1E2B6D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Электронная почта
                      </p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-xs md:text-sm font-medium text-slate-700 hover:text-[#1E2B6D] transition-colors block truncate"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.phone && (
                  <div className="flex items-center gap-3 md:gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                      <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#1E2B6D]" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Телефон
                      </p>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-xs md:text-sm font-bold text-slate-700 hover:text-[#1E2B6D] transition-colors block"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {settings.address && (
                  <div className="flex items-center gap-3 md:gap-4 group sm:col-span-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#1E2B6D]" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Адрес офиса
                      </p>
                      <p className="text-xs md:text-sm font-medium text-slate-700 leading-snug">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                {settings.workingHours && (
                  <div className="flex items-start gap-3 md:gap-4 group sm:col-span-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#1E2B6D]" />
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 space-y-0.5">
                      <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Режим работы
                      </p>
                      <p className="font-medium text-slate-700">
                        Пн-Пт: {settings.workingHours.weekdays.from} -{' '}
                        {settings.workingHours.weekdays.to}
                      </p>
                      <p className="text-[10px] md:text-xs">
                        Сб:{' '}
                        {settings.workingHours.saturday.isClosed
                          ? 'Выходной'
                          : `${settings.workingHours.saturday.from} - ${settings.workingHours.saturday.to}`}
                      </p>
                      <p className="text-[10px] md:text-xs">
                        Вс:{' '}
                        {settings.workingHours.sunday.isClosed
                          ? 'Выходной'
                          : `${settings.workingHours.sunday.from} - ${settings.workingHours.sunday.to}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 md:pt-6 border-t border-slate-100">
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Быстрая связь:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {settings.telegram && (
                  <ShareButton
                    platform="telegram"
                    url={settings.telegram}
                    title="telegram"
                    variant="labeled"
                    className="w-full bg-slate-50 py-4 sm:py-5 text-xs md:text-sm"
                  />
                )}
                {settings.whatsapp && settings.phone && (
                  <ShareButton
                    platform="whatsapp"
                    url={settings.whatsapp}
                    title="whatsapp"
                    number={settings.phone}
                    variant="labeled"
                    className="w-full bg-slate-50 py-4 sm:py-5 text-xs md:text-sm"
                  />
                )}
                {settings.instagram && (
                  <ShareButton
                    platform="instagram"
                    url={settings.instagram}
                    title="instagram"
                    variant="labeled"
                    className="w-full bg-slate-50 py-4 sm:py-5 text-xs md:text-sm cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="h-[300px] sm:h-[400px] lg:h-auto rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2925.4324328728844!2d74.61403670572865!3d42.842601497319585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb6155450422d%3A0x86e26db7a8764927!2zODkg0YPQuy4g0JDRhdGD0L3QsdCw0LXQstCwLCDQkdC40YjQutC10LogNzIwMDIw!5e0!3m2!1sru!2skg!4v1781259264024!5m2!1sru!2skg"
              width="100%"
              height="100%"
              title="Карта местоположения офиса"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto py-4 md:py-8">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Часто задаваемые вопросы
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Мы собрали ответы на самые популярные вопросы наших клиентов
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3 md:space-y-4"
          >
            {faqs?.length === 0 && (
              <p className="text-center text-xl md:text-2xl text-slate-900">
                Вопросов пока нет.
              </p>
            )}

            {faqs?.map((faq) => (
              <AccordionItem
                key={faq._id}
                value={`item-${faq._id}`}
                className="bg-white border border-slate-100 rounded-2xl px-5 sm:px-6 md:px-8 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-100 data-[state=open]:border-blue-200 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-sm md:text-lg font-bold text-slate-800 hover:text-[#1E2B6D] hover:no-underline py-4 md:py-6 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="pt-3 pb-5 md:pt-4 md:pb-6 border-t border-slate-100 text-slate-600 leading-relaxed text-xs md:text-base">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="bg-gray-50/80 rounded-3xl p-6 sm:p-8 md:p-10 text-center max-w-4xl mx-auto border border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
            Остались вопросы?
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-6 md:mb-8 max-w-lg mx-auto">
            Наши менеджеры готовы помочь вам с выбором направления и ответить на
            любые вопросы.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-[#1E2B6D] hover:bg-blue-900 w-full sm:w-auto"
              asChild
            >
              <Link href="/tours">Подобрать тур</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white"
              asChild
            >
              <Link href="/tourSets">Оставить заявку</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}