import { ContactPageView } from "@/components/sections/contact-page";
import { apiFetch } from "@/lib/api";
import type { ContactSettings } from "@/types/contact";

async function getContactSettings() {
  try {
    const response = await apiFetch<{ data: ContactSettings }>("/contact/details");
    return response.data;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const settings = await getContactSettings();
  return <ContactPageView settings={settings} />;
}
