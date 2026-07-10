import type { EventRecord } from "@/types/event";

export type EventBuckets = {
  upcoming: EventRecord[];
  past: EventRecord[];
};

export function groupEventsByTiming(events: EventRecord[]): EventBuckets {
  const now = Date.now();
  const upcoming: EventRecord[] = [];
  const past: EventRecord[] = [];

  for (const event of events) {
    const eventTime = new Date(event.eventDate).getTime();
    if (Number.isNaN(eventTime) || eventTime >= now) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  const sortEvents = (left: EventRecord, right: EventRecord) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const dateDiff = new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }

    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }

    return left.title.localeCompare(right.title);
  };

  upcoming.sort(sortEvents);
  past.sort(sortEvents);

  return { upcoming, past };
}
