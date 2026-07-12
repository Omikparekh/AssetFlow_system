import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetFilterBar } from '../components/AssetFilterBar';
import { AssetTable } from '../components/AssetTable';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AssetDirectoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage, filter, and track all company assets.
          </p>
        </div>
        <Button asChild>
          <Link to="/assets/new">
            <Plus className="mr-2 h-4 w-4" /> Register Asset
          </Link>
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <AssetFilterBar />
        <AssetTable />
      </motion.div>
    </div>
  );
};
