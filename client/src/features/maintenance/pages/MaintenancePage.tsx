import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { MaintenanceLogsTable } from '../components/MaintenanceLogsTable';
import { VendorsTable } from '../components/VendorsTable';
import { LogMaintenanceDialog } from '../components/LogMaintenanceDialog';
import { motion } from 'framer-motion';

export const MaintenancePage: React.FC = () => {
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance & Repairs</h1>
          <p className="text-muted-foreground mt-1">
            Track asset repairs, preventative maintenance, and manage service vendors.
          </p>
        </div>
        <Button onClick={() => setLogDialogOpen(true)}>
          <Wrench className="mr-2 h-4 w-4" /> Log Maintenance
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Tabs defaultValue="logs" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="logs">Service Logs</TabsTrigger>
            <TabsTrigger value="vendors">Vendors Directory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="space-y-4 m-0">
            <MaintenanceLogsTable />
          </TabsContent>
          
          <TabsContent value="vendors" className="space-y-4 m-0">
            <VendorsTable />
          </TabsContent>
        </Tabs>
      </motion.div>

      <LogMaintenanceDialog 
        open={logDialogOpen} 
        onOpenChange={setLogDialogOpen} 
      />
    </div>
  );
};
