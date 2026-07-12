import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, FileCheck } from "lucide-react";
import { AuditScannerUI } from '../components/AuditScannerUI';
import { DiscrepancyReport } from '../components/DiscrepancyReport';
import { motion } from 'framer-motion';

export const AuditsPage: React.FC = () => {
  const [scannedCount, setScannedCount] = useState(142);
  const totalExpected = 150;

  const handleScanComplete = () => {
    if (scannedCount < totalExpected) {
      setScannedCount(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Q1 2024 Inventory Audit</h1>
            <Badge variant="warning">In Progress</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Reconcile physical assets against system records for Head Office.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Pause Audit</Button>
          <Button>
            <FileCheck className="mr-2 h-4 w-4" /> Finalize Report
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
            <h3 className="text-2xl font-bold">{scannedCount} <span className="text-lg text-muted-foreground font-normal">/ {totalExpected} Scanned</span></h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Discrepancies</p>
            <h3 className="text-2xl font-bold text-destructive">3</h3>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden flex">
          <div 
            className="bg-primary h-full rounded-l-full transition-all duration-500 ease-out" 
            style={{ width: `${(scannedCount / totalExpected) * 100}%` }}
          ></div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Scanner UI */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <QrCode className="mr-2 h-5 w-5" /> Quick Scan
            </h2>
            <AuditScannerUI onScanComplete={handleScanComplete} />
          </div>
        </div>

        {/* Right Column - Data */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold flex items-center">
             Audit Findings
          </h2>
          <DiscrepancyReport />
          
          {/* Recent Scans (placeholder layout for visual weight) */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Recently Scanned Items</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                  <span className="font-medium">LT-2024-00{i}</span>
                  <span className="text-muted-foreground">MacBook Air M2</span>
                  <span className="text-success font-medium">Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
