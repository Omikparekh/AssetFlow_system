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
import { MoreHorizontal, FileText, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_LOGS = [
  { id: '1', asset: 'MacBook Pro 16"', tag: 'LT-2023-001', vendor: 'Apple Care', type: 'Repair', date: '2024-03-10', cost: '$0.00', status: 'IN_PROGRESS' },
  { id: '2', asset: 'HVAC Unit - Floor 2', tag: 'EQ-2021-042', vendor: 'Cooling Pros Inc', type: 'Preventative', date: '2024-03-15', cost: 'Pending', status: 'SCHEDULED' },
  { id: '3', asset: 'Toyota Hilux', tag: 'VH-2022-045', vendor: 'City Auto Motors', type: 'Service', date: '2024-02-28', cost: '$450.00', status: 'COMPLETED' },
];

const statusColors: Record<string, string> = {
  'COMPLETED': 'success',
  'IN_PROGRESS': 'primary',
  'SCHEDULED': 'warning',
};

export const MaintenanceLogsTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Est. Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_LOGS.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{log.asset}</span>
                  <span className="text-xs text-muted-foreground">{log.tag}</span>
                </div>
              </TableCell>
              <TableCell>{log.type}</TableCell>
              <TableCell>{log.vendor}</TableCell>
              <TableCell>{log.date}</TableCell>
              <TableCell>{log.cost}</TableCell>
              <TableCell>
                <Badge variant={statusColors[log.status] as any}>
                  {log.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" /> View Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
