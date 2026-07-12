import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useReturnRequests } from '../../allocations/hooks/useAllocations';
import { Loader2 } from 'lucide-react';

const returnSchema = z.object({
  returnCondition: z.string().default('GOOD'),
  notes: z.string().optional(),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface RequestReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  assetTag: string;
  onSuccess?: () => void;
}

export const RequestReturnDialog: React.FC<RequestReturnDialogProps> = ({
  open,
  onOpenChange,
  assetId,
  assetTag,
  onSuccess,
}) => {
  const { requestReturn, isRequesting } = useReturnRequests();

  const { register, handleSubmit, reset } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returnCondition: 'GOOD',
      notes: '',
    },
  });

  const onSubmit = (data: ReturnFormData) => {
    requestReturn(
      {
        assetId,
        returnCondition: data.returnCondition,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) reset(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Return Asset - {assetTag}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="returnCondition">Current Condition</Label>
            <select
              id="returnCondition"
              {...register('returnCondition')}
              disabled={isRequesting}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="GOOD">Good / Normal</option>
              <option value="FAIR">Fair / Scratched</option>
              <option value="DAMAGED">Damaged / Broken</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Reason for Return</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Upgrading laptop, leaving project..."
              {...register('notes')}
              disabled={isRequesting}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isRequesting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isRequesting} variant="destructive">
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Return'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
