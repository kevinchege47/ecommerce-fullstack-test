import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import InventoryTab from './InventoryTab';
import {inventoryApi} from '../../services/api';
import type {InventoryItem} from '../../types';

jest.mock('../../services/api');
const mockedInventoryApi = inventoryApi as jest.Mocked<typeof inventoryApi>;

const ITEMS: InventoryItem[] = [
    {id: 1, name: 'Keyboard', sku: 'SKU-001', quantity: 25, unitPrice: 5500, category: 'Electronics', lowStock: false},
    {id: 2, name: 'Mouse Pad', sku: 'SKU-002', quantity: 3, unitPrice: 850, category: 'Accessories', lowStock: true},
    {id: 3, name: 'USB Hub', sku: 'SKU-003', quantity: 8, unitPrice: 3200, category: 'Electronics', lowStock: true},
];

let consoleError: jest.SpyInstance;

describe('InventoryTab', () => {

    beforeEach(() => {
        mockedInventoryApi.getAll.mockResolvedValue(ITEMS);
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
        });

    });

    afterEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        jest.clearAllMocks()
    });

    it('shows loading spinner before data arrives', () => {
        mockedInventoryApi.getAll.mockReturnValue(new Promise(() => {
        })); // never resolves
        render(<InventoryTab/>);
        expect(screen.getByRole('status', {name: /loading/i})).toBeInTheDocument();
    });

    it('renders all items after successful fetch', async () => {
        render(<InventoryTab/>);
        await waitFor(() => expect(screen.getAllByTestId('inventory-row')).toHaveLength(3));
        expect(screen.getByText('Keyboard')).toBeInTheDocument();
        expect(screen.getByText('Mouse Pad')).toBeInTheDocument();
        expect(screen.getByText('USB Hub')).toBeInTheDocument();
    });

    it('shows low-stock count badge when there are low-stock items', async () => {
        render(<InventoryTab/>);
        await waitFor(() => screen.getByTestId('low-stock-count'));
        expect(screen.getByTestId('low-stock-count')).toHaveTextContent('2');
    });

    it('shows low-stock banner when in all-items view', async () => {
        render(<InventoryTab/>);
        await waitFor(() => screen.getByTestId('low-stock-banner'));
        expect(screen.getByTestId('low-stock-banner')).toBeInTheDocument();
    });

    it('shows empty state when no items returned', async () => {
        mockedInventoryApi.getAll.mockResolvedValue([]);
        render(<InventoryTab/>);
        await waitFor(() => screen.getByText('No inventory items'));
    });

    it('shows healthy empty state when low-stock filter has no results', async () => {
        const healthyItems: InventoryItem[] = [
            {...ITEMS[0], lowStock: false},
        ];
        mockedInventoryApi.getAll.mockResolvedValue(healthyItems);
        render(<InventoryTab/>);
        await waitFor(() => screen.getAllByTestId('inventory-row'));

        fireEvent.click(screen.getByRole('button', {name: /low stock/i}));
        expect(screen.getByText('All stock levels are healthy')).toBeInTheDocument();
    });

    it('calls getAll on refresh button click', async () => {
        render(<InventoryTab/>);
        await waitFor(() => screen.getAllByTestId('inventory-row'));

        fireEvent.click(screen.getByRole('button', {name: /refresh inventory/i}));
        expect(mockedInventoryApi.getAll).toHaveBeenCalledTimes(2);
    });
});
