import { Link } from "wouter";
import vol2_1 from "@assets/vol2_4T7A9200.jpg";
import vol3_1 from "@assets/Serge_74_1777968315600.jpg";
import vol3_2 from "@assets/Serge_75_1777968402515.jpg";
import vol3_3 from "@assets/Serge_83_1777968402525.jpg";
import vol3_4 from "@assets/Serge_103_1777968402526.jpg";

const heroPhoto = {
  src: vol3_3,
  alt: "AFTR Vol. 3 — Full Capacity",
  vol: "VOL. 3",
  date: "Apr 2026",
};

const gridPhotos = [
  { src: vol3_1, alt: "AFTR Vol. 3 — The Stage",  vol: "VOL. 3", date: "Apr 2026" },
  { src: vol3_2, alt: "AFTR Vol. 3 — The Crowd",  vol: "VOL. 3", date: "Apr 2026" },
  { src: vol3_4, alt: "AFTR Vol. 3 — The Vibe",   vol: "VOL. 3", date: "Apr 2026" },
  { src: vol2_1, alt: "AFTR Vol. 2 — The Energy", vol: "VOL. 2", date: "Jan 2026" },
];

function HeroPhoto() {
  return (
    <div className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer" style={{ gridRow: "1 / 3" }}>
      <img
        src={heroPhoto.src}
        alt={heroPhoto.alt}
        className="w-full h-full object-cover grayscale group-hover:scale-105 transition-all duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[#c72d28]/0 group-hover:bg-[#c72d28]/30 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
        <span className="text-white text-[9px] uppercase tracking-[0.3em] font-bold block opacity-80">{heroPhoto.vol}</span>
        <span className="text-white/60 text-[10px] uppercase tracking-wider">{heroPhoto.date}</span>
      </div>
    </div>
  );
}

function GridPhoto({ photo }: { photo: typeof gridPhotos[0] }) {
  return (
    <div className="relative overflow-hidden bg-[#0a0a0a] group cursor-pointer">
      <img
        src={photo.src}
        alt={photo.alt}
        className="w-full h-full object-cover grayscale group-hover:scale-105 transition-all duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[#c72d28]/0 group-hover:bg-[#c72d28]/30 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
        <span className="text-white text-[9px] uppercase tracking-[0.25em] font-bold block opacity-80">{photo.vol}</span>
      </div>
    </div>
  );
}

export default function GalleryPreview() {
  return (
    <section id="gallery-preview" className="bg-black py-24 sm:py-32" data-testid="gallery-preview-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Heading */}
        <div className="mb-10 sm:mb-14">
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

        {/* Desktop asymmetric grid */}
        <div
          className="hidden sm:grid gap-1"
          style={{
            gridTemplateColumns: "3fr 2fr",
            gridTemplateRows: "320px 320px",
          }}
          data-testid="gallery-preview-grid"
        >
          <HeroPhoto />

          {/* Right 2×2 */}
          <div className="grid grid-cols-2 gap-1" style={{ gridRow: "1 / 3" }}>
            {gridPhotos.map((photo) => (
              <GridPhoto key={photo.alt} photo={photo} />
            ))}
          </div>
        </div>

        {/* Mobile grid */}
        <div className="sm:hidden space-y-1" data-testid="gallery-preview-grid-mobile">
          <div className="relative overflow-hidden bg-[#0a0a0a] aspect-[4/3]">
            <img
              src={heroPhoto.src}
              alt={heroPhoto.alt}
              className="w-full h-full object-cover grayscale"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold block">{heroPhoto.vol}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{heroPhoto.date}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {gridPhotos.map((photo) => (
              <div key={photo.alt} className="relative overflow-hidden bg-[#0a0a0a] aspect-square">
                <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover grayscale" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Full-width CTA */}
        <Link
          href="/gallery"
          className="mt-1 flex items-center justify-center gap-4 w-full bg-[#c72d28] text-white text-xs uppercase tracking-[0.25em] font-bold py-5 hover:bg-[#a82421] transition-colors"
          data-testid="gallery-view-all-button"
        >
          View All Photos
          <span className="text-white/60">→</span>
        </Link>

      </div>
    </section>
  );
}
