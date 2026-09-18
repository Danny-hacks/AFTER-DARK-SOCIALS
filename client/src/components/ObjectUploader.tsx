import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, CheckCircle } from "lucide-react";

interface ObjectUploaderProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onComplete?: (objectPath: string) => void;
  buttonClassName?: string;
  children: ReactNode;
}

const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.82;

// Resize + re-encode an image client-side so uploads aren't shipped at full
// camera resolution. Videos are left untouched — no client-side transcoding.
function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.\w+$/, "") + ".jpg",
            { type: "image/jpeg" },
          );
          resolve(compressed);
        },
        "image/jpeg",
        IMAGE_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };

    img.src = url;
  });
}

export function ObjectUploader({
  maxFileSize = 104857600, // 100MB default for videos
  allowedFileTypes = ["video/*"],
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wantsVideo = allowedFileTypes.some((t) => t.startsWith("video"));

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      setError(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      return;
    }

    if (file.type.startsWith("video/") && file.type !== "video/mp4") {
      setError("Please export as MP4 — other formats (like .MOV) often won't play in browsers.");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      if (file.type.startsWith("image/")) {
        file = await compressImage(file);
      }

      const extension = file.name.split(".").pop() || "";
      const response = await apiRequest("POST", "/api/objects/upload", { fileExtension: extension });
      const data = await response.json();

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setSuccess(true);
          setUploading(false);
          onComplete?.(data.objectPath);
          setTimeout(() => {
            setShowModal(false);
            setSuccess(false);
            setProgress(0);
          }, 1500);
        } else {
          setError('Upload failed. Please try again.');
          setUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.');
        setUploading(false);
      });

      xhr.open('PUT', data.uploadURL);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to start upload. Please try again.');
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setShowModal(false);
    setError(null);
    setSuccess(false);
    setProgress(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} type="button">
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{wantsVideo ? "Upload Video" : "Upload Photo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-green-500">
                <CheckCircle className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold">Upload Complete!</p>
              </div>
            ) : uploading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <Upload className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  Uploading... {progress}%
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <label
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  data-testid="file-drop-zone"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to select {wantsVideo ? "an MP4 video file" : "a photo"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Max {Math.round(maxFileSize / 1024 / 1024)}MB
                    {!wantsVideo && " · auto-resized on upload"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={wantsVideo ? "video/mp4" : allowedFileTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="file-input"
                  />
                </label>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <X className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
