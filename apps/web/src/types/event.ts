export type EventStatus = "draft" | "published" | "archived";

export type EventGalleryImage = {
  url: string;
  public_id: string;
  uploaded_at: string;
};

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  category: string;
  venue: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  coverImage: string | null;
  coverImagePublicId: string | null;
  galleryImages: EventGalleryImage[];
  registrationLink: string | null;
  featured: boolean;
  status: EventStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type EventListResponse = {
  data: EventRecord[];
};

export type EventDetailResponse = {
  data: EventRecord;
};
