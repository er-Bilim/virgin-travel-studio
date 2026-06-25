"use client";

import { useAboutUsData } from "@/lib/hooks/aboutUs";
import AboutUsForm from "@/components/dashboard/aboutUs/aboutUsForm";


export default function AboutUs() {
    const { data, isPending, error } = useAboutUsData();

    return (
      <>
        <div className="my-5 space-y-5 rounded-3xl border border-gray-100 bg-white p-6 max-h-[90vh] overflow-y-auto relative">
          <h1 className="text-lg sm:text-3xl font-black text-[#1E2B6D]">
            Страница о нас
          </h1>
          <AboutUsForm
            initialValues={data}
            isLoading={isPending}
            errorLoad={error}
          />
        </div>
      </>
    );
}