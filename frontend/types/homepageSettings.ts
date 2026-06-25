export interface HeroSettings {
  videoUrl?: string;
  title?: string;
  subtitle?: string;
}

export interface TextSectionSettings {
  title?: string;
  subtitle?: string;
}

export interface PageSettings {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export interface HomepageSettingsFields {
  _id?: string;
  hero?: HeroSettings;
  mainPopularTours?: TextSectionSettings;
  mainLatestNews?: TextSectionSettings;
  toursPage?: PageSettings;
  newsPage?: PageSettings;
  reviewsPages?: TextSectionSettings;
}

export interface HomepageSettingsMutationData extends HomepageSettingsFields {
  video?: File | null;
  deleteVideo?: boolean;
}