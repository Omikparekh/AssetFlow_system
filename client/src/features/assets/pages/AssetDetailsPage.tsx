import React, { useState } from 'react';
import { ArrowLeft, Edit, QrCode, FileText, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { AssetTimeline } from '../components/AssetTimeline';
import { motion } from 'framer-motion';
import { useAsset } from '../hooks/useAssets';
import { useAuth } from '@/contexts/AuthContext';
import { RequestReturnDialog } from '../components/RequestReturnDialog';
import { BookAssetDialog } from '../../bookings/components/BookAssetDialog';

export const AssetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: asset, isLoading, isError } = useAsset(id || '');
  const { user } = useAuth();
  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const statusColors: Record<string, string> = {
    'AVAILABLE': 'success',
    'ALLOCATED': 'primary',
    'UNDER_MAINTENANCE': 'warning',
    'MAINTENANCE': 'warning',
    'WRITTEN_OFF': 'secondary',
    'RETIRED': 'secondary',
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading asset details...
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="p-12 text-center text-destructive">
        Failed to load asset details. It may have been deleted or the URL is invalid.
      </div>
    );
  }

  const name = asset.model?.name || asset.brand?.name || 'Generic Asset';
  const cost = asset.purchaseCost ? `$${Number(asset.purchaseCost).toLocaleString()}` : '-';
  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-';
  const isAssignedToCurrentEmployee = user?.role === 'EMPLOYEE' && asset.allocations?.some(
    (allocation) => allocation.employee?.id === user.id
  );
  const canBook = user?.role === 'EMPLOYEE' && asset.currentStatus === 'AVAILABLE';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link to="/assets"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
              <Badge variant={statusColors[asset.currentStatus] as any}>
                {asset.currentStatus.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-lg font-mono">
              {asset.assetTag}
            </p>
          </div>
        </div>
        {isAssignedToCurrentEmployee ? (
          <Button variant="destructive" onClick={() => setReturnDialogOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Return Asset
          </Button>
        ) : canBook ? (
          <Button onClick={() => setBookingDialogOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Book Asset
          </Button>
        ) : canManageAssets && (
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Allocate
            </Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                  <dd className="mt-1 text-sm font-semibold">{asset.category?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="mt-1 text-sm font-semibold">{asset.location || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Brand</dt>
                  <dd className="mt-1 text-sm font-semibold">{asset.brand?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Model</dt>
                  <dd className="mt-1 text-sm font-semibold">{asset.model?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Serial Number</dt>
                  <dd className="mt-1 text-sm font-semibold font-mono">{asset.serialNumber || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Condition</dt>
                  <dd className="mt-1 text-sm font-semibold capitalize">{asset.condition?.toLowerCase() || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Purchase Date</dt>
                  <dd className="mt-1 text-sm font-semibold">{purchaseDate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Purchase Cost</dt>
                  <dd className="mt-1 text-sm font-semibold">{cost}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents & Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="border rounded-xl p-4 flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted transition-colors">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-3 text-sm font-medium">Invoice.pdf</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - QR & Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <QrCode className="mr-2 h-5 w-5 text-muted-foreground" /> 
                Asset Tag (QR)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 bg-muted/20">
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <div className="grid grid-cols-5 grid-rows-5 gap-1 w-32 h-32 relative">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className={`bg-black ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'} rounded-sm`}></div>
                  ))}
                </div>
              </div>
              <p className="mt-4 font-mono text-sm font-semibold">{asset.assetTag}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetTimeline />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {isAssignedToCurrentEmployee && (
        <RequestReturnDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          assetId={asset.id}
          assetTag={asset.assetTag}
        />
      )}
      {canBook && (
        <BookAssetDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          assetId={asset.id}
          assetName={name}
        />
      )}
    </div>
  );
};
