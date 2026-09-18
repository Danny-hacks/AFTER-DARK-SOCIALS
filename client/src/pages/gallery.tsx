import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { GalleryPhoto } from "@shared/schema";

function fmtDate(iso: string | Date | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function Lightbox({ items, index, onClose, onPrev, onNext }: {
  items: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center"
      onClick={onClose}
      data-testid="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
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
        <AnimatePresence mode="wait">
          <motion.img
            key={item.id}
            src={item.url}
            alt={item.alt}
            className="w-full h-full object-contain max-h-[78vh]"
            data-testid="lightbox-image"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">{item.volume}</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-white/30 text-[10px] uppercase tracking-wider">{fmtDate(item.createdAt)}</span>
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
    </motion.div>
  );
}

const PAGE_SIZE = 12;

function getInitialVolume(): string {
  if (typeof window === "undefined") return "all";
  return new URLSearchParams(window.location.search).get("vol") || "all";
}

export default function GalleryPage() {
  usePageTitle("Gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(getInitialVolume);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: photos = [], isLoading } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/gallery"],
    select: (data) => data.photos ?? [],
  });

  const volumes = useMemo(
    () => Array.from(new Set(photos.map((p) => p.volume))).sort().reverse(),
    [photos],
  );
  const filters = [{ key: "all", label: "All" }, ...volumes.map((v) => ({ key: v, label: v }))];

  const filtered = activeFilter === "all" ? photos : photos.filter((p) => p.volume === activeFilter);

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const selectFilter = (key: string) => {
    setActiveFilter(key);
    setLightboxIndex(null);
    setVisibleCount(PAGE_SIZE);
  };

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : null);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-24 sm:pt-32">
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
          {volumes.length > 0 && (
            <div className="flex gap-0 border border-white/10 w-fit flex-wrap" data-testid="gallery-filters">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => selectFilter(f.key)}
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
          )}
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1"
              data-testid="gallery-grid"
            >
              {displayed.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="relative group cursor-pointer overflow-hidden bg-[#0a0a0a] aspect-square"
                  onClick={() => openLightbox(filtered.indexOf(item))}
                  data-testid={`gallery-item-${item.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (idx % 4) * 0.06 }}
                >
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">{item.volume}</span>
                    <span className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{fmtDate(item.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24 text-white/20 text-sm uppercase tracking-widest">
              No photos in this category yet.
            </div>
          )}

          {hasMore && (
            <div className="flex flex-col items-center gap-3 mt-12">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="border border-white/15 text-white/50 hover:text-white hover:border-white/40 text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-3.5 transition-colors w-full sm:w-auto"
                data-testid="gallery-load-more"
              >
                Load More
              </button>
              <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">
                {displayed.length} of {filtered.length}
              </span>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filtered}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
