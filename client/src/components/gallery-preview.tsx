import { Link } from "wouter";
import vol2_1 from "@assets/vol2_4T7A9200.jpg";
import vol2_2 from "@assets/vol2_4T7A9259.jpg";
import vol2_3 from "@assets/vol2_4T7A9366.jpg";
import vol2_4 from "@assets/vol2_4T7A9396.jpg";
import vol2_5 from "@assets/vol2_4T7A9422.jpg";

const previewPhotos = [
  { src: vol2_1, vol: "VOL. 2", date: "Jan 2026", alt: "AFTR Vol. 2 — The Crowd",      key: "p1" },
  { src: vol2_2, vol: "VOL. 2", date: "Jan 2026", alt: "AFTR Vol. 2 — On Stage",       key: "p2" },
  { src: vol2_3, vol: "VOL. 2", date: "Jan 2026", alt: "AFTR Vol. 2 — The Night",      key: "p3" },
  { src: vol2_4, vol: "VOL. 2", date: "Jan 2026", alt: "AFTR Vol. 2 — The Energy",     key: "p4" },
  { src: vol2_5, vol: "VOL. 2", date: "Jan 2026", alt: "AFTR Vol. 2 — The Moment",     key: "p5" },
];

function PhotoItem({ photo, className, style }: {
  photo: typeof previewPhotos[0];
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#0a0a0a] group cursor-pointer ${className ?? ''}`} style={style}>
      <img
        src={photo.src}
        alt={photo.alt}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold block">{photo.vol}</span>
        <span className="text-white/60 text-[10px] uppercase tracking-wider">{photo.date}</span>
      </div>
    </div>
  );
}

export default function GalleryPreview() {
  return (
    <section id="gallery-preview" className="bg-black py-24 sm:py-32" data-testid="gallery-preview-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-6">
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
            <p className="text-white/40 text-sm mt-4 max-w-sm leading-relaxed" data-testid="gallery-preview-subtext">
              A glimpse into the nights that moved us. Every flash, every face, every memory — captured.
            </p>
          </div>

          <Link
            href="/gallery"
            className="hidden sm:inline-flex flex-shrink-0 items-center gap-4 bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold px-7 py-4 hover:bg-[#a82421] transition-colors"
            data-testid="gallery-view-all-button"
          >
            View All Photos
            <span className="w-6 h-px bg-white/60" />
          </Link>
        </div>

        {/* Desktop masonry grid */}
        <div
          className="hidden sm:grid gap-1"
          style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "280px 200px" }}
          data-testid="gallery-preview-grid"
        >
          <PhotoItem photo={previewPhotos[0]} style={{ gridRow: "1 / 3" }} />
          {previewPhotos.slice(1).map((photo) => (
            <PhotoItem key={photo.key} photo={photo} />
          ))}
        </div>

        {/* Mobile grid */}
        <div className="sm:hidden space-y-1" data-testid="gallery-preview-grid-mobile">
          <div className="relative overflow-hidden bg-[#0a0a0a] aspect-[4/3]">
            <img
              src={previewPhotos[0].src}
              alt={previewPhotos[0].alt}
              className="w-full h-full object-cover grayscale"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold block">{previewPhotos[0].vol}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{previewPhotos[0].date}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {previewPhotos.slice(1).map((photo) => (
              <div key={photo.key} className="relative overflow-hidden bg-[#0a0a0a] aspect-square">
                <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover grayscale" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 sm:hidden">
          <Link
            href="/gallery"
            className="flex items-center justify-center gap-3 w-full bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#a82421] transition-colors"
          >
            View All Photos
          </Link>
        </div>

      </div>
    </section>
  );
}
