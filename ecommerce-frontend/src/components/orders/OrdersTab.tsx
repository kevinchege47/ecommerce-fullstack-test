import React, { useEffect, useState, useCallback } from 'react';
import { ordersApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner, ErrorState, EmptyState, StatusBadge } from '../common';
import type { Order, OrderFilters, ToastState, ToastVariant } from '../../types';


const STATUS_OPTIONS = ['', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as const;

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}


interface ToastProps extends ToastState {
  onClose: () => void;
}

function Toast({ msg, variant, onClose }: ToastProps) {
  const styles: Record<ToastVariant, string> = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${styles[variant]}`}
    >
      {variant === 'error' ? '✗' : '✓'} {msg}
      <button onClick={onClose} className="opacity-70 hover:opacity-100 ml-2" aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}


interface FilterState {
  status: string;
  from: string;
  to: string;
}

export default function OrdersTab() {
  const [filters, setFilters] = useState<FilterState>({ status: '', from: '', to: '' });
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchFn = useCallback(
    (): Promise<Order[]> =>
      ordersApi.getAll({
        status: filters.status || undefined,
        from:   filters.from ? `${filters.from}T00:00:00` : undefined,
        to:     filters.to   ? `${filters.to}T23:59:59`   : undefined,
      } as OrderFilters),
    [filters],
  );

  const { data: orders, loading, error, execute } = useApi<Order[]>(fetchFn, []);
  useEffect(() => { execute(); }, [execute]);

  function showToast(msg: string, variant: ToastVariant = 'success'): void {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleCancel(id: number): Promise<void> {
    if (!window.confirm(`Cancel order #${id}? Stock will be restored.`)) return;
    setCancelling(id);
    try {
      await ordersApi.cancel(id);
      showToast(`Order #${id} cancelled — stock restored.`);
      execute();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cancel failed', 'error');
    } finally {
      setCancelling(null);
    }
  }

  const orderList: Order[] = orders ?? [];

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Order History</h2>
          <p className="text-sm text-slate-400 mt-0.5">{orderList.length} orders</p>
        </div>
        <button
          onClick={execute}
          aria-label="Refresh orders"
          className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ↺ Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={e => setFilters(p => ({ ...p, from: e.target.value }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={e => setFilters(p => ({ ...p, to: e.target.value }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600"
          />
        </div>

        <button
          onClick={() => setFilters({ status: '', from: '', to: '' })}
          className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Clear filters
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading orders…" />}
      {error   && <ErrorState message={error} onRetry={execute} />}

      {!loading && !error && orderList.length === 0 && (
        <EmptyState
          title="No orders found"
          description="Try adjusting your filters, or place a new order."
        />
      )}

      {!loading && !error && orderList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Customer', 'Item', 'Qty', 'Total', 'Status', 'Date', ''].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orderList.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors" data-testid="order-row">
                  <td className="px-4 py-3.5 font-mono text-slate-400 text-xs">#{order.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800">{order.customerName}</div>
                    <div className="text-xs text-slate-400">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-700">{order.itemName}</div>
                    <div className="text-xs font-mono text-slate-400">{order.itemSku}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 tabular-nums">{order.quantity}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800 tabular-nums">
                    KES {order.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelling === order.id}
                        aria-label={`Cancel order ${order.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling === order.id ? '…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
