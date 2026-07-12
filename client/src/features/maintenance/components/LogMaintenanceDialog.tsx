import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from "@/components/ui/input";
import { useAssets } from '../../assets/hooks/useAssets';
import { useAllocations } from '../../allocations/hooks/useAllocations';
import { useMaintenance } from '../hooks/useMaintenance';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const maintenanceSchema = z.object({
  assetId: z.string().uuid('Please select an asset'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  description: z.string().min(5, 'Please provide a detailed description (min 5 chars)'),
  estimatedCost: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface LogMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogMaintenanceDialog: React.FC<LogMaintenanceDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'EMPLOYEE';

  // Fetch either employee's active allocations or all assets
  const { allocations, isLoading: isLoadingAllocs } = useAllocations({ status: 'ACTIVE' });
  const { assets, isLoading: isLoadingAssets } = useAssets();
  const { createRequest, isCreating } = useMaintenance();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      assetId: '',
      priority: 'MEDIUM',
      description: '',
      estimatedCost: '',
    }
  });

  const onSubmit = (data: MaintenanceFormData) => {
    createRequest(
      {
        assetId: data.assetId,
        priority: data.priority,
        description: data.description,
        estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) reset(); }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Log Maintenance Request</DialogTitle>
          <DialogDescription>
            {isEmployee 
              ? 'Request maintenance or repair for equipment currently assigned to you.' 
              : 'Log repair or scheduled maintenance for any company asset.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="assetId">Select Asset</Label>
            <select
              id="assetId"
              {...register('assetId')}
              disabled={isCreating || isLoadingAllocs || isLoadingAssets}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select equipment...</option>
              {isEmployee 
                ? allocations.map((alloc) => (
                    <option key={alloc.assetId} value={alloc.assetId}>
                      {alloc.asset?.assetTag} - {alloc.asset?.model?.name || alloc.asset?.brand?.name}
                    </option>
                  ))
                : assets.map((ast) => (
                    <option key={ast.id} value={ast.id}>
                      {ast.assetTag} - {ast.model?.name || ast.brand?.name || 'Generic Asset'}
                    </option>
                  ))
              }
            </select>
            {errors.assetId && <p className="text-xs text-destructive">{errors.assetId.message}</p>}
          </div>

          <div className={isEmployee ? "space-y-2" : "grid grid-cols-2 gap-4"}>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <select
                id="priority"
                {...register('priority')}
                disabled={isCreating}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="LOW">Low (Cosmetic/Minor)</option>
                <option value="MEDIUM">Medium (Functional)</option>
                <option value="HIGH">High (Restricted Use)</option>
                <option value="CRITICAL">Critical (Broken/Down)</option>
              </select>
            </div>

            {!isEmployee && (
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Est. Cost ($)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  placeholder="e.g. 150"
                  {...register('estimatedCost')}
                  disabled={isCreating}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Issue Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the defect, damage, or maintenance requirement in detail..."
              {...register('description')}
              disabled={isCreating}
              className="resize-none h-24"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
