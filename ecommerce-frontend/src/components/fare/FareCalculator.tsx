import React, { useState } from 'react';
import { fareApi } from '../../services/api';
import type { FareResponse } from '../../types';


interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function ResultRow({ label, value, highlight = false }: ResultRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        highlight ? 'border-t border-slate-200 mt-1 pt-3.5' : ''
      }`}
    >
      <dt className={`text-sm ${highlight ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
        {label}
      </dt>
      <dd
        className={`text-sm tabular-nums ${
          highlight ? 'font-bold text-slate-900 text-base' : 'text-slate-700'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}


interface FareFormState {
  distanceKm: string;
  surgeMultiplier: string;
}


export default function FareCalculator() {
  const [form, setForm] = useState<FareFormState>({ distanceKm: '', surgeMultiplier: '' });
  const [result, setResult] = useState<FareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setResult(null);

    const distKm = parseFloat(form.distanceKm);
    if (!distKm || distKm <= 0) {
      setError('Enter a valid distance greater than 0 km.');
      return;
    }

    setLoading(true);
    try {
      const surge = form.surgeMultiplier ? parseFloat(form.surgeMultiplier) : undefined;
      const data = await fareApi.calculate({ distanceKm: distKm, surgeMultiplier: surge });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Fare Calculator</h2>
        <p className="text-sm text-slate-400 mt-0.5">Estimate a trip fare in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Input card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-5">Trip details</h3>
          <form onSubmit={handleCalculate} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="distance" className="text-xs font-medium text-slate-500">
                Distance (km) <span className="text-red-500">*</span>
              </label>
              <input
                id="distance"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 12.5"
                value={form.distanceKm}
                onChange={e => setForm(p => ({ ...p, distanceKm: e.target.value }))}
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="surge" className="text-xs font-medium text-slate-500">
                Surge multiplier{' '}
                <span className="text-slate-400 font-normal">(optional — default 1.0)</span>
              </label>
              <input
                id="surge"
                type="number"
                min="1"
                step="0.1"
                placeholder="e.g. 1.5"
                value={form.surgeMultiplier}
                onChange={e => setForm(p => ({ ...p, surgeMultiplier: e.target.value }))}
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition"
              />
            </div>

            {error && (
              <p
                role="alert"
                data-testid="fare-error"
                className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Calculating…' : 'Calculate fare'}
            </button>
          </form>
        </div>

        {/* Result card */}
        <div
          data-testid="fare-result-card"
          className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
            result ? 'border-indigo-100 ring-1 ring-indigo-600/10' : 'border-slate-200'
          }`}
        >
          {!result ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-300 py-8 gap-3">
              <span className="text-5xl">🚗</span>
              <p className="text-sm">Enter trip details to see the fare breakdown</p>
            </div>
          ) : (
            <>
              <div className="mb-5 pb-5 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400 mb-1">Estimated fare</p>
                <div className="flex items-baseline gap-2">
                  <span
                    data-testid="fare-total"
                    className="text-4xl font-bold text-slate-900"
                  >
                    KES {result.finalFare.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400">{result.currency}</span>
                </div>
                {result.minimumApplied && (
                  <span
                    data-testid="minimum-badge"
                    className="inline-block mt-2 text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full"
                  >
                    Minimum fare applied
                  </span>
                )}
                {result.surgeMultiplier > 1 && (
                  <span
                    data-testid="surge-badge"
                    className="inline-block mt-2 ml-1 text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full"
                  >
                    ×{result.surgeMultiplier} surge active
                  </span>
                )}
              </div>

              <dl>
                <ResultRow label="Distance"        value={`${result.distanceKm} km`} />
                <ResultRow label="Base fare"       value={`KES ${result.baseFare}`} />
                <ResultRow label="Distance charge" value={`KES ${result.distanceCharge}`} />
                {result.surgeMultiplier > 1 && (
                  <ResultRow
                    label={`Surge ×${result.surgeMultiplier}`}
                    value={`KES ${result.calculatedFare}`}
                  />
                )}
                <ResultRow label="Final fare" value={`KES ${result.finalFare}`} highlight />
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
