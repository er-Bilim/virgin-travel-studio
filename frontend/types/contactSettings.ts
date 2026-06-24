export interface IWorkingHours {
  weekdays: { from: string; to: string };
  saturday: { isClosed: boolean; from: string; to: string };
  sunday: { isClosed: boolean; from: string; to: string };
}

export interface IContactSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  mapEmbedUrl?: string,
  workingHours: IWorkingHours;
}
