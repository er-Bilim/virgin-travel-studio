'use client';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { useContacts } from '@/lib/hooks/contactSettings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { usePublicFaqs } from '@/lib/hooks/faq';
import type { Faq } from '@/types/faq';

export function Faq() {
  const { data: faqs, isLoading, isError } = usePublicFaqs();
  const { data: contacts } = useContacts();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Skeleton className="w-48 h-6 mt-5 mb-8" />
        <main className="space-y-12">
          <Skeleton className="w-full h-[260px] md:h-[320px] rounded-3xl" />
          <section className="max-w-4xl mx-auto space-y-4 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-16 rounded-2xl" />
            ))}
          </section>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 md:py-32 text-center flex flex-col items-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Упс, что-то пошло не так
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-md mx-auto mb-8 px-4">
          Не удалось загрузить список часто задаваемых вопросов. Пожалуйста,
          проверьте интернет-соединение или обновите страницу.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-[#1E2B6D] hover:bg-blue-900 w-full sm:w-auto rounded-xl px-6"
        >
          Обновить страницу
        </Button>
      </div>
    );
  }

  const hasFaqs = faqs && faqs.length > 0;

  const whatsappPhone = contacts?.whatsapp?.replace(/\D/g, '');
  const telegramUsername = contacts?.telegram?.replace('@', '');
  const phoneNumber = contacts?.phone;

  const hasContactOptions = Boolean(
      whatsappPhone || telegramUsername || phoneNumber,
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
      <Breadcrumbs
        className="mt-5"
        items={[
          { label: 'Главная', href: '/' },
          { label: 'FAQ', href: '/faq' },
        ]}
      />

      <main className="mt-8 space-y-12 md:space-y-16">
        <section className="relative overflow-hidden rounded-3xl py-12 px-6 md:py-16 md:px-16 min-h-[260px] md:min-h-[320px] flex items-center shadow-lg">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#101947]/95 via-[#1E2B6D]/80 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-blue-950/40" />

          <div className="relative z-10 max-w-2xl space-y-3 md:space-y-4">
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-blue-400 uppercase">
              База знаний Virgin Travel Studio
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Вопросы и ответы
            </h1>
            <p className="text-gray-200 text-sm md:text-lg leading-relaxed font-light">
              На этой странице мы собрали самые популярные вопросы наших
              путешественников. Найдите мгновенный ответ на интересующий вас
              нюанс бронирования, оплаты или документов.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto py-2">
          {hasFaqs ? (
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-3 md:space-y-4"
            >
              {faqs.map((item: Faq, index: number) => (
                <AccordionItem
                  key={item._id}
                  value={`faq-item-${index}`}
                  className="bg-white border border-slate-100 rounded-2xl px-5 sm:px-6 md:px-8 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-100 data-[state=open]:border-blue-200 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-sm md:text-lg font-bold text-slate-800 hover:text-[#1E2B6D] hover:no-underline py-4 md:py-6 text-left leading-snug">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="pt-3 pb-5 md:pt-4 md:pb-6 border-t border-slate-100 text-slate-600 leading-relaxed text-xs md:text-base whitespace-pre-line">
                      {item.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl p-8 bg-gray-50/40">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">
                Раздел обновляется
              </h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
                Администраторы платформы уже готовят список актуальных ответов.
                Загляните сюда чуть позже!
              </p>
            </div>
          )}
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
                Свяжитесь с нами удобным способом. Менеджер поможет с любыми
                вопросами по турам, бронированию и документам.
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
                        <a href={`tel:${phoneNumber}`}>
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
