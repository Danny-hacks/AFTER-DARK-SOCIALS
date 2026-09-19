import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface LightboxItem {
  id: string;
  url: string;
  alt: string;
  type?: string | null;
}

export function MediaLightbox<T extends LightboxItem>({
  items,
  index,
  onClose,
  onPrev,
  onNext,
  renderCaption,
}: {
  items: T[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  renderCaption?: (item: T, index: number, total: number) => ReactNode;
}) {
  const item = items[index];
  if (!item) return null;
  const isVideo = item.type === "video";

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
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        className="absolute left-4 sm:left-8 text-white/30 hover:text-white transition-colors p-2 z-10"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        data-testid="lightbox-prev"
        aria-label="Previous item"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <div
        className="max-w-4xl max-h-[85vh] mx-16 sm:mx-20 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isVideo ? (
            <motion.video
              key={item.id}
              src={item.url}
              controls
              autoPlay
              playsInline
              className="w-full h-full max-h-[78vh] bg-black"
              data-testid="lightbox-video"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
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
          )}
        </AnimatePresence>
        <div className="mt-4 flex items-center gap-3">
          {renderCaption ? renderCaption(item, index, items.length) : null}
          <span className="text-white/15 text-[10px] ml-auto">{index + 1} / {items.length}</span>
        </div>
      </div>

      <button
        className="absolute right-4 sm:right-8 text-white/30 hover:text-white transition-colors p-2 z-10"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        data-testid="lightbox-next"
        aria-label="Next item"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </motion.div>
  );
}
