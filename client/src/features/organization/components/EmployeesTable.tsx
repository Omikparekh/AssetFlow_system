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
import { useEmployees } from '../hooks/useOrganization';

const roleColors: Record<string, string> = {
  'Admin': 'destructive',
  'Asset Manager': 'primary',
  'Department Head': 'warning',
  'Employee': 'secondary',
};

export const EmployeesTable: React.FC = () => {
  const { employees, isLoading, isError, deleteEmployee } = useEmployees();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading employees...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load employees. Please make sure the backend is running.
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No employees found.
      </div>
    );
  }

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
          {employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {emp.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium leading-none">{emp.fullName}</span>
                    <span className="text-xs text-muted-foreground mt-1">{emp.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{emp.employeeCode}</TableCell>
              <TableCell>
                <Badge variant={roleColors[emp.role?.name] as any || 'secondary'}>
                  {emp.role?.name || 'Employee'}
                </Badge>
              </TableCell>
              <TableCell>{emp.department?.name || '-'}</TableCell>
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
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this employee profile?')) {
                          deleteEmployee(emp.id);
                        }
                      }}
                    >
                      <Ban className="mr-2 h-4 w-4" /> Delete Employee
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
