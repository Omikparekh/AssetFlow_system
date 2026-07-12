import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAllocations } from '../../allocations/hooks/useAllocations';
import { ArrowLeftRight, Clock } from 'lucide-react';
import { RequestReturnDialog } from './RequestReturnDialog';

export const MyAllocationsTable: React.FC = () => {
  const { allocations, isLoading, isError } = useAllocations({ status: 'ACTIVE' });
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; tag: string } | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        Loading your allocated assets...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-card rounded-xl border">
        Failed to load allocated assets from the server.
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border flex flex-col items-center justify-center space-y-3">
        <ArrowLeftRight className="h-10 w-10 text-muted-foreground/60" />
        <span className="font-medium text-lg text-foreground">No assets allocated to you</span>
        <p className="text-sm max-w-sm">
          Any company equipment assigned to you will show up here. You currently have no active allocations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Tag</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Allocated Date</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((alloc) => {
              const assetName = alloc.asset?.model?.name || alloc.asset?.brand?.name || 'Generic Asset';
              const allocatedDate = new Date(alloc.allocatedAt).toLocaleDateString();
              const expectedReturnDate = alloc.expectedReturn 
                ? new Date(alloc.expectedReturn).toLocaleDateString() 
                : 'Indefinite';

              return (
                <TableRow key={alloc.id}>
                  <TableCell className="font-semibold font-mono text-primary">
                    {alloc.asset?.assetTag}
                  </TableCell>
                  <TableCell>{assetName}</TableCell>
                  <TableCell>{alloc.asset?.category?.name || '-'}</TableCell>
                  <TableCell>{allocatedDate}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {expectedReturnDate}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setSelectedAsset({ 
                        id: alloc.assetId, 
                        tag: alloc.asset?.assetTag || '' 
                      })}
                    >
                      Return Asset
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedAsset && (
        <RequestReturnDialog
          open={!!selectedAsset}
          onOpenChange={(open) => { if (!open) setSelectedAsset(null); }}
          assetId={selectedAsset.id}
          assetTag={selectedAsset.tag}
        />
      )}
    </div>
  );
};
