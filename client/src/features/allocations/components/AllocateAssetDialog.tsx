import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AllocateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllocateAssetDialog: React.FC<AllocateAssetDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Allocate New Asset</DialogTitle>
          <DialogDescription>
            Assign an available asset from inventory to an employee or department.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="assetSearch">Select Asset</Label>
              <Input id="assetSearch" placeholder="Search by tag..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userSearch">Assignee</Label>
              <Input id="userSearch" placeholder="Search employee..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expectedReturn">Expected Return Date</Label>
              <Input id="expectedReturn" type="date" />
              <p className="text-[10px] text-muted-foreground">Leave empty for indefinite allocation.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initialCondition">Initial Condition</Label>
              <select id="initialCondition" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={() => onOpenChange(false)}>Allocate Asset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
