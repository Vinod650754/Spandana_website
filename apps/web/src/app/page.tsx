import { HomePageCms } from "@/components/sections/home-page-cms";
import { apiFetch } from "@/lib/api";
import type { HomepageContent } from "@/types/homepage";

async function getHomepageContent() {
  try {
    const response = await apiFetch<{ data: HomepageContent }>("/home");
    return response.data;
  } catch {
    return null;
  }
}

export default async function Home() {
  const content = await getHomepageContent();
  return <HomePageCms content={content} />;
}
