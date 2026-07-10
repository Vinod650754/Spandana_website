import type { EventDetailResponse, EventListResponse } from "@/types/event";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchPublishedEvents(): Promise<EventListResponse> {
  const response = await fetch(`${baseUrl}/events`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load events. (${response.status})`);
  }

  return response.json() as Promise<EventListResponse>;
}

export async function fetchPublishedEvent(slug: string): Promise<EventDetailResponse> {
  const response = await fetch(`${baseUrl}/events/${slug}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (response.status === 404) {
    throw new Error("not-found");
  }

  if (!response.ok) {
    throw new Error(`Failed to load event. (${response.status})`);
  }

  return response.json() as Promise<EventDetailResponse>;
}
