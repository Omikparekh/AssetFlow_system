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
import { MoreHorizontal, CheckCircle, Play, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMaintenance } from '../hooks/useMaintenance';
import { useAuth } from '@/contexts/AuthContext';

const statusColors: Record<string, string> = {
  'PENDING': 'secondary',
  'APPROVED': 'primary',
  'UNDER_REPAIR': 'warning',
  'RESOLVED': 'success',
  'CANCELLED': 'destructive',
};

const priorityColors: Record<string, string> = {
  'LOW': 'secondary',
  'MEDIUM': 'primary',
  'HIGH': 'warning',
  'CRITICAL': 'destructive',
};

export const MaintenanceLogsTable: React.FC = () => {
  const { requests, isLoading, isError, updateStatus } = useMaintenance();
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  const isEmployee = user?.role === 'EMPLOYEE';

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        Loading maintenance records...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-card rounded-xl border">
        Failed to load maintenance records from the server.
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        No maintenance logs or requests found.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Created Date</TableHead>
            {!isEmployee && <TableHead>Est. Cost</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => {
            const assetName = req.asset?.model?.name || req.asset?.brand?.name || 'Generic Asset';
            const tag = req.asset?.assetTag || '';
            const requester = req.requestedBy?.fullName || 'System';
            const createdDate = new Date(req.createdAt).toLocaleDateString();
            const estCost = req.estimatedCost ? `$${req.estimatedCost.toLocaleString()}` : '-';

            return (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{assetName}</span>
                    <span className="text-xs text-muted-foreground font-mono">{tag}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityColors[req.priority] as any}>
                    {req.priority}
                  </Badge>
                </TableCell>
                <TableCell>{requester}</TableCell>
                <TableCell>{createdDate}</TableCell>
                {!isEmployee && <TableCell>{estCost}</TableCell>}
                <TableCell>
                  <Badge variant={statusColors[req.status] as any}>
                    {req.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {canManage && req.status !== 'RESOLVED' && req.status !== 'CANCELLED' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        {req.status === 'PENDING' && (
                          <DropdownMenuItem onClick={() => updateStatus({ id: req.id, data: { status: 'APPROVED' } })}>
                            <Play className="mr-2 h-4 w-4 text-primary" /> Approve Request
                          </DropdownMenuItem>
                        )}
                        
                        {req.status === 'APPROVED' && (
                          <DropdownMenuItem onClick={() => updateStatus({ id: req.id, data: { status: 'UNDER_REPAIR' } })}>
                            <Play className="mr-2 h-4 w-4 text-warning" /> Start Repairs
                          </DropdownMenuItem>
                        )}
                        
                        {req.status === 'UNDER_REPAIR' && (
                          <DropdownMenuItem onClick={() => updateStatus({ id: req.id, data: { status: 'RESOLVED', actualCost: req.estimatedCost || undefined } })}>
                            <CheckCircle className="mr-2 h-4 w-4 text-success" /> Mark Resolved
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => updateStatus({ id: req.id, data: { status: 'CANCELLED' } })}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancel Request
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
    </div>
  );
};
