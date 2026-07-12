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

const MOCK_DEPARTMENTS = [
  { id: '1', name: 'Engineering', code: 'ENG', parent: 'Head Office', head: 'John Doe', status: true, assets: 145 },
  { id: '2', name: 'Human Resources', code: 'HR', parent: 'Head Office', head: 'Jane Smith', status: true, assets: 24 },
  { id: '3', name: 'Marketing', code: 'MKT', parent: 'Head Office', head: 'Mike Ross', status: true, assets: 45 },
  { id: '4', name: 'Frontend Web', code: 'ENG-FE', parent: 'Engineering', head: 'Sarah Connor', status: true, assets: 20 },
  { id: '5', name: 'Legacy Systems', code: 'LEG', parent: 'Head Office', head: 'N/A', status: false, assets: 0 },
];

export const DepartmentsTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Dept Head</TableHead>
            <TableHead>Assets</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_DEPARTMENTS.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium">{dept.name}</TableCell>
              <TableCell>{dept.code}</TableCell>
              <TableCell>{dept.parent}</TableCell>
              <TableCell>{dept.head}</TableCell>
              <TableCell>{dept.assets}</TableCell>
              <TableCell>
                <Badge variant={dept.status ? "success" : "secondary"}>
                  {dept.status ? 'Active' : 'Inactive'}
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
