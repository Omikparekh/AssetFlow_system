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
import { useAllocations } from '../../allocations/hooks/useAllocations';
import { History, ShieldAlert } from 'lucide-react';

export const MyReturnLogsTable: React.FC = () => {
  const { allocations, isLoading, isError } = useAllocations({ status: 'RETURNED' });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        Loading return logs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-card rounded-xl border">
        Failed to load return logs from the server.
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border flex flex-col items-center justify-center space-y-3">
        <History className="h-10 w-10 text-muted-foreground/60" />
        <span className="font-medium text-lg text-foreground">No return history</span>
        <p className="text-sm max-w-sm">
          A log of all your historically returned company equipment will appear here once returns are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Tag</TableHead>
            <TableHead>Asset Name</TableHead>
            <TableHead>Allocated On</TableHead>
            <TableHead>Returned On</TableHead>
            <TableHead>Return Condition</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((alloc) => {
            const assetName = alloc.asset?.model?.name || alloc.asset?.brand?.name || 'Generic Asset';
            const allocatedDate = new Date(alloc.allocatedAt).toLocaleDateString();
            const returnedDate = alloc.actualReturn ? new Date(alloc.actualReturn).toLocaleDateString() : '-';

            return (
              <TableRow key={alloc.id}>
                <TableCell className="font-semibold font-mono text-muted-foreground">
                  {alloc.asset?.assetTag}
                </TableCell>
                <TableCell className="font-medium text-foreground">{assetName}</TableCell>
                <TableCell>{allocatedDate}</TableCell>
                <TableCell>{returnedDate}</TableCell>
                <TableCell>
                  <Badge variant={alloc.returnCondition === 'DAMAGED' || alloc.returnCondition === 'POOR' ? 'destructive' : 'success'}>
                    {alloc.returnCondition || 'GOOD'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground" title={alloc.notes}>
                  {alloc.notes || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
