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

export interface AdvantagesFields {
  title: string;
  body: string;
  image: File | null | ''
}

export interface HomepageSettingsFields {
  _id?: string;
  hero?: HeroSettings;
  advantages: AdvantagesFields[];
  mainPopularTours?: TextSectionSettings;
  mainLatestNews?: TextSectionSettings;
  toursPage?: PageSettings;
  newsPage?: PageSettings;
}

export interface HomepageSettingsMutationData extends HomepageSettingsFields {
  video?: File | null;
  deleteVideo?: boolean;
}