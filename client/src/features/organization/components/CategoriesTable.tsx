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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_CATEGORIES = [
  { id: '1', name: 'Laptops', code: 'LAP', prefix: 'LT-', depreciationType: 'Straight Line', status: true, total: 320 },
  { id: '2', name: 'Monitors', code: 'MON', prefix: 'MN-', depreciationType: 'Straight Line', status: true, total: 150 },
  { id: '3', name: 'Vehicles', code: 'VEH', prefix: 'VH-', depreciationType: 'Declining Balance', status: true, total: 12 },
  { id: '4', name: 'Office Chairs', code: 'CHR', prefix: 'CH-', depreciationType: 'None', status: true, total: 400 },
];

export const CategoriesTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Asset Prefix</TableHead>
            <TableHead>Depreciation Type</TableHead>
            <TableHead>Total Assets</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_CATEGORIES.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell>{cat.code}</TableCell>
              <TableCell>{cat.prefix}</TableCell>
              <TableCell>{cat.depreciationType}</TableCell>
              <TableCell>{cat.total}</TableCell>
              <TableCell>
                <Badge variant={cat.status ? "success" : "secondary"}>
                  {cat.status ? 'Active' : 'Inactive'}
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
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
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
