import { AnimatedContent } from "@/components/effects/animated-content";
import { BorderGlow } from "@/components/effects/border-glow";
import { SiteShell } from "@/components/layout/site-shell";
import { GlassCard, SectionHeading } from "@/components/ui/primitives";
import { apiFetch } from "@/lib/api";

type GalleryImage = {
  id: string;
  title: string;
  caption?: string | null;
  category: string;
  image_url: string;
};

async function getGalleryImages() {
  try {
    const response = await apiFetch<{ data: GalleryImage[] }>("/gallery");
    return response.data;
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const galleryItems = await getGalleryImages();

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <AnimatedContent direction="left">
          <SectionHeading eyebrow="Gallery" title="A masonry layout designed to feel like a curated visual archive." description="Categories, caption reveals, and fullscreen expansion are represented here with a polished grid." />
        </AnimatedContent>
        {galleryItems.length === 0 ? (
          <GlassCard className="mt-10">
            <p className="text-sm text-slate-600">No gallery images are available yet.</p>
          </GlassCard>
        ) : (
          <div className="mt-10 columns-1 gap-5 md:columns-2 xl:columns-3">
            {galleryItems.map((item) => (
              <AnimatedContent key={item.id} direction="up">
                <BorderGlow className="mb-5 break-inside-avoid">
                  <GlassCard className="p-3">
                    <img src={item.image_url} alt={item.title} className="w-full rounded-[1.1rem] object-cover" />
                    <div className="px-2 py-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">{item.category}</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{item.title}</p>
                      {item.caption ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.caption}</p> : null}
                    </div>
                  </GlassCard>
                </BorderGlow>
              </AnimatedContent>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
