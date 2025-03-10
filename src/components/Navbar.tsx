
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  Home,
  Clipboard,
  Package,
  Settings,
  Truck,
  LogOut,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Logo = React.memo(() => {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2 shrink-0"
    >
      <motion.div
        className="bg-primary text-primary-foreground size-9 rounded-full flex items-center justify-center font-bold text-xl"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.1
        }}
      >
        P
      </motion.div>
      <motion.span
        className="font-bold text-lg hidden sm:inline-block"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Pedidos
      </motion.span>
    </Link>
  );
});

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      title: 'Pedidos',
      href: '/orders',
      icon: <Clipboard className="h-4 w-4 mr-2" />,
    },
    {
      title: 'Inventário',
      href: '/inventory',
      icon: <Package className="h-4 w-4 mr-2" />,
    },
    {
      title: 'Fornecedores',
      href: '/suppliers',
      icon: <Truck className="h-4 w-4 mr-2" />,
    },
    {
      title: 'Configurações',
      href: '/settings',
      icon: <Settings className="h-4 w-4 mr-2" />,
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />

          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon}
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-mcf-orange">
                  <AvatarFallback className="bg-mcf-orange/10 text-mcf-orange">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
