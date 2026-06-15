export interface HomepageSettingsFields {
  hero: {
    videoUrl?: string;
    title: string;
    subtitle?: string;
  };
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
}
