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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, ShieldAlert, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_EMPLOYEES = [
  { id: '1', name: 'Emma Watson', email: 'emma@company.com', code: 'EMP-001', role: 'ADMIN', dept: 'Head Office', status: 'ACTIVE' },
  { id: '2', name: 'John Doe', email: 'john@company.com', code: 'EMP-002', role: 'DEPARTMENT_HEAD', dept: 'Engineering', status: 'ACTIVE' },
  { id: '3', name: 'Jane Smith', email: 'jane@company.com', code: 'EMP-003', role: 'ASSET_MANAGER', dept: 'Human Resources', status: 'ACTIVE' },
  { id: '4', name: 'Mike Ross', email: 'mike@company.com', code: 'EMP-004', role: 'EMPLOYEE', dept: 'Marketing', status: 'ACTIVE' },
  { id: '5', name: 'Harvey Specter', email: 'harvey@company.com', code: 'EMP-005', role: 'EMPLOYEE', dept: 'Engineering', status: 'SUSPENDED' },
];

const roleColors: Record<string, string> = {
  'ADMIN': 'destructive',
  'ASSET_MANAGER': 'primary',
  'DEPARTMENT_HEAD': 'warning',
  'EMPLOYEE': 'secondary',
};

export const EmployeesTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_EMPLOYEES.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">{emp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium leading-none">{emp.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{emp.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{emp.code}</TableCell>
              <TableCell>
                <Badge variant={roleColors[emp.role] as any}>
                  {emp.role.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>{emp.dept}</TableCell>
              <TableCell>
                <Badge variant={emp.status === 'ACTIVE' ? "success" : "secondary"}>
                  {emp.status}
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
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShieldAlert className="mr-2 h-4 w-4" /> Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Ban className="mr-2 h-4 w-4" /> Suspend Account
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
