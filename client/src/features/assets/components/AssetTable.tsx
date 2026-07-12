import React from 'react';
import { Link } from 'react-router-dom';
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
import { MoreHorizontal, Edit, Eye, ArrowRightLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_ASSETS = [
  { id: '1', tag: 'LT-2023-001', name: 'MacBook Pro 16"', category: 'Laptops', location: 'Head Office', status: 'AVAILABLE', assignee: '-' },
  { id: '2', tag: 'LT-2023-002', name: 'Dell XPS 15', category: 'Laptops', location: 'Engineering Dept', status: 'ALLOCATED', assignee: 'John Doe' },
  { id: '3', tag: 'VH-2022-045', name: 'Toyota Hilux', category: 'Vehicles', location: 'Site A', status: 'MAINTENANCE', assignee: '-' },
  { id: '4', tag: 'MN-2024-012', name: 'Dell Ultrasharp 27"', category: 'Monitors', location: 'Marketing Dept', status: 'ALLOCATED', assignee: 'Jane Smith' },
  { id: '5', tag: 'LT-2021-088', name: 'ThinkPad T14', category: 'Laptops', location: 'Storage', status: 'RETIRED', assignee: '-' },
];

const statusColors: Record<string, string> = {
  'AVAILABLE': 'success',
  'ALLOCATED': 'primary',
  'MAINTENANCE': 'warning',
  'RETIRED': 'secondary',
};

export const AssetTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><input type="checkbox" className="rounded" /></TableHead>
            <TableHead>Asset Tag</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_ASSETS.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell><input type="checkbox" className="rounded" /></TableCell>
              <TableCell className="font-medium text-primary hover:underline">
                <Link to={`/assets/${asset.id}`}>{asset.tag}</Link>
              </TableCell>
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.category}</TableCell>
              <TableCell>{asset.location}</TableCell>
              <TableCell>{asset.assignee}</TableCell>
              <TableCell>
                <Badge variant={statusColors[asset.status] as any}>
                  {asset.status}
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
                    <DropdownMenuItem asChild>
                      <Link to={`/assets/${asset.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowRightLeft className="mr-2 h-4 w-4" /> Allocate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Asset
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
