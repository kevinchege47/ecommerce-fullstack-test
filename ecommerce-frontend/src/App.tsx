import React, { useState } from 'react';
import InventoryTab from './components/inventory/InventoryTab';
import OrdersTab from './components/orders/OrdersTab';
import FareCalculator from './components/fare/FareCalculator';

type TabId = 'inventory' | 'orders' | 'fare';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'inventory', label: 'Inventory',       icon: '📦' },
  { id: 'orders',    label: 'Orders',          icon: '🧾' },
  { id: 'fare',      label: 'Fare Calculator', icon: '🚗' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('inventory');

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800 leading-tight">
                Cymelle Technologies
              </h1>
              <p className="text-xs text-slate-400">Operations Dashboard</p>
            </div>
          </div>
          <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            Local Dev
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1" role="tablist" aria-label="Dashboard tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'orders'    && <OrdersTab />}
        {activeTab === 'fare'      && <FareCalculator />}
      </main>
    </div>
  );
}
