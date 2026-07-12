import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const RegisterAssetPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    navigate('/assets');
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
        onSubmit={handleSave} 
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Asset Name</Label>
              <Input placeholder="e.g. MacBook Pro 16" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                <option value="">Select a category</option>
                <option value="laptops">Laptops</option>
                <option value="monitors">Monitors</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Brand / Manufacturer</Label>
              <Input placeholder="e.g. Apple" />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input placeholder="e.g. A2141" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input placeholder="e.g. C02CG123MD6R" required />
            </div>
            <div className="space-y-2">
              <Label>Asset Tag (Auto-generated)</Label>
              <Input value="LT-2024-089" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase & Warranty</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Purchase Cost ($)</Label>
              <Input type="number" min="0" step="0.01" placeholder="2500.00" />
            </div>
            <div className="space-y-2">
              <Label>Warranty Expiry</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Initial Condition</Label>
              <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="NEW">New</option>
                <option value="GOOD">Good (Used)</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/assets')}>Cancel</Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Asset
          </Button>
        </div>
      </motion.form>
    </div>
  );
};
