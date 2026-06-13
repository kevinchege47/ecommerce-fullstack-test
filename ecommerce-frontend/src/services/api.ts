import type {
  InventoryItem,
  Order,
  FareResponse,
  OrderFilters,
  PlaceOrderRequest,
  FareCalculateParams,
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL ?? '';

interface ApiError extends Error {
  status: number;
  body: Record<string, unknown>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    let errorBody: Record<string, unknown> = {};
    try { errorBody = await res.json(); } catch { /* non-JSON error body */ }
    const message = (errorBody?.error as string) ?? `HTTP ${res.status}`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  return res.json() as Promise<T>;
}


export const inventoryApi = {
  getAll: (): Promise<InventoryItem[]> =>
    request<InventoryItem[]>('/inventory'),

  getLowStock: (): Promise<InventoryItem[]> =>
    request<InventoryItem[]>('/inventory/low-stock'),
};


export const ordersApi = {
  getAll: ({ status, from, to }: OrderFilters = {}): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (from)   params.set('from', from);
    if (to)     params.set('to', to);
    const qs = params.toString();
    return request<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
  },

  place: (body: PlaceOrderRequest): Promise<Order> =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),

  cancel: (id: number): Promise<Order> =>
    request<Order>(`/orders/${id}`, { method: 'DELETE' }),
};



export const fareApi = {
  calculate: ({ distanceKm, surgeMultiplier }: FareCalculateParams): Promise<FareResponse> => {
    const params = new URLSearchParams({ distanceKm: String(distanceKm) });
    if (surgeMultiplier != null) params.set('surgeMultiplier', String(surgeMultiplier));
    return request<FareResponse>(`/fare/calculate?${params}`);
  },
};
