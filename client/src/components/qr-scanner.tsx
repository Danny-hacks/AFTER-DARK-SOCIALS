import { useRef, useEffect, useState } from "react";
import QrScanner from "qr-scanner";
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@shared/schema";

interface QRScannerProps {
  onTicketFound: (ticket: Ticket | null) => void;
  onClose: () => void;
}

const QR_PREFIX = "AFTR-TICKET-";

export function QRScanner({ onTicketFound, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  // The scan-detection callback is created once, at mount, when the
  // QrScanner instance is constructed — reading these through refs (kept
  // in sync every render below) means it always calls the LATEST
  // onTicketFound/onClose without needing to tear down and recreate the
  // camera/scanner every time the parent re-renders and passes a new
  // inline function, which was happening on every single successful scan
  // (setScannedTicket in the parent -> new onTicketFound identity -> this
  // effect re-ran -> old scanner often failed to actually stop, since its
  // cleanup was reading stale state instead of the instance it just made).
  const onTicketFoundRef = useRef(onTicketFound);
  const onCloseRef = useRef(onClose);
  onTicketFoundRef.current = onTicketFound;
  onCloseRef.current = onClose;

  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    if (!videoRef.current) return;

    const initializeScanner = async () => {
      try {
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          toast({
            title: "No Camera Found",
            description: "No camera detected on this device",
            variant: "destructive",
          });
          return;
        }

        const scanner = new QrScanner(
          videoRef.current!,
          async (result) => {
            console.log("QR Code detected:", result.data);
            setLastScanResult(result.data);

            // Parse the QR code data (format: AFTR-TICKET-{qrCode}). qrCode
            // is itself a UUID (contains hyphens), so the lookup value is
            // everything after the fixed prefix — not a naive split("-").
            if (result.data.startsWith(QR_PREFIX)) {
              // Stop scanning temporarily to prevent multiple scans
              scanner.stop();
              setScanning(false);

              try {
                const qrCode = result.data.slice(QR_PREFIX.length);

                if (qrCode) {
                  console.log("Scanning ticket:", { qrCode, fullData: result.data });

                  const response = await fetch(`/api/admin/tickets/qr/${qrCode}`, {
                    credentials: 'include'
                  });

                  if (response.ok) {
                    const data = await response.json();
                    // Pass the ticket through either way — an already-used
                    // ticket is a real, found ticket, not an invalid scan,
                    // so the caller can show "Already Checked In" rather
                    // than lumping it in with a not-found/invalid result.
                    setScanStatus(data.ticket.isUsed ? "error" : "success");
                    onTicketFoundRef.current(data.ticket);
                  } else {
                    setScanStatus("error");
                    onTicketFoundRef.current(null);
                    const errorData = await response.json().catch(() => ({}));
                    toast({
                      title: "Ticket Not Found",
                      description: errorData.error || "Invalid or expired ticket",
                      variant: "destructive",
                    });
                    console.log("Ticket lookup failed:", { qrCode, status: response.status });
                  }
                } else {
                  setScanStatus("error");
                  onTicketFoundRef.current(null);
                  toast({
                    title: "Invalid QR Code Format",
                    description: "This QR code is not a valid AFTR ticket",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error("Error processing QR code:", error);
                setScanStatus("error");
                onTicketFoundRef.current(null);
                toast({
                  title: "Scan Error",
                  description: "Failed to process QR code. Please try again.",
                  variant: "destructive",
                });
              }
            } else {
              setScanStatus("error");
              onTicketFoundRef.current(null);
              toast({
                title: "Invalid QR Code",
                description: "This is not an AFTR ticket QR code",
                variant: "destructive",
              });
            }

            // Reset scan status after a delay
            setTimeout(() => setScanStatus("idle"), 3000);
          },
          {
            onDecodeError: (error) => {
              // Ignore decode errors as they happen constantly while scanning
              console.debug("QR decode error:", typeof error === 'string' ? error : error.message);
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment", // Use back camera on mobile
            maxScansPerSecond: 3, // Reduce scan frequency for better performance
            returnDetailedScanResult: true,
          }
        );

        if (cancelled) {
          scanner.destroy();
          return;
        }
        scannerRef.current = scanner;
        setReady(true);
      } catch (error) {
        console.error("Error initializing scanner:", error);
        if (!cancelled) {
          toast({
            title: "Scanner Initialization Failed",
            description: "Could not access camera. Please check permissions and try again.",
            variant: "destructive",
          });
        }
      }
    };

    initializeScanner();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        try {
          scannerRef.current.destroy();
        } catch (error) {
          console.error("Error destroying scanner:", error);
        }
        scannerRef.current = null;
      }
    };
    // Runs once on mount — onTicketFound/onClose are read through refs above
    // so a new inline function from the parent (e.g. after every scan)
    // never tears down and recreates the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current) {
      toast({
        title: "Scanner Not Ready",
        description: "Camera scanner is still initializing. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLastScanResult("");
      setScanStatus("idle");

      // Request camera permissions first with better options
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      // Clean up the permission test stream
      stream.getTracks().forEach(track => track.stop());

      await scannerRef.current.start();
      setScanning(true);

      toast({
        title: "Scanner Active",
        description: "Hold the camera steady over a QR code",
      });

    } catch (error: any) {
      console.error("Error starting scanner:", error);

      let errorMessage = "Unable to access camera. Please check permissions.";
      let title = "Camera Error";

      if (error.name === "NotAllowedError") {
        title = "Camera Permission Denied";
        errorMessage = "Please allow camera access in your browser settings and refresh the page.";
      } else if (error.name === "NotFoundError") {
        title = "No Camera Available";
        errorMessage = "No camera detected on this device.";
      } else if (error.name === "NotReadableError") {
        title = "Camera In Use";
        errorMessage = "Camera is being used by another application. Please close other apps and try again.";
      } else if (error.name === "OverconstrainedError") {
        title = "Camera Compatibility Issue";
        errorMessage = "Your camera doesn't support the required settings. Try a different device.";
      }

      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setScanning(false);
      setScanStatus("idle");
    }
  };

  const handleClose = () => {
    stopScanning();
    onCloseRef.current();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          QR Ticket Scanner
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          data-testid="button-close-scanner"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-lg object-cover"
            playsInline
            muted
          />

          {/* Scan Status Overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-50"></div>
            </div>
          )}

          {/* Status Indicator */}
          {scanStatus !== "idle" && (
            <div className="absolute top-2 right-2">
              {scanStatus === "success" ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Invalid
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!scanning ? (
            <Button
              onClick={startScanning}
              disabled={!ready}
              className="flex-1"
              data-testid="button-start-scanner"
            >
              <Camera className="w-4 h-4 mr-2" />
              {ready ? "Start Scanning" : "Initializing..."}
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="flex-1"
              data-testid="button-stop-scanner"
            >
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <strong>Last scan:</strong> {lastScanResult}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-1">Instructions:</p>
          <ul className="text-xs space-y-1">
            <li>• Point camera at the QR code on the ticket</li>
            <li>• Hold steady until the code is detected</li>
            <li>• Valid tickets are checked in automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
