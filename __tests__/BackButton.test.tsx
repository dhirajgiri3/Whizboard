import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('BackButton', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        length: 2,
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<BackButton />);
    
    const button = screen.getByRole('button', { name: /go back to back/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('renders with custom label', () => {
    render(<BackButton label="Back to Dashboard" />);
    
    const button = screen.getByRole('button', { name: /go back to back to dashboard/i });
    expect(button).toBeInTheDocument();
  });

  it('calls router.back() when history exists', async () => {
    Object.defineProperty(window, 'history', {
      value: { length: 3 },
      writable: true,
    });

    render(<BackButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('calls router.push() when no history', async () => {
    Object.defineProperty(window, 'history', {
      value: { length: 1 },
      writable: true,
    });

    render(<BackButton fallbackHref="/dashboard" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles custom onBack function', async () => {
    const customOnBack = jest.fn();
    render(<BackButton onBack={customOnBack} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(customOnBack).toHaveBeenCalled();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<BackButton />);
    
    const button = screen.getByRole('button');
    button.focus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('handles disabled state', () => {
    render(<BackButton disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<BackButton variant="light" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('text-slate-700', 'bg-white');

    rerender(<BackButton variant="dark" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-white/90', 'bg-white/10');

    rerender(<BackButton variant="minimal" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-slate-600', 'hover:bg-slate-100');
  });

  it('applies correct position styles', () => {
    const { rerender } = render(<BackButton position="fixed" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('fixed', 'top-4', 'left-4', 'z-40');

    rerender(<BackButton position="absolute" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('absolute', 'top-4', 'left-4', 'z-10');

    rerender(<BackButton position="relative" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('relative');

    rerender(<BackButton position="sticky" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('sticky', 'top-4', 'z-10');
  });

  it('applies correct size styles', () => {
    const { rerender } = render(<BackButton size="sm" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'px-2.5', 'text-xs');

    rerender(<BackButton size="md" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'px-3', 'text-sm');

    rerender(<BackButton size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-12', 'px-4', 'text-base');
  });

  it('hides label when showLabel is false', () => {
    render(<BackButton showLabel={false} />);
    
    const button = screen.getByRole('button', { name: /go back/i });
    expect(button).toBeInTheDocument();
    
    // Label should not be visible
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('handles loading state', async () => {
    const customOnBack = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<BackButton onBack={customOnBack} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should show loading state
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<BackButton label="Back to Dashboard" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Go back to Back to Dashboard');
    expect(button).toHaveAttribute('type', 'button');
  });
});
