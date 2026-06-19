import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Image } from "lucide-react";

export default function AdminGalleryPage() {
  return (
    <AdminLayout title="Gallery">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1">
          Upload and manage event photos
        </p>
        <p className="text-white/20 text-xs">
          Uploaded photos will be stored in object storage. Copy the URL to add them to the gallery component.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Uploader */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 border border-white/10 flex items-center justify-center">
              <Image className="w-3.5 h-3.5 text-[#c72d28]" />
            </div>
            <h2 className="text-white text-sm font-semibold">Upload Photos</h2>
          </div>
          <ObjectUploader />
        </div>

        {/* Instructions */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6">
          <h2 className="text-white text-sm font-semibold mb-4">How to Add to Gallery</h2>
          <ol className="space-y-4">
            {[
              "Upload your photo using the uploader on the left.",
              "Copy the public URL from the upload confirmation.",
              "Add the image to the gallery by updating the gallery items list in client/src/pages/gallery.tsx.",
              "Assign the correct volume label (VOL. 1, VOL. 2, or VOL. 3) for proper tab filtering.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="text-[#c72d28] font-black leading-none shrink-0 mt-0.5"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-white/40 text-xs leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          <div className="border-t border-white/10 mt-6 pt-6">
            <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-2">R2 Base URL</p>
            <p className="text-white/30 text-xs font-mono break-all">
              https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures/
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
