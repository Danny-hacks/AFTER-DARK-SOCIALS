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
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        console.log("QR Code detected:", result.data);
        setLastScanResult(result.data);
        
        // Parse the QR code data (format: AFTR-TICKET-{id}-{qrCode})
        if (result.data.startsWith("AFTR-TICKET-")) {
          try {
            const parts = result.data.split("-");
            if (parts.length >= 3) {
              const ticketId = parts[2];
              
              // Fetch ticket details from the backend
              const response = await fetch(`/api/admin/tickets/${ticketId}`, {
                credentials: 'include'
              });
              
              if (response.ok) {
                const data = await response.json();
                setScanStatus("success");
                onTicketFound(data.ticket);
                toast({
                  title: "Ticket Found!",
                  description: `Valid ticket for ${data.ticket.customerName}`,
                });
              } else {
                setScanStatus("error");
                onTicketFound(null);
                toast({
                  title: "Ticket Not Found",
                  description: "Invalid or expired ticket",
                  variant: "destructive",
                });
              }
            } else {
              setScanStatus("error");
              onTicketFound(null);
              toast({
                title: "Invalid QR Code",
                description: "This is not a valid AFTR ticket",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error processing QR code:", error);
            setScanStatus("error");
            onTicketFound(null);
            toast({
              title: "Scan Error",
              description: "Failed to process QR code",
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
      },
      {
        onDecodeError: (error) => {
          // Ignore decode errors as they happen constantly while scanning
          console.debug("QR decode error:", error);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: "environment", // Use back camera on mobile
      }
    );

    setQrScanner(scanner);

    return () => {
      scanner.destroy();
    };
  }, [onTicketFound, toast]);

  const startScanning = async () => {
    if (qrScanner) {
      try {
        await qrScanner.start();
        setScanning(true);
        setScanStatus("idle");
        toast({
          title: "Scanner Started",
          description: "Point the camera at a QR code to scan",
        });
      } catch (error) {
        console.error("Error starting scanner:", error);
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive",
        });
      }
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