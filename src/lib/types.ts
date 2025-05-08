// Updated Dream interface with optional ID and title
export interface Dream {
  id?: number;
  date: Date;
  dateKey: string;
  content: string;
  interpretation?: string;
  title?: string;
}

// Add any other types your application needs here