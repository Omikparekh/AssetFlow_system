import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAssets, useAssetMeta } from '../hooks/useAssets';

const assetSchema = z.object({
  assetTag: z.string().min(3, 'Asset Tag must be at least 3 characters'),
  serialNumber: z.string().min(2, 'Serial number is required'),
  categoryId: z.string().uuid('Please select a category'),
  brandId: z.string().uuid('Please select a brand'),
  modelId: z.string().uuid('Please select a model'),
  purchaseDate: z.string().optional(),
  purchaseCost: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  condition: z.string().default('NEW'),
  location: z.string().default('Storage'),
  description: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export const RegisterAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAsset, isCreating } = useAssets();
  const { categories, brands, models, isLoading: isLoadingMeta } = useAssetMeta();

  const generatedTag = `AST-${Math.floor(100000 + Math.random() * 900000)}`;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assetTag: generatedTag,
      serialNumber: '',
      categoryId: '',
      brandId: '',
      modelId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: '',
      warrantyExpiry: '',
      condition: 'NEW',
      location: 'Storage',
      description: '',
    }
  });

  const selectedBrandId = watch('brandId');
  const selectedCategoryId = watch('categoryId');

  // Filter models based on selected brand & category
  const filteredModels = models.filter(
    (m) => m.brandId === selectedBrandId && m.categoryId === selectedCategoryId
  );

  // Reset modelId if brand/category changes
  useEffect(() => {
    setValue('modelId', '');
  }, [selectedBrandId, selectedCategoryId, setValue]);

  const onSubmit = (data: AssetFormData) => {
    createAsset(data, {
      onSuccess: () => {
        navigate('/assets');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/assets"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Register New Asset</h1>
          <p className="text-muted-foreground mt-1">
            Enter the details for the new asset to add it to the directory.
          </p>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag</Label>
              <Input 
                id="assetTag" 
                {...register('assetTag')} 
                disabled={isCreating}
              />
              {errors.assetTag && <p className="text-xs text-destructive">{errors.assetTag.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select 
                id="categoryId"
                {...register('categoryId')}
                disabled={isCreating || isLoadingMeta}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandId">Brand / Manufacturer</Label>
              <select 
                id="brandId"
                {...register('brandId')}
                disabled={isCreating || isLoadingMeta}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a brand</option>
                {brands.map((br) => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
              {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelId">Model</Label>
              <select 
                id="modelId"
                {...register('modelId')}
                disabled={isCreating || isLoadingMeta || !selectedBrandId || !selectedCategoryId}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {!selectedBrandId || !selectedCategoryId 
                    ? 'Select brand & category first' 
                    : filteredModels.length === 0 
                      ? 'No models available' 
                      : 'Select a model'
                  }
                </option>
                {filteredModels.map((mod) => (
                  <option key={mod.id} value={mod.id}>{mod.name}</option>
                ))}
              </select>
              {errors.modelId && <p className="text-xs text-destructive">{errors.modelId.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identification & Location</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input 
                id="serialNumber" 
                placeholder="e.g. C02CG123MD6R" 
                {...register('serialNumber')} 
                disabled={isCreating}
              />
              {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="e.g. Storage, Room 101" 
                {...register('location')} 
                disabled={isCreating}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase & Warranty</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input 
                id="purchaseDate" 
                type="date" 
                {...register('purchaseDate')} 
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Purchase Cost ($)</Label>
              <Input 
                id="purchaseCost" 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="2500.00" 
                {...register('purchaseCost')} 
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
              <Input 
                id="warrantyExpiry" 
                type="date" 
                {...register('warrantyExpiry')} 
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Initial Condition</Label>
              <select 
                id="condition"
                {...register('condition')}
                disabled={isCreating}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="NEW">New</option>
                <option value="GOOD">Good (Used)</option>
                <option value="FAIR">Fair</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/assets')} disabled={isCreating}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Asset
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};
