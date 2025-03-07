
import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '../context/OrderContext';
import { Clock, CheckCircle, Timer } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true
}) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pendente':
        return {
          icon: Clock,
          label: 'Pendente',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'aguardando':
        return {
          icon: Timer,
          label: 'Aguardando Compra',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'resolvido':
        return {
          icon: CheckCircle,
          label: 'Resolvido',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      default:
        return {
          icon: Clock,
          label: 'Desconhecido',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const { icon: Icon, label, bgColor, textColor, borderColor } = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        bgColor,
        textColor,
        borderColor,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5')} />}
      {label}
    </span>
  );
};
