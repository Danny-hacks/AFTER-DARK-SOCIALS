import { Link } from "wouter";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/AFTR_black_white_1766249732057.jpg";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";

const previewPhotos = [
  {
    src: aftrEventImage,
    vol: "VOL. 1",
    date: "Sept 2025",
    alt: "AFTR Vol. 1 — The Dancefloor",
    gridArea: "photo1",
  },
  {
    src: aftrVol2Image,
    vol: "VOL. 2",
    date: "Jan 2026",
    alt: "AFTR Vol. 2 — The Night",
    gridArea: "photo2",
  },
  {
    src: djAlvinImage,
    vol: "VOL. 1",
    date: "Sept 2025",
    alt: "DJ ALVIN",
    gridArea: "photo3",
  },
  {
    src: djSwayImage,
    vol: "VOL. 1",
    date: "Sept 2025",
    alt: "DJ SWAY",
    gridArea: "photo4",
  },
  {
    src: djAfrokeyzImage,
    vol: "VOL. 1",
    date: "Sept 2025",
    alt: "DJ AFROKEYZ",
    gridArea: "photo5",
  },
];

export default function GalleryPreview() {
  return (
    <section id="gallery-preview" className="bg-black py-24 sm:py-32" data-testid="gallery-preview-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header row */}
        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            {/* Section tag */}
            <div className="flex items-center gap-4 mb-6">
              <span className="section-line" />
              <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em] font-medium">
                Gallery
              </span>
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
            className="flex-shrink-0 flex items-center gap-4 bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold px-7 py-4 hover:bg-[#a82421] transition-colors"
            data-testid="gallery-view-all-button"
          >
            View All Photos
            <span className="w-6 h-px bg-white/60" />
          </Link>
        </div>

        {/* Masonry preview grid */}
        <div
          className="gap-1 hidden sm:grid"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "280px 200px",
          }}
          data-testid="gallery-preview-grid"
        >
          {/* Featured — spans both rows */}
          <div
            className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer"
            style={{ gridRow: "1 / 3" }}
            data-testid="gallery-preview-item-0"
          >
            <img
              src={previewPhotos[0].src}
              alt={previewPhotos[0].alt}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold block">
                {previewPhotos[0].vol}
              </span>
              <span className="text-white/60 text-[10px] uppercase tracking-wider">
                {previewPhotos[0].date}
              </span>
            </div>
          </div>

          {/* Items 2–5 */}
          {previewPhotos.slice(1).map((photo, idx) => (
            <div
              key={photo.gridArea}
              className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer"
              data-testid={`gallery-preview-item-${idx + 1}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold block">
                  {photo.vol}
                </span>
                <span className="text-white/60 text-[10px] uppercase tracking-wider">
                  {photo.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile — simple 2-col grid */}
        <div className="grid grid-cols-2 gap-1 sm:hidden" data-testid="gallery-preview-grid-mobile">
          {previewPhotos.map((photo, idx) => (
            <div
              key={photo.gridArea}
              className={`relative overflow-hidden bg-[#0a0a0a] aspect-square ${idx === 0 ? 'col-span-2' : ''}`}
              data-testid={`gallery-preview-mobile-item-${idx}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA — mobile only */}
        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-3 bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold px-7 py-4 hover:bg-[#a82421] transition-colors"
          >
            View All Photos
          </Link>
        </div>

      </div>
    </section>
  );
}
