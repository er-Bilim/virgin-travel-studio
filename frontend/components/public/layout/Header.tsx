'use client';

import logo from '@/assets/logo_word.png';
import iconLogo from '@/assets/Logo_favicon_32_32_2.png';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { itemsNavHeader, theme } from '@/lib/constants';
import Image from 'next/image';

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('tours');

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

  const currentImage =
    itemsNavHeader.find((i) => i.id === active)?.image ||
    itemsNavHeader[0].image;

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 w-full transition-transform duration-300 shadow-[0_2px_14px_rgba(0,0,0,0.06)]',
          hidden && '-translate-y-full',
        )}
        style={{
          backgroundColor: theme.bg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="mx-auto flex h-20 max-w-[1400px] items-center px-[20px]">
          <div className="flex items-center grow">
            <Link
              href="/"
              aria-label="На главную страницу Virgin travel studio"
            >
              <Image
                src={logo}
                className="h-8 w-auto sm:h-10 cursor-pointer"
                alt="Virgin travel studio"
                priority
              />
            </Link>
          </div>

          <nav
            className="hidden lg:flex justify-center items-center gap-8 md:mr-20"
            aria-label="Основная навигация"
          >
            {itemsNavHeader.map((i) => {
              const isActive = pathname === `/${i.id}`;

              return (
                <Link
                  key={i.id}
                  href={`/${i.id}`}
                  className={clsx(
                    'font-medium transition',
                    isActive ? 'text-cyan-400' : 'hover:text-cyan-400',
                  )}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] px-[20px] h-20 flex justify-end items-center z-[999] pointer-events-none">
        <button
          aria-label="Открыть меню навигации"
          onClick={() => setOpen(true)}
          className=" w-12 h-12 rounded-full
      bg-white/90 backdrop-blur-md
      cursor-pointer flex items-center justify-center
      pointer-events-auto
      transition-all duration-300
      hover:bg-white
      shadow-[0_8px_25px_rgba(0,0,0,0.12),0_0_18px_rgba(63,230,255,0.35)]
      hover:shadow-[0_8px_25px_rgba(0,0,0,0.12),0_0_30px_rgba(63,230,255,0.55)]"
        >
          <Image src={iconLogo} className="h-6 w-auto" alt="Открыть меню" />
        </button>
      </div>

      <div
        className={clsx(
          'fixed inset-0 z-[1000] transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        style={{ backgroundColor: theme.overlay }}
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Навигационное меню"
        className={clsx(
          'fixed top-0 right-0 h-full w-full max-w-2xl z-[1001] flex transition-transform duration-500',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div
          className="w-[180px] sm:w-[280px] backdrop-blur-xl border-r p-5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderColor: theme.border,
          }}
        >
          <Button
            variant="cyan"
            className="p-2 rounded-full hover:bg-zinc-100 transition"
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex flex-col gap-4 mt-10">
            {itemsNavHeader.map((item) => (
              <Link
                key={item.id}
                href={`/${item.id}`}
                onMouseEnter={() => setActive(item.id)}
                onClick={() => setOpen(false)}
                className={clsx(
                  'text-left transition text-sm',
                  active === item.id
                    ? 'text-cyan-400 font-medium'
                    : 'text-zinc-700 hover:text-zinc-900',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div
            key={currentImage}
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
            style={{ backgroundImage: `url(${currentImage})` }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#031633]/40 via-white/10 to-cyan-200/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

          <div
            className="absolute inset-0"
            style={{
              boxShadow: `inset 0 0 120px ${theme.glow}`,
            }}
          />
        </div>
      </div>
    </>
  );
}
