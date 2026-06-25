"use client";

import About from "@/components/public/about/about";
import { useAboutUsData } from "@/lib/hooks/aboutUs";


const AboutPage = () => {
    const { data } = useAboutUsData();

    return (
      <>
        <About about={data} />
      </>
    );
};

export default AboutPage;