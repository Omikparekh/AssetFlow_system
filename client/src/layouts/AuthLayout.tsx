import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Boxes } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Pane - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 flex-col justify-between p-12 border-r border-border relative overflow-hidden">
        
        {/* Logo */}
        <div className="flex items-center gap-2 z-10">
          <div className="bg-primary p-2 rounded-xl">
            <Boxes className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">AssetFlow</span>
        </div>

        {/* Hero Text */}
        <div className="z-10 max-w-lg mt-24">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Enterprise Asset & Resource Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Simplify tracking, allocation, and maintenance of your physical assets through a centralized, intelligent platform.
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-[10%] -right-[20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        
        <div className="z-10 text-sm text-muted-foreground mt-auto">
          &copy; {new Date().getFullYear()} AssetFlow Systems. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md mx-auto relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
