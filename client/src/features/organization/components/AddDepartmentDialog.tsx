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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDepartments, useEmployees } from '../hooks/useOrganization';
import { Loader2 } from 'lucide-react';

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  departmentCode: z.string().min(2, 'Department code must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  headId: z.string().optional().nullable(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({ open, onOpenChange }) => {
  const { departments, createDepartment, isCreating } = useDepartments();
  const { employees } = useEmployees();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      departmentCode: '',
      description: '',
      parentId: '',
      headId: '',
    }
  });

  const onSubmit = (data: DepartmentFormData) => {
    // Clean empty strings to null for optional relations
    const submitData = {
      ...data,
      parentId: data.parentId === '' ? null : data.parentId,
      headId: data.headId === '' ? null : data.headId,
    };
    
    createDepartment(submitData, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) reset(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Engineering" 
              {...register('name')} 
              disabled={isCreating}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentCode">Department Code</Label>
            <Input 
              id="departmentCode" 
              placeholder="e.g. ENG" 
              {...register('departmentCode')} 
              disabled={isCreating}
            />
            {errors.departmentCode && <p className="text-xs text-destructive">{errors.departmentCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Brief description of the department..." 
              {...register('description')} 
              disabled={isCreating}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Department</Label>
            <select
              id="parentId"
              {...register('parentId')}
              disabled={isCreating}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None (Top Level)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.departmentCode})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headId">Department Head</Label>
            <select
              id="headId"
              {...register('headId')}
              disabled={isCreating}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None / Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Department'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
