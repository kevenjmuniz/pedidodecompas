
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Menu, X, LogOut, Plus, Home, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-primary font-semibold text-xl">Sistema de Pedidos</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center -mr-2 sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              className="inline-flex items-center justify-center"
              aria-label="Main menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground">
              <Link to="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground">
              <Link to="/new-order">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Link>
            </Button>
            
            {user && user.role === 'admin' && (
              <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground">
                <Link to="/users">
                  <Users className="mr-2 h-4 w-4" />
                  Usuários
                </Link>
              </Button>
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <User className="mr-2 h-4 w-4" />
                    {user.name}
                    {user.role === 'admin' && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Admin</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/users">
                        <Users className="mr-2 h-4 w-4" />
                        Gerenciar Usuários
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden animate-slide-up">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Button variant="ghost" asChild className="w-full justify-start text-foreground/80 hover:text-foreground">
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full justify-start text-foreground/80 hover:text-foreground">
              <Link to="/new-order" onClick={() => setIsMenuOpen(false)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Link>
            </Button>
            
            {user && user.role === 'admin' && (
              <Button variant="ghost" asChild className="w-full justify-start text-foreground/80 hover:text-foreground">
                <Link to="/users" onClick={() => setIsMenuOpen(false)}>
                  <Users className="mr-2 h-4 w-4" />
                  Usuários
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
