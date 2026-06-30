'use client';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ShareButton from '@/components/public/buttons/share/ShareButton';
import { useContacts } from '@/lib/hooks/contactSettings';
import { usePublicFaqs } from '@/lib/hooks/faq';

export default function ContactsPage() {
  const { data: settings, isLoading, isError } = useContacts();
  const { data: faqs, isPending, isError: isFaqError } = usePublicFaqs();

  const whatsappPhone = settings?.whatsapp?.replace(/\D/g, '');
  const telegramUsername = settings?.telegram?.replace('@', '');
  const phoneNumber = settings?.phone?.replace(/\D/g, '');

  const hasContactOptions = Boolean(
    whatsappPhone || telegramUsername || phoneNumber
  );

  if (isLoading || isPending) {
    return (
      <div className="w-full pb-16">
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
            <Skeleton className="w-180 h-10" />
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
      <div className="w-full py-24 text-center flex flex-col items-center justify-center">
        <div className="mb-5 inline-flex p-5 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Упс, что-то пошло не так</h1>
        <p className="mb-6 text-sm text-muted-foreground max-w-sm mx-auto px-4">
          Не удалось загрузить контактную информацию. Пожалуйста, проверьте
          подключение к интернету или попробуйте обновить страницу.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-[#1E2B6D] hover:bg-blue-900 w-full sm:w-auto text-white font-medium text-sm rounded-xl px-5 py-2.5"
        >
          Обновить страницу
        </Button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="w-full py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Свяжитесь с нами</h1>
        <p className="text-slate-500">К сожалению, контактная информация временно не заполнена.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
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

          <div className="h-[300px] sm:h-[400px] lg:h-auto rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex items-stretch">
            {settings.mapEmbedUrl ? (
              <iframe
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                title="Карта местоположения офиса"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[300px]"
              />
            ) : (
              <div className="w-full min-h-[300px] bg-slate-50 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-3xl m-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Карта временно недоступна</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                  Интерактивная карта наполняется. Вы можете найти нас по адресу: <br />
                  <span className="text-slate-600 font-medium">{settings.address}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Часто задаваемые вопросы
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Мы собрали ответы на самые популярные вопросы наших клиентов
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
            {faqs?.length === 0 && (
              <p className="text-center text-xl md:text-2xl text-slate-900">Вопросов пока нет.</p>
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

        <section className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-slate-100 p-6 sm:p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
            <div className="absolute -right-16 -bottom-16 w-44 h-44 bg-[#1E2B6D]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#1E2B6D]/10 transition-colors duration-500" />

            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#1E2B6D] text-xs font-semibold">
                <MessageSquare className="w-3.5 h-3.5" /> Поддержка клиентов
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Не нашли ответ на вопрос?
              </h2>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Свяжитесь с нами удобным способом. Менеджер поможет с любыми вопросами по турам,
                бронированию и документам.
              </p>
            </div>

            {hasContactOptions && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 z-10">
                {whatsappPhone && (
                  <Button
                    size="lg"
                    className="bg-[#1E2B6D] hover:bg-blue-900 text-white rounded-xl px-6 font-semibold shadow-sm transition-all text-xs md:text-sm"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${whatsappPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp откроется в новой вкладке"
                    >
                      WhatsApp
                    </a>
                  </Button>
                )}

                {telegramUsername && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl px-6 font-semibold text-xs md:text-sm"
                    asChild
                  >
                    <a
                      href={`https://t.me/${telegramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Telegram откроется в новой вкладке"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Telegram
                    </a>
                  </Button>
                )}

                {phoneNumber && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl px-6 font-semibold text-xs md:text-sm"
                    asChild
                  >
                    <a href={`tel:${phoneNumber}`} aria-label="Позвонить по телефону">
                      <Phone className="mr-2 h-4 w-4" />
                      Позвонить
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}