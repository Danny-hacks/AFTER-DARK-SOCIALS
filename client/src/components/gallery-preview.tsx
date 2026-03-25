import { Link } from "wouter";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/IMG_6112_1774435245159.jpg";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";

const previewPhotos = [
  { src: aftrEventImage, vol: "VOL. 1", date: "Sept 2025", alt: "AFTR Vol. 1 — The Dancefloor", key: "p1" },
  { src: aftrVol2Image, vol: "VOL. 2", date: "Jan 2026", alt: "AFTR Vol. 2 — The Night", key: "p2" },
  { src: djAlvinImage, vol: "VOL. 1", date: "Sept 2025", alt: "DJ ALVIN", key: "p3" },
  { src: djSwayImage, vol: "VOL. 1", date: "Sept 2025", alt: "DJ SWAY", key: "p4" },
  { src: djAfrokeyzImage, vol: "VOL. 1", date: "Sept 2025", alt: "DJ AFROKEYZ", key: "p5" },
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
          <PhotoItem photo={previewPhotos[0]} style={{ gridRow: "1 / 3" }} data-testid="gallery-preview-item-0" />
          {previewPhotos.slice(1).map((photo) => (
            <PhotoItem key={photo.key} photo={photo} />
          ))}
        </div>

        {/* Mobile grid — 2 col with featured at top */}
        <div className="sm:hidden space-y-1" data-testid="gallery-preview-grid-mobile">
          {/* Featured full-width */}
          <div className="relative overflow-hidden bg-[#0a0a0a] aspect-[4/3]">
            <img
              src={previewPhotos[0].src}
              alt={previewPhotos[0].alt}
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold block">{previewPhotos[0].vol}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{previewPhotos[0].date}</span>
            </div>
          </div>
          {/* 2×2 grid of remaining */}
          <div className="grid grid-cols-2 gap-1">
            {previewPhotos.slice(1).map((photo) => (
              <div key={photo.key} className="relative overflow-hidden bg-[#0a0a0a] aspect-square">
                <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover grayscale" />
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
