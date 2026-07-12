import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AuditScannerUIProps {
  onScanComplete: () => void;
}

export const AuditScannerUI: React.FC<AuditScannerUIProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setScanSuccess(false);

    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      
      // Reset and trigger callback after success animation
      setTimeout(() => {
        setScanSuccess(false);
        onScanComplete();
      }, 1500);
    }, 2000);
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-muted/10">
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        
        <div className="relative w-64 h-64 mb-8 border-4 border-muted-foreground/30 rounded-3xl overflow-hidden bg-black/5 flex items-center justify-center">
          {/* Scanner Viewfinder Box */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl m-4"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl m-4"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl m-4"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl m-4"></div>
          </div>

          {/* Animated Laser Line */}
          {isScanning && (
            <motion.div 
              className="absolute w-[90%] h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(var(--primary),0.5)]"
              animate={{ y: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatType: "reverse" }}
            />
          )}

          {/* Success State */}
          {scanSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute flex items-center justify-center w-full h-full bg-success/20 backdrop-blur-sm"
            >
              <CheckCircle2 className="w-16 h-16 text-success" />
            </motion.div>
          )}

          {!isScanning && !scanSuccess && (
            <ScanLine className="w-12 h-12 text-muted-foreground opacity-50" />
          )}
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">
            {isScanning ? 'Scanning...' : scanSuccess ? 'Asset Found!' : 'Ready to Scan'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            {isScanning ? 'Hold the device steady over the QR code or Barcode.' : 'Align the asset tag within the frame to reconcile inventory.'}
          </p>
          
          <Button 
            size="lg" 
            className="w-full max-w-[200px]" 
            onClick={simulateScan}
            disabled={isScanning || scanSuccess}
          >
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};
