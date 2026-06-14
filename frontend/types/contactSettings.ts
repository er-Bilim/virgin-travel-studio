export interface TimeRange {
  from: string;
  to: string;
}

export interface WeekendRange {
  isClosed: boolean;
  from?: string;
  to?: string;
}

export interface ContactSettingsFields {
  phone: string;
  email: string;
  address: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  workingHours?: {
    weekdays: TimeRange;
    saturday: WeekendRange;
    sunday: WeekendRange;
  };
}
