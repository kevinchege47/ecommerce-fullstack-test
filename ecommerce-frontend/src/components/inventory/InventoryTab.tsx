import React, { useEffect, useState, useCallback } from 'react';
import { inventoryApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner, ErrorState, EmptyState, Badge } from '../common';
import type { InventoryItem } from '../../types';


interface StockBarProps {
  quantity: number;
}

function StockBar({ quantity }: StockBarProps) {
  const MAX = 50;
  const pct = Math.min((quantity / MAX) * 100, 100);
  const color =
    quantity <= 3  ? 'bg-red-500' :
    quantity <= 10 ? 'bg-amber-400' :
                     'bg-emerald-500';
  return (
    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
        data-testid="stock-bar-fill"
      />
    </div>
  );
}


type FilterMode = 'all' | 'low';

export default function InventoryTab() {
  const [filter, setFilter] = useState<FilterMode>('all');
  const getAll = useCallback(() => inventoryApi.getAll(), []);
  const { data: items, loading, error, execute } = useApi<InventoryItem[]>(getAll, []);

  useEffect(() => { execute(); }, [execute]);

  const allItems: InventoryItem[] = items ?? [];
  const lowCount = allItems.filter(i => i.lowStock).length;
  const displayed = filter === 'low' ? allItems.filter(i => i.lowStock) : allItems;

  if (loading) return <LoadingSpinner message="Fetching inventory…" />;
  if (error)   return <ErrorState message={error} onRetry={execute} />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Inventory</h2>
          <p className="text-sm text-slate-400 mt-0.5">{allItems.length} items tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            All items
          </button>
          <button
            onClick={() => setFilter('low')}
            aria-label="Filter low stock"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${filter === 'low'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Low stock
            {lowCount > 0 && (
              <span
                data-testid="low-stock-count"
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${filter === 'low' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}
              >
                {lowCount}
              </span>
            )}
          </button>
          <button
            onClick={execute}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
            aria-label="Refresh inventory"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Low-stock banner */}
      {lowCount > 0 && filter === 'all' && (
        <div
          data-testid="low-stock-banner"
          className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm"
        >
          <span className="text-lg">⚠️</span>
          <span>
            <strong>{lowCount} item{lowCount > 1 ? 's' : ''}</strong> below the low-stock
            threshold.{' '}
            <button onClick={() => setFilter('low')} className="underline font-medium" aria-label="Switch to low stock view">
              Low stock
            </button>{' '}
            view to act.
          </span>
        </div>
      )}

      {displayed.length === 0 ? (
        <EmptyState
          title={filter === 'low' ? 'All stock levels are healthy' : 'No inventory items'}
          description={
            filter === 'low'
              ? 'No items are currently below the threshold.'
              : 'Items will appear here once added.'
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Product', 'SKU', 'Category', 'Unit Price', 'Stock', 'Status'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayed.map(item => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-slate-50/60 ${item.lowStock ? 'bg-red-50/30' : ''}`}
                  data-testid="inventory-row"
                >
                  <td className="px-4 py-3.5 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 text-xs">{item.sku}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium tabular-nums">
                    KES {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold tabular-nums w-6 text-right ${
                          item.quantity <= 3  ? 'text-red-600' :
                          item.quantity <= 10 ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {item.quantity}
                      </span>
                      <StockBar quantity={item.quantity} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.lowStock
                      ? <Badge variant="danger">⚠ Low</Badge>
                      : <Badge variant="success">OK</Badge>}
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
