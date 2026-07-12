import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Trash2 } from 'lucide-react';

export const DeveloperSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys to allow external systems to interact with AssetFlow.
              </CardDescription>
            </div>
            <Button>
              <Key className="mr-2 h-4 w-4" /> Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Token prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">HR System Integration</TableCell>
                <TableCell className="font-mono text-muted-foreground">af_test_8f2...</TableCell>
                <TableCell>Oct 12, 2023</TableCell>
                <TableCell>2 mins ago</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Send real-time updates to external URLs when events occur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input placeholder="https://example.com/webhook" className="flex-1" />
            <Button variant="secondary">Add Endpoint</Button>
          </div>
          <p className="text-sm text-muted-foreground">No webhooks configured yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};
