import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingSpinner, ErrorState, EmptyState, Badge, StatusBadge } from './index';


describe('LoadingSpinner', () => {
  it('renders default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingSpinner message="Fetching data…" />);
    expect(screen.getByText('Fetching data…')).toBeInTheDocument();
  });

  it('renders the spinner element with aria-label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});


describe('ErrorState', () => {
  it('renders the error message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has alert role', () => {
    render(<ErrorState message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('renders retry button and calls onRetry when clicked', () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});


describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Nothing here" description="Add some items to get started." />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add some items to get started.')).toBeInTheDocument();
  });

  it('renders optional action element', () => {
    render(
      <EmptyState
        title="Empty"
        description="No data."
        action={<button>Add item</button>}
      />,
    );
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('does not render action slot when not provided', () => {
    const { container } = render(<EmptyState title="Empty" description="No data." />);
    expect(container.querySelectorAll('.mt-3')).toHaveLength(0);
  });
});


describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default styles when no variant provided', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('bg-slate-100');
    expect(badge.className).toContain('text-slate-600');
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success">OK</Badge>);
    const badge = screen.getByText('OK');
    expect(badge.className).toContain('bg-emerald-100');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warn</Badge>);
    const badge = screen.getByText('Warn');
    expect(badge.className).toContain('bg-amber-100');
  });

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-700');
  });
});


describe('StatusBadge', () => {
  it('renders PROCESSING with warning styles', () => {
    render(<StatusBadge status="PROCESSING" />);
    const badge = screen.getByText('PROCESSING');
    expect(badge.className).toContain('bg-amber-100');
  });

  it('renders DELIVERED with success styles', () => {
    render(<StatusBadge status="DELIVERED" />);
    const badge = screen.getByText('DELIVERED');
    expect(badge.className).toContain('bg-emerald-100');
  });

  it('renders CANCELLED with danger styles', () => {
    render(<StatusBadge status="CANCELLED" />);
    const badge = screen.getByText('CANCELLED');
    expect(badge.className).toContain('bg-red-100');
  });
});
