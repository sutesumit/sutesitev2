import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClapsCounter from '../ClapsCounter';

vi.mock('@/components/shared/ScrambleText', () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock('@/hooks/useClaps', () => ({
  useClaps: vi.fn(),
}));

vi.mock('@/lib/utils/fingerprint', () => ({
  getOrCreateFingerprint: vi.fn(() => 'test-fingerprint'),
}));

import { useClaps } from '@/hooks/useClaps';
const mockUseClaps = useClaps as ReturnType<typeof vi.fn>;

describe('ClapsCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockReturn = (overrides = {}) => ({
    totalClaps: 0,
    userClaps: 0,
    isLoading: true,
    maxReached: false,
    clap: vi.fn(),
    ...overrides,
  });

  it('should render loading state with "xxx"', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: true }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    expect(screen.getByText('xxx')).toBeInTheDocument();
  });

  it('should display clap count after loading', async () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 42 }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    expect(screen.getByText('042')).toBeInTheDocument();
  });

  it('should render in interactive mode by default', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 10 }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should render in non-interactive mode when disabled', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 10 }));
    render(<ClapsCounter postId="test-id" postType="bloq" interactive={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call clap function on click when interactive', async () => {
    const mockClap = vi.fn();
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 10, clap: mockClap })
    );
    
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    
    const button = screen.getByRole('button');
    await userEvent.setup().click(button);
    
    expect(mockClap).toHaveBeenCalledTimes(1);
  });

  it('should not call clap function on click when non-interactive', async () => {
    const mockClap = vi.fn();
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 10, clap: mockClap })
    );
    
    render(<ClapsCounter postId="test-id" postType="bloq" interactive={false} />);
    
    const button = screen.getByRole('button');
    await userEvent.setup().click(button);
    
    expect(mockClap).not.toHaveBeenCalled();
  });

  it('should disable button when maxReached is true', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 50, maxReached: true }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should disable button when maxReached in non-interactive mode', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 50, maxReached: true }));
    render(<ClapsCounter postId="test-id" postType="bloq" interactive={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show optimistic update when clap is clicked', async () => {
    const mockClap = vi.fn();
    
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 10, clap: mockClap })
    );
    
    const { rerender } = render(<ClapsCounter postId="test-id" postType="bloq" />);
    expect(screen.getByText('010')).toBeInTheDocument();

    // Simulate state update after clap
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 11, clap: mockClap })
    );
    
    rerender(<ClapsCounter postId="test-id" postType="bloq" />);
    
    await waitFor(() => {
      expect(screen.getByText('011')).toBeInTheDocument();
    });
  });

  it('should display correct aria-label when loading', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: true }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Loading claps count...');
  });

  it('should display correct aria-label with claps count', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 25 }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '25 claps');
  });

  it('should display correct aria-label when max reached', () => {
    mockUseClaps.mockReturnValue(createMockReturn({ isLoading: false, totalClaps: 50, maxReached: true }));
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '50 claps (max reached)');
  });

  it('should handle enter key to clap when interactive', async () => {
    const mockClap = vi.fn();
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 10, clap: mockClap })
    );
    
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.setup().keyboard('{Enter}');
    
    expect(mockClap).toHaveBeenCalledTimes(1);
  });

  it('should handle space key to clap when interactive', async () => {
    const mockClap = vi.fn();
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 10, clap: mockClap })
    );
    
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.setup().keyboard(' ');
    
    expect(mockClap).toHaveBeenCalledTimes(1);
  });

  it('should not handle key events when non-interactive', async () => {
    const mockClap = vi.fn();
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 10, clap: mockClap })
    );
    
    render(<ClapsCounter postId="test-id" postType="bloq" interactive={false} />);
    
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.setup().keyboard('{Enter}');
    
    expect(mockClap).not.toHaveBeenCalled();
  });

  it('should not handle key events when maxReached', async () => {
    const mockClap = vi.fn();
    mockUseClaps.mockReturnValue(
      createMockReturn({ isLoading: false, totalClaps: 50, maxReached: true, clap: mockClap })
    );
    
    render(<ClapsCounter postId="test-id" postType="bloq" />);
    
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.setup().keyboard('{Enter}');
    
    expect(mockClap).not.toHaveBeenCalled();
  });
});
