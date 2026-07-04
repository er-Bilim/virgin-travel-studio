export interface ContentBlock {
  title: string;
  body: string;
}

export interface AboutUsFields {
  pageTitle: string;
  description: string;
  contentBlocks: ContentBlock[];
  missionTitle?: string;
  missionBody?: string;
  ideaLabel?: string;
  ideaTitle?: string;
  ideaDescription?: string;
  ideaBlocks: ContentBlock[];
  heroCardTitle?: string;
  heroCardBody?: string;
  steps: string[];
}

export type AboutUsFieldsMutation = Omit<AboutUsFields, '_id'>;