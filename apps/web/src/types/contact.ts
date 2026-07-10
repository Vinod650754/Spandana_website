export type ContactSettings = {
  id?: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  mapsUrl: string | null;
  address: string | null;
  officeHours: string | null;
  contactFormEnabled: boolean;
  successMessage: string;
  updatedAt?: string;
};

export type ContactSettingsResponse = {
  data: ContactSettings;
};

export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageListResponse = {
  data: ContactMessage[];
};
