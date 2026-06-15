import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrdersTab from './OrdersTab';
import { ordersApi } from '../../services/api';
import type { Order } from '../../types';

jest.mock('../../services/api');
const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;
let consoleError: jest.SpyInstance;


const ORDERS: Order[] = [
  {
    id: 1, customerName: 'Alice Wanjiku', customerEmail: 'alice@example.com',
    itemName: 'Keyboard', itemSku: 'SKU-001', quantity: 2,
    totalPrice: 11000, status: 'PROCESSING', createdAt: '2024-06-01T10:00:00',
  },
  {
    id: 2, customerName: 'Brian Ochieng', customerEmail: 'brian@example.com',
    itemName: 'Mouse Pad', itemSku: 'SKU-002', quantity: 1,
    totalPrice: 850, status: 'DELIVERED', createdAt: '2024-05-28T09:00:00',
  },
  {
    id: 3, customerName: 'Carol Mutua', customerEmail: 'carol@example.com',
    itemName: 'USB Hub', itemSku: 'SKU-003', quantity: 1,
    totalPrice: 3200, status: 'CANCELLED', createdAt: '2024-05-20T08:00:00',
  },
];

describe('OrdersTab', () => {
  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedOrdersApi.getAll.mockResolvedValue(ORDERS);
    (window.confirm as jest.Mock) = jest.fn(() => true);
  });

  afterEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks()});

  it('shows loading spinner before data arrives', () => {
    mockedOrdersApi.getAll.mockReturnValue(new Promise(() => {}));
    render(<OrdersTab />);
    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
  });

  it('renders all orders after successful fetch', async () => {
    render(<OrdersTab />);
    await waitFor(() => expect(screen.getAllByTestId('order-row')).toHaveLength(3));
    expect(screen.getByText('Alice Wanjiku')).toBeInTheDocument();
    expect(screen.getByText('Brian Ochieng')).toBeInTheDocument();
    expect(screen.getByText('Carol Mutua')).toBeInTheDocument();
  });

  it('shows order count in the subtitle', async () => {
    render(<OrdersTab />);
    await waitFor(() => screen.getByText('3 orders'));
  });

  it('renders Cancel button only for PROCESSING orders', async () => {
    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));

    const cancelButtons = screen.getAllByRole('button', { name: /cancel order/i });
    expect(cancelButtons).toHaveLength(1); // only Alice's order
  });

  it('calls ordersApi.cancel and refetches on confirm', async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(true);
    mockedOrdersApi.cancel.mockResolvedValue({ ...ORDERS[0], status: 'CANCELLED' });

    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));
    expect(mockedOrdersApi.getAll).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /cancel order 1/i }));

    await waitFor(() => {
      expect(mockedOrdersApi.cancel).toHaveBeenCalledWith(1);
      expect(mockedOrdersApi.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('does not cancel when user dismisses confirm dialog', async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));

    fireEvent.click(screen.getByRole('button', { name: /cancel order 1/i }));

    expect(mockedOrdersApi.cancel).not.toHaveBeenCalled();
  });

  it('shows error toast when cancel fails', async () => {
    mockedOrdersApi.cancel.mockClear();
    mockedOrdersApi.cancel.mockRejectedValue(new Error('Cancel failed'));
    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));

    fireEvent.click(screen.getByRole('button', { name: /cancel order 1/i }));

    await waitFor(() => screen.getByText(/cancel failed/i));
    expect(screen.getByText(/cancel failed/i)).toBeInTheDocument();
  });


  it('shows empty state when no orders returned', async () => {
    mockedOrdersApi.getAll.mockResolvedValue([]);
    render(<OrdersTab />);
    await waitFor(() => screen.getByText('No orders found'));
  });

  it('clears filters when Clear filters is clicked', async () => {
    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PROCESSING' } });
    expect((select as HTMLSelectElement).value).toBe('PROCESSING');

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect((select as HTMLSelectElement).value).toBe('');
  });

  it('passes status filter to ordersApi.getAll', async () => {
    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DELIVERED' } });

    await waitFor(() =>
      expect(mockedOrdersApi.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'DELIVERED' }),
      ),
    );
  });

  it('refetches when refresh button clicked', async () => {
    render(<OrdersTab />);
    await waitFor(() => screen.getAllByTestId('order-row'));

    fireEvent.click(screen.getByRole('button', { name: /refresh orders/i }));
    expect(mockedOrdersApi.getAll).toHaveBeenCalledTimes(2);
  });
});
