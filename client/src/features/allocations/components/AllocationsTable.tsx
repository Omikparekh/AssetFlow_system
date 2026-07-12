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
import { MoreHorizontal, ArrowDownLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReturnAssetDialog } from './ReturnAssetDialog';

const MOCK_ALLOCATIONS = [
  { id: '1', asset: 'MacBook Pro 16"', tag: 'LT-2023-001', assignee: 'John Doe', date: '2023-11-01', expectedReturn: '2024-11-01', status: 'ACTIVE' },
  { id: '2', asset: 'Dell Ultrasharp 27"', tag: 'MN-2024-012', assignee: 'Jane Smith', date: '2024-01-15', expectedReturn: 'Indefinite', status: 'ACTIVE' },
  { id: '3', asset: 'Sony Alpha Camera', tag: 'CM-2022-045', assignee: 'Mike Ross', date: '2024-03-01', expectedReturn: '2024-03-10', status: 'OVERDUE' },
];

export const AllocationsTable: React.FC = () => {
  const [returnDialogOpen, setReturnDialogOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null);

  const handleReturn = (asset: any) => {
    setSelectedAsset(asset);
    setReturnDialogOpen(true);
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Allocated Date</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_ALLOCATIONS.map((alloc) => (
            <TableRow key={alloc.id}>
              <TableCell className="font-medium">{alloc.asset}</TableCell>
              <TableCell>{alloc.tag}</TableCell>
              <TableCell>{alloc.assignee}</TableCell>
              <TableCell>{alloc.date}</TableCell>
              <TableCell className={alloc.status === 'OVERDUE' ? 'text-destructive font-medium' : ''}>
                {alloc.expectedReturn}
              </TableCell>
              <TableCell>
                <Badge variant={alloc.status === 'ACTIVE' ? 'success' : 'destructive'}>
                  {alloc.status}
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
                    <DropdownMenuItem onClick={() => handleReturn(alloc)}>
                      <ArrowDownLeft className="mr-2 h-4 w-4" /> Process Return
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReturnAssetDialog 
        open={returnDialogOpen} 
        onOpenChange={setReturnDialogOpen} 
        asset={selectedAsset} 
      />
    </div>
  );
};
