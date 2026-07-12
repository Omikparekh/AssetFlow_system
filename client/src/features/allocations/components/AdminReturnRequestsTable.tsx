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
import { useReturnRequests } from '../hooks/useAllocations';
import { CheckCircle, XCircle, ArrowLeftRight, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  'PENDING': 'secondary',
  'APPROVED': 'success',
  'REJECTED': 'destructive',
};

export const AdminReturnRequestsTable: React.FC = () => {
  const { requests, isLoading, isError, actionReturnRequest, isActioning } = useReturnRequests();

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
        <span className="font-semibold text-lg text-foreground">No return requests</span>
        <p className="text-sm max-w-sm">
          Employee asset return requests will show up here. Currently, there are no requests.
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
            <TableHead>Requested By</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[180px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => {
            const assetName = req.asset?.model?.name || req.asset?.brand?.name || 'Generic Asset';
            const requesterName = req.requestedBy?.fullName || 'Employee';
            const submittedDate = new Date(req.createdAt).toLocaleDateString();

            return (
              <TableRow key={req.id}>
                <TableCell className="font-semibold font-mono text-primary">
                  {req.asset?.assetTag}
                </TableCell>
                <TableCell>{assetName}</TableCell>
                <TableCell>{requesterName}</TableCell>
                <TableCell className="capitalize">{req.returnCondition.toLowerCase()}</TableCell>
                <TableCell>{submittedDate}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[req.status] as any}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={isActioning}
                        onClick={() => actionReturnRequest({ requestId: req.id, status: 'APPROVED' })}
                        className="h-8 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isActioning}
                        onClick={() => actionReturnRequest({ requestId: req.id, status: 'REJECTED' })}
                        className="h-8 px-2.5"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
