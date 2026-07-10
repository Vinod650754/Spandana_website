import { EmptyState } from "@/components/admin/empty-state";
import { CrudLayout } from "@/components/admin/crud-layout";

export default function AdminTestimonialsPage() {
  return (
    <CrudLayout
      eyebrow="Testimonials"
      title="Testimonials management foundation"
      description="This future module can reuse the shared admin CRUD structure without adding new dashboard patterns."
    >
      <EmptyState title="Testimonials CMS coming next" description="This area is reserved for future testimonial and success-story management." />
    </CrudLayout>
  );
}