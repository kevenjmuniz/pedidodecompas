
import React from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, isLoading } = useAuth();

  // If authentication is required and user is not logged in, redirect to login page
  if (requireAuth && !isLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
};
