import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const AssetFilterBar: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-1 border-b pb-4 mb-4">
      <div className="flex items-center w-full sm:w-auto gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets by tag, serial, or name..." className="pl-9 bg-card" />
        </div>
        <Button variant="outline" size="icon" className="shrink-0 bg-card">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select className="h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[150px]">
          <option value="">All Categories</option>
          <option value="laptops">Laptops</option>
          <option value="monitors">Monitors</option>
          <option value="vehicles">Vehicles</option>
        </select>
        <select className="h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[150px]">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="allocated">Allocated</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <Button variant="secondary" className="shrink-0 ml-auto sm:ml-0">
          <Download className="h-4 w-4 mr-2 hidden sm:block" /> Export
        </Button>
      </div>
    </div>
  );
};
