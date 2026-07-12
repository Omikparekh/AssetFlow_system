import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Eye, ArrowRightLeft, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssets } from '../hooks/useAssets';
import { useAuth } from '@/contexts/AuthContext';
import { BookAssetDialog } from '../../bookings/components/BookAssetDialog';

const statusColors: Record<string, string> = {
  'AVAILABLE': 'success',
  'ALLOCATED': 'primary',
  'UNDER_MAINTENANCE': 'warning',
  'MAINTENANCE': 'warning',
  'WRITTEN_OFF': 'secondary',
  'RETIRED': 'secondary',
};

export const AssetTable: React.FC = () => {
  const { assets, isLoading, isError, deleteAsset } = useAssets();
  const { user } = useAuth();
  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  const isEmployee = user?.role === 'EMPLOYEE';
  const [bookingAsset, setBookingAsset] = useState<{ id: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        Loading assets list...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive bg-card rounded-xl border">
        Failed to load assets from the server.
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">
        No assets found in the inventory.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><input type="checkbox" className="rounded" /></TableHead>
            <TableHead>Asset Tag</TableHead>
            <TableHead>Name/Model</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const assignee = asset.allocations?.[0]?.employee?.fullName || '-';
            return (
              <TableRow key={asset.id}>
                <TableCell><input type="checkbox" className="rounded" /></TableCell>
                <TableCell className="font-medium text-primary hover:underline">
                  <Link to={`/assets/${asset.id}`}>{asset.assetTag}</Link>
                </TableCell>
                <TableCell>{asset.model?.name || asset.brand?.name || 'Generic Asset'}</TableCell>
                <TableCell>{asset.category?.name || '-'}</TableCell>
                <TableCell>{asset.location || '-'}</TableCell>
                <TableCell>{assignee}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[asset.currentStatus] as any}>
                    {asset.currentStatus.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to={`/assets/${asset.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      {isEmployee && asset.currentStatus === 'AVAILABLE' && (
                        <DropdownMenuItem onSelect={() => setBookingAsset({ id: asset.id, name: asset.model?.name || asset.brand?.name || asset.assetTag })}>
                          <ArrowRightLeft className="mr-2 h-4 w-4" /> Book Asset
                        </DropdownMenuItem>
                      )}
                      {canManageAssets && (
                        <>
                          <DropdownMenuItem>
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Allocate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this asset?')) {
                                deleteAsset(asset.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Asset
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {bookingAsset && <BookAssetDialog open={!!bookingAsset} onOpenChange={(open) => { if (!open) setBookingAsset(null); }} assetId={bookingAsset.id} assetName={bookingAsset.name} />}
    </div>
  );
};
