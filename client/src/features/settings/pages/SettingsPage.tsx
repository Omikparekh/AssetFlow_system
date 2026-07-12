import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Monitor, Code } from 'lucide-react';
import { ProfileSettings } from '../components/ProfileSettings';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { SecuritySettings } from '../components/SecuritySettings';
import { DeveloperSettings } from '../components/DeveloperSettings';
import { useAuth } from '@/contexts/AuthContext';

type TabId = 'profile' | 'appearance' | 'security' | 'developer';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
    ...(isAdmin ? [{ id: 'developer', label: 'Developer & API', icon: Code }] : []),
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabId)}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary text-primary-foreground shadow' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'developer' && isAdmin && <DeveloperSettings />}
        </motion.div>

      </div>
    </div>
  );
};
