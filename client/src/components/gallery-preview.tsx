import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import vol2_1 from "@assets/vol2_4T7A9200.jpg";
import vol3_1 from "@assets/Serge_74_1777968315600.jpg";
import vol3_2 from "@assets/Serge_75_1777968402515.jpg";
import vol3_3 from "@assets/Serge_83_1777968402525.jpg";
import vol3_4 from "@assets/Serge_103_1777968402526.jpg";

const photos = [
  { src: vol3_3, alt: "AFTR Vol. 3 — Full Capacity", vol: "VOL. 3", date: "Apr 2026", size: "large" },
  { src: vol3_1, alt: "AFTR Vol. 3 — The Stage",     vol: "VOL. 3", date: "Apr 2026", size: "small" },
  { src: vol3_2, alt: "AFTR Vol. 3 — The Crowd",     vol: "VOL. 3", date: "Apr 2026", size: "small" },
  { src: vol3_4, alt: "AFTR Vol. 3 — The Vibe",      vol: "VOL. 3", date: "Apr 2026", size: "small" },
  { src: vol2_1, alt: "AFTR Vol. 2 — The Energy",    vol: "VOL. 2", date: "Jan 2026", size: "small" },
];

export default function GalleryPreview() {
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
              Every flash, every face, every memory — captured across all three AFTR volumes.
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
              src={photos[0].src}
              alt={photos[0].alt}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.3em] font-bold block mb-1">{photos[0].vol}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{photos[0].date}</span>
            </div>
          </div>

          {/* Top right 2 */}
          {photos.slice(1, 3).map((photo) => (
            <div key={photo.alt} className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                <span className="text-white text-[9px] uppercase tracking-[0.25em] font-bold block">{photo.vol}</span>
              </div>
            </div>
          ))}

          {/* Bottom right 2 */}
          {photos.slice(3, 5).map((photo) => (
            <div key={photo.alt} className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                <span className="text-white text-[9px] uppercase tracking-[0.25em] font-bold block">{photo.vol}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile — stacked */}
        <div className="sm:hidden space-y-1" data-testid="gallery-preview-grid-mobile">
          <div className="relative overflow-hidden bg-[#0a0a0a] aspect-[4/3]">
            <img src={photos[0].src} alt={photos[0].alt} className="w-full h-full object-cover grayscale" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.3em] font-bold block mb-1">{photos[0].vol}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{photos[0].date}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {photos.slice(1).map((photo) => (
              <div key={photo.alt} className="relative overflow-hidden bg-[#0a0a0a] aspect-square">
                <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover grayscale" loading="lazy" />
              </div>
            ))}
          </div>
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