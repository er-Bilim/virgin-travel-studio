'use client';

import iconLogo from '@/assets/Logo_favicon_32_32_2.png';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {HelpCircle} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { itemsNavHeader } from '@/lib/constants';
import Image from 'next/image';
import Logo from "@/components/public/layout/logo/Logo";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);


  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      setHidden(currentY > lastScrollY && currentY > 80);

      lastScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <header
          className={clsx(
              'sticky top-0 z-50 pb-2 w-full transition-transform duration-300 shadow-[0_2px_14px_rgba(0,0,0,0.06)] bg-[#1E2B6D]',
              hidden && '-translate-y-full',
          )}
      >
        <div>
          <div className="mx-auto flex h-20 max-w-[1400px] items-center px-[20px] justify-between">

            <Link href="/" className="flex items-center gap-2 leading-none">
              <Image src={iconLogo} className="h-6 w-auto" alt="Открыть меню" /><Logo/>
            </Link>

            <div className="hidden [@media(min-width:1100px)]:flex items-center">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 border shadow-md">
                {itemsNavHeader.map((tab) => {
                  const isActive = pathname === `/${tab.id}`;

                  return (
                      <Link
                          key={tab.id}
                          href={`/${tab.id}`}
                          className={[
                            'px-4 py-2 text-sm font-medium rounded-full transition',
                            isActive
                                ? 'bg-[#1E2B6D] text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                          ].join(' ')}
                      >
                        {tab.label}
                      </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                  href="/"
                  className="
    hidden sm:flex items-center
    text-sm font-semibold
    px-4 py-2 rounded-full
   text-white
    border border-white/50
    shadow-sm
    transition-all duration-200
    hover:shadow-md hover:scale-[1.02]
    active:scale-95
  "
              >
                Собери свой тур
              </Link>

              <button
                  title="Связаться с нами"
                  aria-label="Открыть меню навигации"
                  onClick={() => setOpen(true)}
                  className="
                  cursor-pointer
      p-2 rounded-full
      text-white
      transition-all duration-200
      active:scale-95
      focus:outline-none focus:ring-2 focus:ring-[#1E2B6D]/30
    "
              >
                <HelpCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="[@media(min-width:1100px)]:hidden">
            <div className="mx-auto max-w-[1400px] px-3">
              <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar whitespace-nowrap">

                {itemsNavHeader.map((tab) => {
                  const isActive = pathname === `/${tab.id}`;

                  return (
                      <Link
                          key={tab.id}
                          href={`/${tab.id}`}
                          className={[
                            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition',
                            isActive
                                ? 'bg-[#1E2B6D] text-white border-2 border-white'
                                : 'bg-gray-100 text-gray-600',
                          ].join(' ')}
                      >
                        {tab.label}
                      </Link>
                  );
                })}

              </div>
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
