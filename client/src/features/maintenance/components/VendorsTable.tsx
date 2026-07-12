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
import { MoreHorizontal, Edit, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_VENDORS = [
  { id: '1', name: 'Apple Care Enterprise', type: 'Electronics', contact: 'enterprise@apple.com', phone: '1-800-MY-APPLE', contract: 'Active', sla: '24 Hours' },
  { id: '2', name: 'Cooling Pros Inc', type: 'Facilities', contact: 'service@coolingpros.com', phone: '555-0192', contract: 'Expired', sla: '48 Hours' },
  { id: '3', name: 'City Auto Motors', type: 'Vehicles', contact: 'fleet@cityauto.com', phone: '555-0188', contract: 'Active', sla: '72 Hours' },
];

export const VendorsTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Contract Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_VENDORS.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell className="font-medium">{vendor.name}</TableCell>
              <TableCell>{vendor.type}</TableCell>
              <TableCell>{vendor.contact}</TableCell>
              <TableCell>{vendor.phone}</TableCell>
              <TableCell>{vendor.sla}</TableCell>
              <TableCell>
                <Badge variant={vendor.contract === 'Active' ? 'success' : 'secondary'}>
                  {vendor.contract}
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
                      <ExternalLink className="mr-2 h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Vendor
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
