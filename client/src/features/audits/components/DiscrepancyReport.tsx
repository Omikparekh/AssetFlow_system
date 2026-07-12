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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const MOCK_DISCREPANCIES = [
  { id: '1', asset: 'Dell XPS 15', tag: 'LT-2023-002', expectedLocation: 'Engineering', foundLocation: 'Missing', status: 'MISSING' },
  { id: '2', asset: 'Office Chair', tag: 'CH-2021-114', expectedLocation: 'Floor 3', foundLocation: 'Floor 2', status: 'WRONG_LOCATION' },
  { id: '3', asset: 'iPad Pro 12.9"', tag: 'TB-2024-001', expectedLocation: 'Storage', foundLocation: 'Storage', status: 'FOUND_UNREGISTERED' },
];

export const DiscrepancyReport: React.FC = () => {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="bg-destructive/5 rounded-t-xl border-b border-destructive/10 pb-4">
        <CardTitle className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" /> Active Discrepancies
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Expected Location</TableHead>
              <TableHead>Found Location</TableHead>
              <TableHead>Issue Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DISCREPANCIES.map((disc) => (
              <TableRow key={disc.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{disc.asset}</span>
                    <span className="text-xs text-muted-foreground">{disc.tag}</span>
                  </div>
                </TableCell>
                <TableCell>{disc.expectedLocation}</TableCell>
                <TableCell className={disc.foundLocation === 'Missing' ? 'text-destructive font-medium' : ''}>
                  {disc.foundLocation}
                </TableCell>
                <TableCell>
                  <Badge variant={disc.status === 'MISSING' ? 'destructive' : 'warning'}>
                    {disc.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
