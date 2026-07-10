import { CrudLayout } from "@/components/admin/crud-layout";
import { EventManagement } from "@/components/admin/event-management";

export default function AdminEventsPage() {
  return (
    <CrudLayout
      eyebrow="Events"
      title="Events Management"
      description="Create, publish, archive, and organize public events using the reusable admin CRUD structure."
    >
      <EventManagement />
    </CrudLayout>
  );
}
