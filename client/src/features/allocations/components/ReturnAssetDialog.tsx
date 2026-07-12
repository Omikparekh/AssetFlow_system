import React, { useState } from 'react';
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
import { useAllocations } from '../hooks/useAllocations';
import { Loader2 } from 'lucide-react';

interface ReturnAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: any; // Passed allocation object
}

export const ReturnAssetDialog: React.FC<ReturnAssetDialogProps> = ({ open, onOpenChange, asset }) => {
  const { returnAllocation, isReturning } = useAllocations();
  const [condition, setCondition] = useState('GOOD');
  const [notes, setNotes] = useState('');

  if (!asset) return null;

  const assetName = asset.asset?.model?.name || asset.asset?.brand?.name || 'Generic Asset';
  const tag = asset.asset?.assetTag || '';
  const assigneeName = asset.employee?.fullName || asset.department?.name || 'Unassigned';

  const handleConfirm = () => {
    returnAllocation(
      {
        allocationId: asset.id,
        returnCondition: condition,
        notes,
      },
      {
        onSuccess: () => {
          setNotes('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Asset Return</DialogTitle>
          <DialogDescription>
            You are processing the return of <strong>{assetName} ({tag})</strong> from <strong>{assigneeName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="condition">Final Condition</Label>
            <select 
              id="condition" 
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              disabled={isReturning}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReturning}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isReturning}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={isReturning}>
            {isReturning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Returning...
              </>
            ) : (
              'Confirm Return'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
