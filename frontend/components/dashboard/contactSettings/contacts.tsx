"use client";

import { useState } from 'react';
import { useContacts } from '@/lib/hooks/contactSettings';
import { ExternalLink, Loader2, Mail, MapPin, Phone, Globe, X } from 'lucide-react';
import {
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
  FaFacebook,
} from 'react-icons/fa';


export default function Contacts () {
  const { data: contactSettings, isPending, error } = useContacts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const openModal = () => {
    setIsMapLoading(true);
    setIsModalOpen(true);
  };

  return (
    <div className="my-5">
      {isPending ? (
        <div className="flex items-center gap-2 text-muted-foreground py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Загрузка...</span>
        </div>
      ) : error ? (
        <p className="text-destructive py-4">{error.message}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-muted/20 divide-y overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Телефон</p>
                <p className="text-sm font-medium">{contactSettings.phone ?? 'Не указан'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{contactSettings.email ?? 'Не указан'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Адрес</p>
                <p className="text-sm font-medium">{contactSettings.address ?? 'Не указан'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ссылка на карту</p>
                {contactSettings.mapEmbedUrl ? (
                  <button
                    type="button"
                    onClick={openModal}
                    className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 text-left"
                  >
                    Посмотреть карту <ExternalLink className="h-3 w-3" />
                  </button>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">Не указана</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {contactSettings.instagram && (
              <a
                href={`https://instagram.com/${contactSettings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950/20">
                  <FaInstagram className="h-4 w-4 text-pink-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Instagram</p>
                  <p className="truncate text-sm font-medium">{contactSettings.instagram}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {contactSettings.telegram && (
              <a
                href={`https://t.me/${contactSettings.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/20">
                  <FaTelegramPlane className="h-4 w-4 text-sky-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Telegram</p>
                  <p className="truncate text-sm font-medium">{contactSettings.telegram}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {contactSettings.whatsapp && (
              <a
                href={`https://wa.me/${contactSettings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20">
                  <FaWhatsapp className="h-4 w-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="truncate text-sm font-medium">{contactSettings.whatsapp}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {contactSettings.facebook && (
              <a
                href={`https://facebook.com/${contactSettings.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <FaFacebook className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Facebook</p>
                  <p className="truncate text-sm font-medium">{contactSettings.facebook}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-background border rounded-xl w-full max-w-2xl h-[450px] flex flex-col overflow-hidden shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
              <h3 className="text-sm font-medium text-foreground">Проверка карты из настроек</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 relative bg-muted/5">
              {isMapLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-xs text-muted-foreground">Загрузка данных Google Maps...</span>
                </div>
              )}
              <iframe
                src={contactSettings!.mapEmbedUrl}
                width="100%"
                height="100%"
                title="Предпросмотр карты администратором"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setIsMapLoading(false)}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}