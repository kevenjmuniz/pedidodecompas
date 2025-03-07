
import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not authenticated and page requires auth
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && requireAuth) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth]);

  // If it's the login page or loading, don't show the navbar
  const showNavbar = isAuthenticated && requireAuth;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {showNavbar && <Navbar />}
      
      <motion.main 
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 ${showNavbar ? 'pt-24' : 'pt-6'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        key={location.pathname}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
