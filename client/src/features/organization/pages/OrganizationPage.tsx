import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { DepartmentsTable } from '../components/DepartmentsTable';
import { CategoriesTable } from '../components/CategoriesTable';
import { EmployeesTable } from '../components/EmployeesTable';
import { AddDepartmentDialog } from '../components/AddDepartmentDialog';
import { InviteEmployeeDialog } from '../components/InviteEmployeeDialog';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [activeTab, setActiveTab] = useState('departments');
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [inviteEmployeeOpen, setInviteEmployeeOpen] = useState(false);

  // Dynamic header actions based on tab
  const getActionLabel = () => {
    switch (activeTab) {
      case 'departments': return 'Add Department';
      case 'categories': return 'Add Category';
      case 'employees': return 'Invite Employee';
      default: return 'Add New';
    }
  };

  const handleActionClick = () => {
    if (activeTab === 'departments') {
      setAddDeptOpen(true);
    } else if (activeTab === 'employees') {
      setInviteEmployeeOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
          <p className="text-muted-foreground mt-1">
            Manage your corporate hierarchy, asset categories, and workforce.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          {activeTab !== 'categories' && isAdmin && (
            <Button onClick={handleActionClick}>
              <Plus className="mr-2 h-4 w-4" /> {getActionLabel()}
            </Button>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Tabs defaultValue="departments" onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>
          
          <TabsContent value="departments" className="space-y-4 m-0">
            <DepartmentsTable />
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4 m-0">
            <CategoriesTable />
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-4 m-0">
            <EmployeesTable />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Creation Modals */}
      <AddDepartmentDialog open={addDeptOpen} onOpenChange={setAddDeptOpen} />
      <InviteEmployeeDialog open={inviteEmployeeOpen} onOpenChange={setInviteEmployeeOpen} />
    </div>
  );
};
