'use client';

import Link from 'next/link';
import Logo from '@/components/public/layout/logo/Logo';
import iconLogo from '@/assets/Logo_favicon_32_32_2.png';
import {
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
  FaFacebook,
} from 'react-icons/fa';
import { useContacts } from '@/lib/hooks/contactSettings';
import { imageUrl, isDev } from '@/lib/constants';
import Image from 'next/image';

export default function Footer() {
  const { data: contacts, error } = useContacts();

  const logoSrc = contacts?.logo ? imageUrl + contacts.logo : iconLogo.src;

  const mobile = contacts?.phone ? contacts.phone : 'временно недоступен';
  const instagram = contacts?.instagram ? contacts.instagram : null;
  const telegram = contacts?.telegram ? contacts.telegram.slice(1) : null;
  const whatsApp = contacts?.whatsapp ? contacts.whatsapp.slice(1) : null;
  const facebook = contacts?.facebook ? contacts.facebook : null;
  const address = contacts?.address ? contacts.address : 'Адрес не прописан';

  return (
    <footer className="bg-[#1E2B6D] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logoSrc}
                alt="Логотип"
                width={50}
                height={50}
                unoptimized={isDev}
                className="h-6 w-auto object-contain"
              />

              <Logo />
            </Link>

            <p className="mt-3 text-sm text-white/70">
              Создаём незабываемые путешествия и впечатления по всему миру.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm text-white/80">
            <Link href="/" className="hover:text-white transition">
              Главная
            </Link>

            <Link href="/tours" className="hover:text-white transition">
              Туры
            </Link>

            <Link href="/about" className="hover:text-white transition">
              О нас
            </Link>

            <Link href="/contacts" className="hover:text-white transition">
              Контакты
            </Link>
          </nav>

          <address className="not-italic flex flex-col gap-2 text-sm text-white/80">
            {error && (
              <span className="text-xs text-red-300/70">
                Не удалось загрузить контакты, показаны значения по умолчанию
              </span>
            )}

            <a href={`tel:${mobile}`} className="hover:text-white transition">
              {mobile}
            </a>

            {contacts?.email && (
              <a
                href={`mailto:${contacts.email}`}
                className="hover:text-white transition"
              >
                {contacts.email}
              </a>
            )}

            <span>{address}</span>
          </address>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {instagram && (
                <a
                  href={`https://www.instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-5 w-5 hover:scale-110 transition" />
                </a>
              )}

              {telegram && (
                <a
                  href={`https://t.me/${telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <FaTelegramPlane className="h-5 w-5 hover:scale-110 transition" />
                </a>
              )}

              {whatsApp && (
                <a
                  href={`https://wa.me/${whatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="h-5 w-5 hover:scale-110 transition" />
                </a>
              )}

              {facebook && (
                <a
                  href={`https://www.facebook.com/${facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-5 w-5 hover:scale-110 transition" />
                </a>
              )}
            </div>

            <Link
              href="/privacy"
              className="text-sm text-white/70 hover:text-white transition"
            >
              Политика конфиденциальности (в разработке)
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60 flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 Virgin Travel Studio. Все права защищены.</span>
          <span>Создаём ваши лучшие воспоминания</span>
        </div>
      </div>
    </footer>
  );
}
