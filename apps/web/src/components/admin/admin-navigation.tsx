import { BarChart3, CalendarDays, FileDown, GalleryHorizontal, Home, Settings, Users } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: typeof BarChart3;
  children?: AdminNavItem[];
};

export const adminNavigation: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Homepage CMS", href: "/admin/settings", icon: Home },
  { label: "Gallery", href: "/admin/gallery", icon: GalleryHorizontal },
  {
    label: "Team",
    href: "/admin/team",
    icon: Users,
    children: [
      { label: "Roles", href: "/admin/team/roles", icon: Users },
      { label: "Departments", href: "/admin/team/departments", icon: Users },
      { label: "Members", href: "/admin/team/members", icon: Users },
    ],
  },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Contact", href: "/admin/contact", icon: FileDown },
  { label: "Testimonials", href: "/admin/testimonials", icon: FileDown },
  { label: "Registrations", href: "/admin/registrations", icon: FileDown },
];