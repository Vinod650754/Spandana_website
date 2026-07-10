import { AnimatedContent } from "@/components/effects/animated-content";
import { SectionHeading } from "@/components/ui/primitives";
import { GalleryUploader } from "@/components/admin/gallery-uploader";

export default function AdminGalleryPage() {
  return (
    <section className="space-y-8">
      <AnimatedContent direction="left">
        <SectionHeading eyebrow="Manage Gallery" title="Bulk upload, categorize, and organize images." description="Drag and drop images or click to browse. Supports up to 50 images per batch. All uploads are stored securely in Cloudinary." />
      </AnimatedContent>
      <GalleryUploader />
    </section>
  );
}
