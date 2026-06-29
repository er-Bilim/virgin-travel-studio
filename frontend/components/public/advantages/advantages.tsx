"use client";

import { useHomepageSettings } from "@/lib/hooks/homepageSettingsHooks";
import { imageUrl } from "@/lib/constants";


export default function Advantages() {

    const { data, isPending, isError } = useHomepageSettings();
    const advantages = data ? data.advantages || [] : []

    if (isPending) {
        return (
            <section className="my-24">
                <p className="text-center text-muted-foreground">
                    Загрузка...
                </p>
            </section>
        );
    }

    return (
      <>
        {advantages.length > 0 && !isError && (
          <>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl font-black text-navy-700 md:text-4xl">
                Наши преимущества
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              {
                advantages.map((adv, index) => (
                  <article
                    key={index}
                    className="group w-[350px] flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200"
                  >
                    {adv.image && (
                      <div className="mb-5 flex h-48 w-full overflow-hidden rounded-xl bg-gray-50 text-navy-700 transition-colors duration-300 group-hover:bg-navy-800">
                        <img
                          src={imageUrl + adv.image}
                          alt={adv.title || 'Advantage image'}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col">
                      <h2 className="text-xl font-bold tracking-tight text-navy-700 transition-colors duration-300 group-hover:text-navy-900">
                        {adv.title}
                      </h2>

                      <p className="mt-3 text-sm leading-relaxed text-gray-500 flex-1">
                        {adv.body}
                      </p>
                    </div>
                  </article>
                ))}
            </div>
          </>
        )}
      </>
    );
}