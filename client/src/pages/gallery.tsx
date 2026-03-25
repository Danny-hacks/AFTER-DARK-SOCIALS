import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

// Vol 2 — professional event photos
import vol2_1 from "@assets/vol2_4T7A9200.jpg";
import vol2_2 from "@assets/vol2_4T7A9259.jpg";
import vol2_3 from "@assets/vol2_4T7A9366.jpg";
import vol2_4 from "@assets/vol2_4T7A9396.jpg";
import vol2_5 from "@assets/vol2_4T7A9397.jpg";
import vol2_6 from "@assets/vol2_4T7A9398.jpg";
import vol2_7 from "@assets/vol2_4T7A9422.jpg";
import aftrBwImage from "@assets/IMG_6112_1774435245159.jpg";

// Vol 1 — event photos
import vol1_ss1 from "@assets/vol1_Screenshot_2026-03-25_at_19.43.10.png";
import vol1_ss2 from "@assets/vol1_Screenshot_2026-03-25_at_19.43.41.png";
import vol1_ss3 from "@assets/vol1_Screenshot_2026-03-25_at_20.01.14.png";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djLuvleshImage from "@assets/DJ LUVLESH_1757156832389.jpg";
import djStevoImage from "@assets/STEVOTHEDJ_1757156832391.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";

const galleryItems = [
  // Vol 2 — shown first (most recent)
  { id: 1,  src: vol2_1,       alt: "AFTR Vol. 2 — The Crowd",      vol: "VOL. 2", date: "Jan 2026" },
  { id: 2,  src: vol2_2,       alt: "AFTR Vol. 2 — On Stage",       vol: "VOL. 2", date: "Jan 2026" },
  { id: 3,  src: vol2_3,       alt: "AFTR Vol. 2 — The Night",      vol: "VOL. 2", date: "Jan 2026" },
  { id: 4,  src: vol2_4,       alt: "AFTR Vol. 2 — The Energy",     vol: "VOL. 2", date: "Jan 2026" },
  { id: 5,  src: vol2_5,       alt: "AFTR Vol. 2 — The Dancefloor", vol: "VOL. 2", date: "Jan 2026" },
  { id: 6,  src: vol2_6,       alt: "AFTR Vol. 2 — The Vibes",      vol: "VOL. 2", date: "Jan 2026" },
  { id: 7,  src: vol2_7,       alt: "AFTR Vol. 2 — The Moment",     vol: "VOL. 2", date: "Jan 2026" },
  { id: 8,  src: aftrBwImage,  alt: "AFTR Vol. 2 — Flyer",          vol: "VOL. 2", date: "Jan 2026" },
  // Vol 1
  { id: 9,  src: vol1_ss1,     alt: "AFTR Vol. 1 — The Night",      vol: "VOL. 1", date: "Sept 2025" },
  { id: 10, src: vol1_ss2,     alt: "AFTR Vol. 1 — The Energy",     vol: "VOL. 1", date: "Sept 2025" },
  { id: 11, src: vol1_ss3,     alt: "AFTR Vol. 1 — The Crowd",      vol: "VOL. 1", date: "Sept 2025" },
  { id: 12, src: djAlvinImage, alt: "DJ ALVIN — Vol. 1",             vol: "VOL. 1", date: "Sept 2025" },
  { id: 13, src: djLuvleshImage, alt: "DJ LUVLESH — Vol. 1",        vol: "VOL. 1", date: "Sept 2025" },
  { id: 14, src: djStevoImage, alt: "STEVOTHEDJ — Vol. 1",           vol: "VOL. 1", date: "Sept 2025" },
  { id: 15, src: djSwayImage,  alt: "DJ SWAY — Vol. 1",              vol: "VOL. 1", date: "Sept 2025" },
  { id: 16, src: djAfrokeyzImage, alt: "DJ AFROKEYZ — Vol. 1",      vol: "VOL. 1", date: "Sept 2025" },
];

function Lightbox({ items, index, onClose, onPrev, onNext }: {
  items: typeof galleryItems;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center"
      onClick={onClose}
      data-testid="lightbox-overlay"
    >
      <button
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
        onClick={onClose}
        data-testid="lightbox-close"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        className="absolute left-4 sm:left-8 text-white/30 hover:text-white transition-colors p-2 z-10"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        data-testid="lightbox-prev"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <div
        className="max-w-4xl max-h-[85vh] mx-16 sm:mx-20 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-contain max-h-[78vh]"
          data-testid="lightbox-image"
        />
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">{item.vol}</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] uppercase tracking-wider">{item.date}</span>
          <span className="text-white/15 text-[10px] ml-auto">{index + 1} / {items.length}</span>
        </div>
      </div>

      <button
        className="absolute right-4 sm:right-8 text-white/30 hover:text-white transition-colors p-2 z-10"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        data-testid="lightbox-next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}

export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vol1' | 'vol2'>('all');

  const filters = [
    { key: 'all' as const, label: 'All' },
    { key: 'vol2' as const, label: 'Vol. 2' },
    { key: 'vol1' as const, label: 'Vol. 1' },
  ];

  const filtered = activeFilter === 'all'
    ? galleryItems
    : activeFilter === 'vol2'
    ? galleryItems.filter(i => i.vol === 'VOL. 2')
    : galleryItems.filter(i => i.vol === 'VOL. 1');

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/">
              <img src={logoImage} alt="AFTR" className="h-10 sm:h-12 w-auto" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors"
              data-testid="gallery-back-home"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 sm:py-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="block w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Archive</span>
          </div>

          <h1
            className="text-7xl sm:text-9xl font-black text-white leading-none mb-6"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
            data-testid="gallery-title"
          >
            THE<br />GALLERY.
          </h1>
          <p className="text-white/30 text-sm max-w-md mb-12">
            Moments from every edition — the crowd, the DJs, the energy, all captured.
          </p>

          {/* Filters */}
          <div className="flex gap-0 border border-white/10 w-fit" data-testid="gallery-filters">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => { setActiveFilter(f.key); setLightboxIndex(null); }}
                className={`px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors border-r border-white/10 last:border-0 ${
                  activeFilter === f.key
                    ? 'bg-[#c72d28] text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`gallery-filter-${f.key}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1"
            data-testid="gallery-grid"
          >
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="relative group cursor-pointer overflow-hidden bg-[#0a0a0a] aspect-square"
                onClick={() => openLightbox(idx)}
                data-testid={`gallery-item-${item.id}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">{item.vol}</span>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{item.date}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-white/20 text-sm uppercase tracking-widest">
              No photos in this category yet.
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
}
