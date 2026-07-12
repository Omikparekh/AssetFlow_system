import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { AllocationsTable } from '../components/AllocationsTable';
import { TransferRequestsTable } from '../components/TransferRequestsTable';
import { AllocateAssetDialog } from '../components/AllocateAssetDialog';
import { motion } from 'framer-motion';

export const AllocationsPage: React.FC = () => {
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allocations</h1>
          <p className="text-muted-foreground mt-1">
            Manage asset assignments, transfers, and expected returns.
          </p>
        </div>
        <Button onClick={() => setAllocateDialogOpen(true)}>
          <ArrowRightLeft className="mr-2 h-4 w-4" /> New Allocation
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Tabs defaultValue="active" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="active">Active Allocations</TabsTrigger>
            <TabsTrigger value="requests">Transfer Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 m-0">
            <AllocationsTable />
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4 m-0">
            <TransferRequestsTable />
          </TabsContent>
        </Tabs>
      </motion.div>

      <AllocateAssetDialog 
        open={allocateDialogOpen} 
        onOpenChange={setAllocateDialogOpen} 
      />
    </div>
  );
};
