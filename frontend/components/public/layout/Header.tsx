'use client';

import iconLogo from '@/assets/Logo_favicon_32_32_2.png';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { HelpCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { imageUrl, itemsNavHeader } from '@/lib/constants';
import { useContacts } from '@/lib/hooks/contactSettings';
import Logo from '@/components/public/layout/logo/Logo';

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const { data: contacts } = useContacts();
  const logoSrc = contacts?.logo ? imageUrl + contacts.logo : iconLogo;

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastScrollY && currentY > 80);
      lastScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      return;
    }

    document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
      <>
        <header
            className={clsx(
                'sticky top-0 z-50 w-full transition-transform duration-300 shadow-[0_2px_14px_rgba(0,0,0,0.06)] bg-[#1E2B6D]',
                hidden && '-translate-y-full',
            )}
        >
          <div>
            <div className="mx-auto flex flex-col sm:flex-row sm:h-20 max-w-[1400px] items-center px-4 sm:px-[20px] justify-between gap-3 sm:gap-4 py-3 sm:py-0">
              <div className="flex w-full sm:w-auto justify-center sm:justify-start items-center">
                <Link
                    href="/"
                    className="flex items-center gap-2 leading-none"
                    aria-label="На главную страницу Virgin Travel Studio"
                >
                  <img
                      src={typeof logoSrc === 'string' ? logoSrc : iconLogo.src}
                      className="h-6 w-auto shrink-0 brightness-110"
                      alt="Логотип Virgin Travel Studio"
                  />

                  <div className="w-[200px] xs:w-[240px] sm:w-[260px] shrink-0 select-none">
                    <Logo />
                  </div>
                </Link>
              </div>

              <div className="hidden [@media(min-width:1140px)]:flex items-center shrink-0">
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 border shadow-md">
                  {itemsNavHeader.map((tab) => {
                    const isActive = pathname === `/${tab.id}`;

                    return (
                        <Link
                            key={tab.id}
                            href={`/${tab.id}`}
                            className={clsx(
                                'px-4 py-2 text-sm font-medium rounded-full transition',
                                isActive
                                    ? 'bg-[#1E2B6D] text-white'
                                    : 'text-gray-600 hover:bg-gray-100',
                            )}
                        >
                          {tab.label}
                        </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 border-t border-white/10 pt-2 sm:border-0 sm:pt-0 shrink-0">
                <Link
                    href="/tours/custom"
                    className="
                  flex items-center
                  text-xs sm:text-sm font-semibold
                  px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full
                  text-white
                  border border-white/40 sm:border-white/50
                  shadow-sm
                  transition-all duration-200
                  hover:shadow-md hover:scale-[1.02]
                  active:scale-95
                "
                >
                  Собери свой тур
                </Link>

                <div className="flex items-center gap-1">
                  <Link
                      href="/faq"
                      title="Появился вопрос?"
                      aria-label="Перейти к часто задаваемым вопросам"
                      className="
                    cursor-pointer
                    p-2 rounded-full
                    text-white
                    transition-all duration-200
                    hover:bg-white/10
                    active:scale-95
                  "
                  >
                    <HelpCircle className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </Link>

                  <button
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      type="button"
                      className="
                    [@media(min-width:1140px)]:hidden
                    p-2 rounded-full text-white
                    transition-all duration-200
                    hover:bg-white/10 active:scale-95
                  "
                      aria-expanded={isMenuOpen}
                      aria-controls="mobile-drawer"
                      aria-label={isMenuOpen ? 'Закрыть главное меню' : 'Открыть главное меню'}
                  >
                    <Menu className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div
            id="mobile-drawer"
            className={clsx(
                'fixed inset-0 z-50 [@media(min-width:1140px)]:hidden transition-all duration-300',
                isMenuOpen ? 'visible' : 'invisible pointer-events-none',
            )}
        >
          <div
              className={clsx(
                  'absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300',
                  isMenuOpen ? 'opacity-100' : 'opacity-0',
              )}
              onClick={closeMenu}
          />

          <aside
              className={clsx(
                  'absolute right-0 top-0 bottom-0 w-full max-w-[280px] xs:max-w-[320px] bg-[#1E2B6D] p-5 xs:p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out border-l border-white/10',
                  isMenuOpen ? 'translate-x-0' : 'translate-x-full',
              )}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img
                      src={typeof logoSrc === 'string' ? logoSrc : iconLogo.src}
                      className="h-5 w-auto brightness-110"
                      alt="VTS"
                  />

                  <span className="text-white font-bold text-sm tracking-wide uppercase">
                  Навигация
                </span>
                </div>

                <button
                    onClick={closeMenu}
                    type="button"
                    className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Закрыть меню"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 mt-5">
                {itemsNavHeader.map((tab) => {
                  const isActive = pathname === `/${tab.id}`;

                  return (
                      <Link
                          key={tab.id}
                          href={`/${tab.id}`}
                          onClick={closeMenu}
                          className={clsx(
                              'flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200',
                              isActive
                                  ? 'bg-white text-[#1E2B6D] font-semibold shadow-inner'
                                  : 'text-white/80 hover:text-white hover:bg-white/5',
                          )}
                      >
                        {tab.label}
                      </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto pt-5 border-t border-white/10 sm:hidden">
              <Link
                  href="/tours/custom"
                  onClick={closeMenu}
                  className="
                flex items-center justify-center w-full
                text-center text-sm font-bold
                py-3.5 rounded-xl
                bg-white text-[#1E2B6D]
                shadow-md hover:bg-gray-50
                transition-all duration-200
                active:scale-98
              "
              >
                Собери свой тур
              </Link>
            </div>
          </aside>
        </div>
      </>
  );
}