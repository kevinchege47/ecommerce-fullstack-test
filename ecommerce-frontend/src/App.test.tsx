import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

jest.mock('./components/inventory/InventoryTab', () => () => <div>Inventory Content</div>);
jest.mock('./components/orders/OrdersTab', () => () => <div>Orders Content</div>);
jest.mock('./components/fare/FareCalculator', () => () => <div>Fare Content</div>);

describe('App', () => {
  it('renders the brand name', () => {
    render(<App />);
    expect(screen.getByText('Cymelle Technologies')).toBeInTheDocument();
  });

  it('renders all three tab buttons', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /inventory/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /orders/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fare calculator/i })).toBeInTheDocument();
  });

  it('shows Inventory tab by default', () => {
    render(<App />);
    expect(screen.getByText('Inventory Content')).toBeInTheDocument();
    expect(screen.queryByText('Orders Content')).not.toBeInTheDocument();
  });

  it('switches to Orders tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /orders/i }));
    expect(screen.getByText('Orders Content')).toBeInTheDocument();
    expect(screen.queryByText('Inventory Content')).not.toBeInTheDocument();
  });

  it('switches to Fare Calculator tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /fare calculator/i }));
    expect(screen.getByText('Fare Content')).toBeInTheDocument();
  });

  it('active tab has aria-selected=true', () => {
    render(<App />);
    const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
    expect(inventoryTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: /orders/i }));
    expect(screen.getByRole('tab', { name: /orders/i })).toHaveAttribute('aria-selected', 'true');
    expect(inventoryTab).toHaveAttribute('aria-selected', 'false');
  });
});
