import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowDownLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReturnAssetDialog } from './ReturnAssetDialog';
import { useAllocations } from '../hooks/useAllocations';

export const AllocationsTable: React.FC = () => {
  const { allocations, isLoading, isError } = useAllocations();
  const [returnDialogOpen, setReturnDialogOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null);

  const handleReturn = (alloc: any) => {
    setSelectedAsset(alloc);
    setReturnDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        Loading active allocations...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-card rounded-xl border">
        Failed to load allocations from the server.
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        No active asset allocations found.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Allocated Date</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((alloc) => {
            const assetName = alloc.asset?.model?.name || alloc.asset?.brand?.name || 'Generic Asset';
            const assigneeName = alloc.employee?.fullName || alloc.department?.name || 'Unassigned';
            const allocatedDate = new Date(alloc.allocatedAt).toLocaleDateString();
            const expectedReturn = alloc.expectedReturn 
              ? new Date(alloc.expectedReturn).toLocaleDateString() 
              : 'Indefinite';

            return (
              <TableRow key={alloc.id}>
                <TableCell className="font-medium">{assetName}</TableCell>
                <TableCell className="font-mono text-xs">{alloc.asset?.assetTag}</TableCell>
                <TableCell>{assigneeName}</TableCell>
                <TableCell>{allocatedDate}</TableCell>
                <TableCell className={alloc.status === 'OVERDUE' ? 'text-destructive font-medium' : ''}>
                  {expectedReturn}
                </TableCell>
                <TableCell>
                  <Badge variant={alloc.status === 'ACTIVE' ? 'success' : 'destructive'}>
                    {alloc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {alloc.status === 'ACTIVE' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleReturn(alloc)}>
                          <ArrowDownLeft className="mr-2 h-4 w-4" /> Process Return
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ReturnAssetDialog 
        open={returnDialogOpen} 
        onOpenChange={setReturnDialogOpen} 
        asset={selectedAsset} 
      />
    </div>
  );
};
