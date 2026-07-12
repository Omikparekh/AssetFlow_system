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
import { useReturnRequests } from '../../allocations/hooks/useAllocations';
import { ArrowLeftRight, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  'PENDING': 'secondary',
  'APPROVED': 'success',
  'REJECTED': 'destructive',
};

export const MyReturnRequestsTable: React.FC = () => {
  const { requests, isLoading, isError } = useReturnRequests();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        Loading return requests...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-card rounded-xl border">
        Failed to load return requests from the server.
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border flex flex-col items-center justify-center space-y-3">
        <ArrowLeftRight className="h-10 w-10 text-muted-foreground/60" />
        <span className="font-medium text-lg text-foreground">No return requests submitted</span>
        <p className="text-sm max-w-sm">
          When you request to return any equipment, the status of your submission will appear here.
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
            <TableHead>Requested Condition</TableHead>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => {
            const assetName = req.asset?.model?.name || req.asset?.brand?.name || 'Generic Asset';
            const submittedDate = new Date(req.createdAt).toLocaleDateString();

            return (
              <TableRow key={req.id}>
                <TableCell className="font-semibold font-mono text-primary">
                  {req.asset?.assetTag}
                </TableCell>
                <TableCell>{assetName}</TableCell>
                <TableCell className="capitalize">{req.returnCondition.toLowerCase()}</TableCell>
                <TableCell>{submittedDate}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[req.status] as any}>
                    {req.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
