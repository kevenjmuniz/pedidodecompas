
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ListPlus, 
  Package, 
  Users, 
  LogOut,
  Settings,
  UserCog
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useUser();

  const isAdmin = user?.role === 'admin';

  // Update the NavItems array to include the inventory link
  const NavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { label: 'Pedidos', path: '/new-order', icon: <ListPlus className="w-4 h-4 mr-2" /> },
    { label: 'Inventário', path: '/inventory', icon: <Package className="w-4 h-4 mr-2" /> },
    { label: 'Usuários', path: '/users', icon: <Users className="w-4 h-4 mr-2" />, adminOnly: true },
  ];

  return (
    <div className="bg-background border-b sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 container">
        <Link to="/dashboard" className="font-bold text-2xl">
          Sistema de Compras
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            {NavItems.map((item, index) => (
              (!item.adminOnly || isAdmin) && (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(location.pathname === item.path ? 'bg-secondary' : '')}
                >
                  <Link to={item.path} className="flex items-center">
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              )
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userData?.name} />
                  <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserCog className="h-4 w-4 mr-2" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
