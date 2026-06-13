import React, { ReactNode } from 'react';
import type { BadgeVariant, OrderStatus } from '../../types';


interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <div
        className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm">{message}</p>
    </div>
  );
}


interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3" role="alert">
      <div className="text-4xl">⚠️</div>
      <p className="text-slate-600 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}


interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
      <div className="text-4xl mb-2">📭</div>
      <h3 className="text-slate-700 font-semibold">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}


interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[variant]}`}
    >
      {children}
    </span>
  );
}


interface StatusBadgeProps {
  status: OrderStatus;
}

const STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PROCESSING: 'warning',
  DELIVERED:  'success',
  CANCELLED:  'danger',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
