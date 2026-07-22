'use client';

import { apiURL } from '@/lib/constants';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';

const HeroSection = () => {

  const {
    data: settings,
  } = useHomepageSettings();


  const videoSource = settings?.hero?.videoUrl
    ? `${apiURL}/homepage-settings/video/${settings.hero.videoUrl}`
    : 'http://localhost:8000/videos/default.mp4';

  return (
    <section aria-labelledby="hero-title">
      <div className="relative left-1/2 -translate-x-1/2 w-screen h-[400px] md:h-[680px] bg-gradient-to-br from-[#1E2B6D] via-[#152054] to-[#0D153A]">
        <video
          src={videoSource}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={`${apiURL}/images/poster.jpg`}
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-4 text-center">
          <h1 className="text-3xl font-black md:text-5xl max-w-4xl leading-tight">
            {settings?.hero?.title || 'Путешествуй с нами'}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg opacity-90 whitespace-pre-line">
            {settings?.hero?.subtitle ||
              'Наша компания занимается проектированием премиальных туров.'}
          </p>
        </div>
      </div>
    </section>
  )
};

export default HeroSection;
