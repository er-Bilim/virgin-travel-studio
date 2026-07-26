import type { Types } from "mongoose";

export interface AdvantageFields {
  title: string;
  body: string;
  image: string | null;
}


export interface HomepageSettingsFields {
  hero: {
    videoUrl?: string;
    title: string;
    subtitle?: string;
  };
  advantages: Types.DocumentArray<AdvantageFields>;
  mainPopularTours: {
    title: string;
    subtitle?: string;
  };
  mainLatestNews: {
    title: string;
    subtitle?: string;
  };
  toursPage: {
    badge: string;
    title: string;
    subtitle?: string;
  };
  newsPage: {
    badge: string;
    title: string;
    subtitle?: string;
  };
  reviewsPage: {
    title: string;
    subtitle?: string;
  }
}

