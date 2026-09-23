import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import type { GalleryPhoto } from "@shared/schema";

function fmtDate(iso: string | Date | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function GalleryPreview() {
  // Most recent AFTR photos, whatever edition they're from — this used to
  // be 5 images hardcoded to Vol. 2/Vol. 3 specifically, which stayed
  // "current" only until the next event.
  const { data: allPhotos = [] } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/gallery"],
    select: (data) => data.photos ?? [],
  });

  const photos = [...allPhotos]
    .filter((p) => (p.section ?? "aftr") === "aftr" && p.type !== "video")
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  if (photos.length === 0) return null;

  const [hero, ...rest] = photos;
  const topRight = rest.slice(0, 2);
  const bottomRight = rest.slice(2, 4);

  return (
    <section id="gallery-preview" className="bg-black py-24 sm:py-32 border-t border-white/10" data-testid="gallery-preview-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="section-line" />
              <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em] font-medium">Gallery</span>
            </div>
            <h2
              className="text-6xl sm:text-8xl font-black text-white leading-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              data-testid="gallery-preview-heading"
            >
              THE<br />MOMENTS.
            </h2>
          </div>
          <div className="sm:pb-3 max-w-xs">
            <p className="text-white/40 text-sm leading-relaxed mb-6" data-testid="gallery-preview-subtext">
              Every flash, every face, every memory — captured across every AFTR night.
            </p>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 text-white/40 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors font-medium"
            >
              View all photos
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Desktop — editorial mosaic */}
        <div
          className="hidden sm:grid gap-1"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "340px 280px",
          }}
          data-testid="gallery-preview-grid"
        >
          {/* Hero — spans 2 rows */}
          <div
            className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer"
            style={{ gridRow: "1 / 3" }}
          >
            <img
              src={hero.url}
              alt={hero.alt || hero.volume}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.3em] font-bold block mb-1">{hero.volume}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{fmtDate(hero.createdAt)}</span>
            </div>
          </div>

          {/* Top right 2 */}
          {topRight.map((photo) => (
            <div key={photo.id} className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer">
              <img
                src={photo.url}
                alt={photo.alt || photo.volume}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                <span className="text-white text-[9px] uppercase tracking-[0.25em] font-bold block">{photo.volume}</span>
              </div>
            </div>
          ))}

          {/* Bottom right 2 */}
          {bottomRight.map((photo) => (
            <div key={photo.id} className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer">
              <img
                src={photo.url}
                alt={photo.alt || photo.volume}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                <span className="text-white text-[9px] uppercase tracking-[0.25em] font-bold block">{photo.volume}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile — stacked */}
        <div className="sm:hidden space-y-1" data-testid="gallery-preview-grid-mobile">
          <div className="relative overflow-hidden bg-[#0a0a0a] aspect-[4/3]">
            <img src={hero.url} alt={hero.alt || hero.volume} className="w-full h-full object-cover grayscale" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.3em] font-bold block mb-1">{hero.volume}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{fmtDate(hero.createdAt)}</span>
            </div>
          </div>
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-1">
              {rest.map((photo) => (
                <div key={photo.id} className="relative overflow-hidden bg-[#0a0a0a] aspect-square">
                  <img src={photo.url} alt={photo.alt || photo.volume} className="w-full h-full object-cover grayscale" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full CTA bar */}
        <Link
          href="/gallery"
          className="mt-1 flex items-center justify-center gap-4 w-full bg-[#c72d28] text-white text-xs uppercase tracking-[0.25em] font-bold py-5 hover:bg-[#a82421] transition-colors group"
          data-testid="gallery-view-all-button"
        >
          View All Photos
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

      </div>
    </section>
  );
}
