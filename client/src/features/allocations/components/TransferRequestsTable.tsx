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
import { Check, X } from "lucide-react";

const MOCK_REQUESTS = [
  { id: '1', asset: 'iPad Pro 12.9"', tag: 'TB-2024-001', requestedBy: 'Sarah Connor', currentAssignee: '-', date: '2 hours ago', status: 'PENDING', urgency: 'High' },
  { id: '2', asset: 'Toyota Hilux', tag: 'VH-2022-045', requestedBy: 'Mike Ross', currentAssignee: 'John Doe', date: '1 day ago', status: 'CONFLICT', urgency: 'Medium' },
];

export const TransferRequestsTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Current Assignee</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[180px] text-right">Approval</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_REQUESTS.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.asset}</TableCell>
              <TableCell>{req.tag}</TableCell>
              <TableCell>{req.requestedBy}</TableCell>
              <TableCell>{req.currentAssignee}</TableCell>
              <TableCell>{req.date}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 items-start">
                  <Badge variant={req.status === 'PENDING' ? 'secondary' : 'destructive'}>
                    {req.status}
                  </Badge>
                  {req.status === 'CONFLICT' && (
                    <span className="text-[10px] text-destructive font-medium">Currently Allocated</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive border-destructive/20 hover:bg-destructive/10">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="h-8" disabled={req.status === 'CONFLICT'}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
