
export type OrderStatus = 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category: string;
  lowStock: boolean;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface FareResponse {
  distanceKm: number;
  baseFare: number;
  distanceCharge: number;
  surgeMultiplier: number;
  calculatedFare: number;
  finalFare: number;
  minimumApplied: boolean;
  currency: string;
}


export interface OrderFilters {
  status?: string;
  from?: string;
  to?: string;
}

export interface PlaceOrderRequest {
  customerName: string;
  customerEmail: string;
  inventoryItemId: number;
  quantity: number;
}

export interface FareCalculateParams {
  distanceKm: number;
  surgeMultiplier?: number;
}


export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

export type ToastVariant = 'success' | 'error';

export interface ToastState {
  msg: string;
  variant: ToastVariant;
}
