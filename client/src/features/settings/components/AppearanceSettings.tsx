import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how AssetFlow looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div 
              className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-8 w-8" />
              <Label className="cursor-pointer">Light Mode</Label>
            </div>
            
            <div 
              className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-8 w-8" />
              <Label className="cursor-pointer">Dark Mode</Label>
            </div>

            <div 
              className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${theme === 'system' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-8 w-8" />
              <Label className="cursor-pointer">System Default</Label>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};
