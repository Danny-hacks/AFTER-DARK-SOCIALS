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

export function QRScanner({ onTicketFound, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    if (!videoRef.current) return;

    const initializeScanner = async () => {
      try {
        // Check if camera is available first
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
            if (!mounted) return; // Prevent processing if component unmounted
            
            console.log("QR Code detected:", result.data);
            setLastScanResult(result.data);
            
            // Parse the QR code data (format: AFTR-TICKET-{qrCode}). qrCode is
            // itself a UUID (contains hyphens), so the lookup value is
            // everything after the fixed prefix — not a naive split("-").
            const QR_PREFIX = "AFTR-TICKET-";
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
                    setScanStatus("success");

                    // Check if ticket is already used
                    if (data.ticket.isUsed) {
                      toast({
                        title: "Ticket Already Used",
                        description: `This ticket for ${data.ticket.customerName} has already been scanned`,
                        variant: "destructive",
                      });
                      setScanStatus("error");
                      onTicketFound(null);
                    } else {
                      onTicketFound(data.ticket);
                      toast({
                        title: "Valid Ticket Found!",
                        description: `Welcome ${data.ticket.customerName} - ${data.ticket.ticketType}`,
                      });
                    }
                  } else {
                    setScanStatus("error");
                    onTicketFound(null);
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
                  onTicketFound(null);
                  toast({
                    title: "Invalid QR Code Format",
                    description: "This QR code is not a valid AFTR ticket",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error("Error processing QR code:", error);
                setScanStatus("error");
                onTicketFound(null);
                toast({
                  title: "Scan Error",
                  description: "Failed to process QR code. Please try again.",
                  variant: "destructive",
                });
              }
            } else {
              setScanStatus("error");
              onTicketFound(null);
              toast({
                title: "Invalid QR Code",
                description: "This is not an AFTR ticket QR code",
                variant: "destructive",
              });
            }
            
            // Reset scan status after a delay
            setTimeout(() => {
              if (mounted) {
                setScanStatus("idle");
              }
            }, 3000);
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

        if (mounted) {
          setQrScanner(scanner);
        }
      } catch (error) {
        console.error("Error initializing scanner:", error);
        if (mounted) {
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
      mounted = false;
      if (qrScanner) {
        try {
          qrScanner.destroy();
        } catch (error) {
          console.error("Error destroying scanner:", error);
        }
      }
    };
  }, [onTicketFound, toast]);

  const startScanning = async () => {
    if (!qrScanner) {
      toast({
        title: "Scanner Not Ready",
        description: "Camera scanner is still initializing. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clear any previous scan results
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
      
      await qrScanner.start();
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
    if (qrScanner) {
      qrScanner.stop();
      setScanning(false);
      setScanStatus("idle");
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
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
              className="flex-1"
              data-testid="button-start-scanner"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
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
            <li>• Valid tickets will show customer information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}