import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { MediaLightbox } from "@/components/media-lightbox";
import type { GalleryPhoto } from "@shared/schema";

function fmtDate(iso: string | Date | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

const PAGE_SIZE = 12;
type MediaTab = "photos" | "videos";

function getInitialVolume(): string {
  if (typeof window === "undefined") return "all";
  return new URLSearchParams(window.location.search).get("vol") || "all";
}

export default function GalleryPage() {
  usePageTitle("Gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mediaTab, setMediaTab] = useState<MediaTab>("photos");
  const [activeFilter, setActiveFilter] = useState<string>(getInitialVolume);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: allPhotos = [], isLoading } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/gallery"],
    select: (data) => data.photos ?? [],
  });

  const photos = useMemo(() => allPhotos.filter((p) => (p.section ?? "aftr") === "aftr"), [allPhotos]);
  const byTab = useMemo(
    () => photos.filter((p) => (p.type === "video") === (mediaTab === "videos")),
    [photos, mediaTab],
  );

  const volumes = useMemo(
    () => Array.from(new Set(byTab.map((p) => p.volume))).sort().reverse(),
    [byTab],
  );
  const filters = [{ key: "all", label: "All" }, ...volumes.map((v) => ({ key: v, label: v }))];

  const filtered = activeFilter === "all" ? byTab : byTab.filter((p) => p.volume === activeFilter);

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const selectTab = (tab: MediaTab) => {
    setMediaTab(tab);
    setActiveFilter("all");
    setLightboxIndex(null);
    setVisibleCount(PAGE_SIZE);
  };

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

      <main className="pt-28 sm:pt-36">
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

          {/* Photos / Videos tab */}
          <div className="flex gap-0 border border-white/10 w-fit mb-4" data-testid="gallery-media-tabs">
            {(["photos", "videos"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => selectTab(tab)}
                className={`px-8 py-3 text-[10px] uppercase tracking-[0.25em] font-bold transition-colors border-r border-white/10 last:border-0 ${
                  mediaTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
                data-testid={`gallery-tab-${tab}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Volume filters */}
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
                <motion.button
                  key={item.id}
                  type="button"
                  className="relative group cursor-pointer overflow-hidden bg-[#0a0a0a] aspect-square text-left"
                  onClick={() => openLightbox(filtered.indexOf(item))}
                  data-testid={`gallery-item-${item.id}`}
                  aria-label={`View ${item.type === "video" ? "video" : "photo"}: ${item.alt || item.volume}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (idx % 4) * 0.06 }}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      preload="metadata"
                      muted
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-white/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">{item.volume}</span>
                    <span className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{fmtDate(item.createdAt)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24 text-white/20 text-sm uppercase tracking-widest">
              No {mediaTab} in this category yet.
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
          <MediaLightbox
            items={filtered}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
            renderCaption={(item, index) => (
              <>
                <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">{item.volume}</span>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-white/30 text-[10px] uppercase tracking-wider">{fmtDate(item.createdAt)}</span>
              </>
            )}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
