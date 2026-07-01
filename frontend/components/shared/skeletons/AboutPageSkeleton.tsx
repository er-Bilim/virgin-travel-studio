const AboutPageSkeleton = () => {
  return (
    <>
      <section className="relative overflow-hidden py-20 md:py-28">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-2 border-cyan-400/20" />
        <div aria-hidden className="pointer-events-none absolute -left-12 bottom-0 size-40 rounded-full border-2 border-cyan-400/15" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="space-y-3">
              <div className="h-12 w-full max-w-md animate-pulse rounded-lg bg-slate-200 md:h-16" />
              <div className="h-12 w-3/4 animate-pulse rounded-lg bg-slate-200 md:h-16" />
            </div>
            <div className="mt-7 space-y-2.5">
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-[90%] max-w-xl animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-[60%] animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-9 flex gap-4">
              <div className="h-12 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="h-12 w-32 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>

          <aside className="relative">
            <div className="relative rounded-[2rem] bg-navy-700/90 p-6">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div className="size-14 animate-pulse rounded-2xl bg-white/15" />
                  <div className="h-7 w-28 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-6 w-full animate-pulse rounded bg-white/15" />
                  <div className="h-6 w-2/3 animate-pulse rounded bg-white/15" />
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-3.5 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3.5 w-[85%] animate-pulse rounded bg-white/10" />
                </div>
                <div className="mt-8 grid gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                      <div className="size-8 shrink-0 animate-pulse rounded-full bg-white/20" />
                      <div className="h-3.5 w-40 animate-pulse rounded bg-white/15" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl py-10">
        <ul className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="mb-6 size-14 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 space-y-2">
                <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3.5 w-[90%] animate-pulse rounded bg-slate-200" />
                <div className="h-3.5 w-[70%] animate-pulse rounded bg-slate-200" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="mb-8 size-16 animate-pulse rounded-3xl bg-slate-200" />
          <div className="space-y-2.5">
            <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3.5 w-[88%] animate-pulse rounded bg-slate-200" />
            <div className="h-3.5 w-[65%] animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="rounded-[2rem] bg-navy-700/90 p-8">
          <div className="h-4 w-24 animate-pulse rounded bg-white/15" />
          <div className="mt-4 space-y-2.5">
            <div className="h-9 w-full animate-pulse rounded bg-white/15" />
            <div className="h-9 w-2/3 animate-pulse rounded bg-white/15" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-white/10" />
            <div className="h-3.5 w-[80%] animate-pulse rounded bg-white/10" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-3xl bg-white/10 p-5">
                <div className="mb-4 size-7 animate-pulse rounded bg-white/20" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/15" />
                <div className="mt-2 space-y-1.5">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-[70%] animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl pb-24">
        <div className="grid items-center gap-10 rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm md:p-12 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-7 space-y-2.5">
              <div className="h-9 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-8 space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-[85%] animate-pulse rounded bg-slate-200" />
            </div>
          </div>
          <ul className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="flex items-center gap-4 rounded-2xl border border-gray-300 px-8 py-6">
                <div className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default AboutPageSkeleton;