import Logo from "@/components/assets/Logo.png";


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="hidden h-10 items-center justify-center bg-sky-900 px-6 text-sm text-white md:flex">
        <p>Call +996 500 123 456</p>
      </div>

      <div className="mx-auto flex h-20 max-w-[1400px] px-[20px] items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-21 w-21 items-center justify-center rounded-xl overflow-hidden">
            <img src={Logo.src} alt="" />
          </div>

          <div>
            <h1 className="text-lg font-black uppercase leading-none">
              Kyrgyz Travel
            </h1>

            <p className="text-xs tracking-[0.3em] text-zinc-500">
              EXPEDITIONS
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          <button className="transition hover:text-zinc-500">Туры</button>

          <button className="transition hover:text-zinc-500">
            Направления
          </button>

          <button className="transition hover:text-zinc-500">О нас</button>

          <button className="transition hover:text-zinc-500">Контакты</button>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-full border border-zinc-200 p-3 transition hover:bg-zinc-100 md:flex"></button>

          <button className="hidden text-sm font-medium md:block">Войти</button>

          <button className="rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300">
            BOOK NOW →
          </button>
        </div>
      </div>
    </header>
  );
}