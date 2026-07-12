import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Users, 
  ArrowRightLeft, 
  CalendarClock, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  Bell, 
  Search, 
  Menu,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assets', href: '/assets', icon: Boxes },
  { name: 'Allocations', href: '/allocations', icon: ArrowRightLeft },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'Organization', href: '/organization', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false;
    
    // Employees can see Dashboard, Assets, Maintenance, and Settings
    if (user.role === 'EMPLOYEE') {
      return ['Dashboard', 'Assets', 'Maintenance', 'Settings'].includes(item.name);
    }
    
    // Asset Managers operate the asset lifecycle from their own dashboard.
    if (user.role === 'ASSET_MANAGER') {
      return ['Dashboard', 'Assets', 'Allocations', 'Maintenance', 'Audits', 'Settings'].includes(item.name);
    }
    
    // Department Heads see Dashboard, Assets, Allocations, Maintenance, Organization, Settings (no Audits)
    if (user.role === 'DEPARTMENT_HEAD') {
      return ['Dashboard', 'Assets', 'Allocations', 'Maintenance', 'Organization', 'Settings'].includes(item.name);
    }
    
    // Admin has access to everything
    return true;
  });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 ease-in-out flex flex-col md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 shrink-0 items-center px-6 border-b">
          <div className="bg-primary p-1.5 rounded-lg mr-2">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">AssetFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Navigation */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center flex-1">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search */}
            <div className="w-full max-w-md hidden sm:flex items-center relative">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search assets, employees..." 
                className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1" 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No notifications yet.</div>
                ) : notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onSelect={() => { if (!notification.isRead) markRead(notification.id); }}
                    className={`flex flex-col items-start p-3 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">{notification.message}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-3 pl-2 border-l">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground capitalize mt-1">{user?.role?.replace('_', ' ').toLowerCase()}</span>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary/20 text-primary">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
