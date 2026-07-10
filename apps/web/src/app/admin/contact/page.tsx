import { AnimatedContent } from "@/components/effects/animated-content";
import { CrudLayout } from "@/components/admin/crud-layout";
import { ContactCmsManager } from "@/components/admin/contact-cms-manager";

export default function AdminContactPage() {
  return (
    <CrudLayout
      eyebrow="Contact"
      title="Contact CMS"
      description="Manage public contact details, social links, form availability, and submitted messages."
    >
      <AnimatedContent direction="up">
        <ContactCmsManager />
      </AnimatedContent>
    </CrudLayout>
  );
}
