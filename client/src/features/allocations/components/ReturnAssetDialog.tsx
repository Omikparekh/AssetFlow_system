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
import { Textarea } from "@/components/ui/textarea";

interface ReturnAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: any;
}

export const ReturnAssetDialog: React.FC<ReturnAssetDialogProps> = ({ open, onOpenChange, asset }) => {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Asset Return</DialogTitle>
          <DialogDescription>
            You are processing the return of <strong>{asset.asset} ({asset.tag})</strong> from <strong>{asset.assignee}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="condition">Final Condition</Label>
            <select id="condition" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background">
              <option value="EXCELLENT">Excellent (No damage)</option>
              <option value="GOOD">Good (Normal wear)</option>
              <option value="FAIR">Fair (Visible damage)</option>
              <option value="POOR">Poor (Needs repair)</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Condition Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="e.g. Minor scratches on the screen, charger included." 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={() => onOpenChange(false)}>Confirm Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
