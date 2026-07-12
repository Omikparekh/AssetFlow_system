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
import { Input } from "@/components/ui/input";
import { useAssets } from '../../assets/hooks/useAssets';
import { useEmployees, useDepartments } from '../../organization/hooks/useOrganization';
import { useAllocations } from '../hooks/useAllocations';
import { Loader2 } from 'lucide-react';

const allocateSchema = z.object({
  assetId: z.string().uuid('Please select an asset'),
  assignmentType: z.enum(['EMPLOYEE', 'DEPARTMENT']).default('EMPLOYEE'),
  employeeId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  expectedReturn: z.string().optional(),
  notes: z.string().optional(),
});

type AllocateFormData = z.infer<typeof allocateSchema>;

interface AllocateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllocateAssetDialog: React.FC<AllocateAssetDialogProps> = ({ open, onOpenChange }) => {
  const { assets, isLoading: isLoadingAssets } = useAssets({ status: 'AVAILABLE' });
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { departments, isLoading: isLoadingDepts } = useDepartments();
  const { createAllocation, isCreating } = useAllocations();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AllocateFormData>({
    resolver: zodResolver(allocateSchema),
    defaultValues: {
      assetId: '',
      assignmentType: 'EMPLOYEE',
      employeeId: '',
      departmentId: '',
      expectedReturn: '',
      notes: '',
    }
  });

  const assignmentType = watch('assignmentType');

  const onSubmit = (data: AllocateFormData) => {
    const submitData = {
      assetId: data.assetId,
      employeeId: data.assignmentType === 'EMPLOYEE' ? (data.employeeId || null) : null,
      departmentId: data.assignmentType === 'DEPARTMENT' ? (data.departmentId || null) : null,
      expectedReturn: data.expectedReturn || undefined,
      notes: data.notes || '',
    };

    createAllocation(submitData, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) reset(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Allocate New Asset</DialogTitle>
          <DialogDescription>
            Assign an available asset from inventory to an employee or department.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="assetId">Select Available Asset</Label>
            <select
              id="assetId"
              {...register('assetId')}
              disabled={isCreating || isLoadingAssets}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select an asset...</option>
              {assets.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  {ast.assetTag} - {ast.model?.name || ast.brand?.name || 'Generic Asset'} ({ast.condition?.toLowerCase()})
                </option>
              ))}
            </select>
            {errors.assetId && <p className="text-xs text-destructive">{errors.assetId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentType">Allocate To</Label>
              <select
                id="assignmentType"
                {...register('assignmentType')}
                disabled={isCreating}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="EMPLOYEE">Individual Employee</option>
                <option value="DEPARTMENT">Department Directly</option>
              </select>
            </div>

            {assignmentType === 'EMPLOYEE' ? (
              <div className="space-y-2">
                <Label htmlFor="employeeId">Assignee Employee</Label>
                <select
                  id="employeeId"
                  {...register('employeeId')}
                  disabled={isCreating || isLoadingEmployees}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="departmentId">Assignee Department</Label>
                <select
                  id="departmentId"
                  {...register('departmentId')}
                  disabled={isCreating || isLoadingDepts}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedReturn">Expected Return Date</Label>
              <Input
                id="expectedReturn"
                type="date"
                {...register('expectedReturn')}
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="e.g. Standard workstation kit"
                {...register('notes')}
                disabled={isCreating}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                'Allocate Asset'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
