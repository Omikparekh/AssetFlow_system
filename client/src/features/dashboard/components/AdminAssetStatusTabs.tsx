import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Ban, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { DashboardStats } from '../services/dashboard.service';

interface AdminAssetStatusTabsProps {
  lists?: DashboardStats['lifecycleLists'];
}

export const AdminAssetStatusTabs: React.FC<AdminAssetStatusTabsProps> = ({ lists }) => {
  const given = lists?.given || [];
  const notEquipped = lists?.notEquipped || [];
  const inRepair = lists?.inRepair || [];
  const returned = lists?.returned || [];

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Asset Lifecycle Tracker</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time tracking of assets by active allocations, repairs, availability, and returns.
          </p>
        </div>
      </div>

      <Tabs defaultValue="given" className="w-full">
        <div className="px-6 pt-2 bg-muted/20 border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-6 border-b-0 w-full justify-start overflow-x-auto flex-nowrap whitespace-nowrap">
            <TabsTrigger 
              value="given" 
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-semibold data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none"
            >
              Given ({given.length})
            </TabsTrigger>
            <TabsTrigger 
              value="not-equipped"
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-semibold data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none"
            >
              Not Equipped ({notEquipped.length})
            </TabsTrigger>
            <TabsTrigger 
              value="in-repair"
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-semibold data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none"
            >
              In Repair ({inRepair.length})
            </TabsTrigger>
            <TabsTrigger 
              value="returned"
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-semibold data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none"
            >
              Returned ({returned.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Given (Allocated) */}
        <TabsContent value="given" className="m-0">
          {given.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <Ban className="h-8 w-8 opacity-60" />
              No assets currently given / allocated.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tag</TableHead>
                  <TableHead>Asset Model</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assignee Holder</TableHead>
                  <TableHead>Allocated Date</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {given.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6 font-semibold font-mono text-primary">{a.tag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.assignee}</TableCell>
                    <TableCell>{a.allocatedAt ? new Date(a.allocatedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="pr-6">
                      <Link to={`/assets/${a.id}`} className="hover:text-primary transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Tab 2: Not Equipped (Available) */}
        <TabsContent value="not-equipped" className="m-0">
          {notEquipped.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-success opacity-80" />
              All assets are currently allocated!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tag</TableHead>
                  <TableHead>Asset Model</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Storage Location</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notEquipped.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6 font-semibold font-mono text-emerald-600">{a.tag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {a.condition?.toLowerCase() || 'new'}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Link to={`/assets/${a.id}`} className="hover:text-primary transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Tab 3: In Repair (Maintenance) */}
        <TabsContent value="in-repair" className="m-0">
          {inRepair.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-success opacity-80" />
              No assets currently in repair.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tag</TableHead>
                  <TableHead>Asset Model</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Repair Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inRepair.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6 font-semibold font-mono text-amber-600">{a.tag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>
                      <Badge variant={a.priority === 'CRITICAL' || a.priority === 'HIGH' ? 'destructive' : 'outline'}>
                        {a.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        {a.repairStatus.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Link to={`/assets/${a.id}`} className="hover:text-primary transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Tab 4: Returned */}
        <TabsContent value="returned" className="m-0">
          {returned.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <History className="h-8 w-8 opacity-60" />
              No recent returns logged.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tag</TableHead>
                  <TableHead>Asset Model</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Returned By</TableHead>
                  <TableHead>Returned Date</TableHead>
                  <TableHead>Return Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returned.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6 font-semibold font-mono text-muted-foreground">{a.tag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.assignee}</TableCell>
                    <TableCell>{a.returnedAt ? new Date(a.returnedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={a.condition === 'DAMAGED' || a.condition === 'POOR' ? 'destructive' : 'success'}>
                        {a.condition}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
