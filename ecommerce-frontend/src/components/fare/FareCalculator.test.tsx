import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FareCalculator from './FareCalculator';
import { fareApi } from '../../services/api';
import type { FareResponse } from '../../types';

jest.mock('../../services/api');
const mockedFareApi = fareApi as jest.Mocked<typeof fareApi>;

const NORMAL_FARE: FareResponse = {
  distanceKm: 10,
  baseFare: 50,
  distanceCharge: 150,
  surgeMultiplier: 1,
  calculatedFare: 200,
  finalFare: 200,
  minimumApplied: false,
  currency: 'KES',
};

const SURGE_FARE: FareResponse = {
  ...NORMAL_FARE,
  surgeMultiplier: 1.5,
  calculatedFare: 300,
  finalFare: 300,
};

const MINIMUM_FARE: FareResponse = {
  distanceKm: 0.1,
  baseFare: 50,
  distanceCharge: 1.5,
  surgeMultiplier: 1,
  calculatedFare: 51.5,
  finalFare: 80,
  minimumApplied: true,
  currency: 'KES',
};

describe('FareCalculator', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders the form with distance and surge inputs', () => {
    render(<FareCalculator />);
    expect(screen.getByLabelText(/distance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/surge multiplier/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate fare/i })).toBeInTheDocument();
  });

  it('shows placeholder prompt before any calculation', () => {
    render(<FareCalculator />);
    expect(screen.getByText(/enter trip details/i)).toBeInTheDocument();
  });

  it('shows validation error when submitted with no distance', async () => {
    render(<FareCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));
    await waitFor(() => screen.getByTestId('fare-error'));
    expect(screen.getByTestId('fare-error')).toHaveTextContent(/valid distance/i);
    expect(mockedFareApi.calculate).not.toHaveBeenCalled();
  });

  it('shows validation error for zero distance', async () => {
    render(<FareCalculator />);
    await userEvent.type(screen.getByLabelText(/distance/i), '0');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));
    await waitFor(() => screen.getByTestId('fare-error'));
    expect(mockedFareApi.calculate).not.toHaveBeenCalled();
  });

  it('calls fareApi.calculate with correct params', async () => {
    mockedFareApi.calculate.mockResolvedValue(NORMAL_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() =>
      expect(mockedFareApi.calculate).toHaveBeenCalledWith({
        distanceKm: 10,
        surgeMultiplier: undefined,
      }),
    );
  });

  it('passes surge multiplier when provided', async () => {
    mockedFareApi.calculate.mockResolvedValue(SURGE_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    await userEvent.type(screen.getByLabelText(/surge multiplier/i), '1.5');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() =>
      expect(mockedFareApi.calculate).toHaveBeenCalledWith({
        distanceKm: 10,
        surgeMultiplier: 1.5,
      }),
    );
  });

  it('displays fare total after successful calculation', async () => {
    mockedFareApi.calculate.mockResolvedValue(NORMAL_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() => screen.getByTestId('fare-total'));
    expect(screen.getByTestId('fare-total')).toHaveTextContent('KES 200');
  });

  it('shows minimum fare badge when minimum was applied', async () => {
    mockedFareApi.calculate.mockResolvedValue(MINIMUM_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '0.1');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() => screen.getByTestId('minimum-badge'));
    expect(screen.getByTestId('minimum-badge')).toHaveTextContent(/minimum fare applied/i);
  });

  it('does not show minimum badge for normal fare', async () => {
    mockedFareApi.calculate.mockResolvedValue(NORMAL_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() => screen.getByTestId('fare-total'));
    expect(screen.queryByTestId('minimum-badge')).not.toBeInTheDocument();
  });

  it('shows surge badge when surge multiplier > 1', async () => {
    mockedFareApi.calculate.mockResolvedValue(SURGE_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    await userEvent.type(screen.getByLabelText(/surge multiplier/i), '1.5');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() => screen.getByTestId('surge-badge'));
    expect(screen.getByTestId('surge-badge')).toHaveTextContent('×1.5 surge active');
  });

  it('does not show surge badge for multiplier of 1', async () => {
    mockedFareApi.calculate.mockResolvedValue(NORMAL_FARE);
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() => screen.getByTestId('fare-total'));
    expect(screen.queryByTestId('surge-badge')).not.toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    mockedFareApi.calculate.mockRejectedValue(new Error('Service unavailable'));
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    await waitFor(() => screen.getByTestId('fare-error'));
    expect(screen.getByTestId('fare-error')).toHaveTextContent('Service unavailable');
  });

  it('clears previous result before a new calculation', async () => {
    mockedFareApi.calculate
      .mockResolvedValueOnce(NORMAL_FARE)
      .mockResolvedValueOnce(SURGE_FARE);

    render(<FareCalculator />);
    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));
    await waitFor(() => screen.getByTestId('fare-total'));

    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));
    await waitFor(() => expect(mockedFareApi.calculate).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('fare-total')).toHaveTextContent('KES 300');
  });

  it('button shows calculating state while loading', async () => {
    mockedFareApi.calculate.mockReturnValue(new Promise(() => {}));
    render(<FareCalculator />);

    await userEvent.type(screen.getByLabelText(/distance/i), '10');
    fireEvent.click(screen.getByRole('button', { name: /calculate fare/i }));

    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled();
  });
});
