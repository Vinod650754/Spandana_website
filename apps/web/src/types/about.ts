export type AboutImpact = {
  label: string;
  value: number;
  suffix: string;
};

export type AboutTimelineItem = {
  period: string;
  title: string;
  description: string;
  sortOrder: number;
};

export type AboutContent = {
  id?: string;
  yearEstablished: number;
  introduction: string;
  mission: string;
  vision: string;
  objectives: string[];
  impact: AboutImpact[];
  instagramUrl: string;
  timeline: AboutTimelineItem[];
  futureMessage: string;
  updatedAt?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  category: "faculty" | "student";
  member_type: "faculty_coordinator" | "student_coordinator" | "core_member";
  department?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  cloudinary_public_id?: string | null;
  social?: Record<string, string>;
  featured: boolean;
  sort_order: number;
};
