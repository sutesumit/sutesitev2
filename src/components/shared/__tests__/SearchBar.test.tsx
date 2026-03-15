import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

// Mock Next.js router
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/byte',
}));

describe('SearchBar', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SearchBar placeholder="Search bytes..." />);
    expect(screen.getByPlaceholderText('Search bytes...')).toBeInTheDocument();
  });

  it('should render with initial value', () => {
    render(<SearchBar initialValue="test query" />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('should debounce search by 300ms', async () => {
    const user = userEvent.setup();
    render(<SearchBar basePath="/byte" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    // Should NOT have called immediately
    expect(mockReplace).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/byte?q=test&page=1',
          { scroll: false }
        );
      },
      { timeout: 400 }
    );
  });

  it('should reset page to 1 on search', async () => {
    const user = userEvent.setup();
    render(<SearchBar basePath="/byte" initialValue="old" />);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new');

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/byte?q=new&page=1',
          { scroll: false }
        );
      },
      { timeout: 400 }
    );
  });

  it('should handle empty query (remove param)', async () => {
    const user = userEvent.setup();
    render(<SearchBar basePath="/byte" initialValue="test" />);

    const input = screen.getByRole('textbox');
    await user.clear(input);

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/byte?page=1',
          { scroll: false }
        );
      },
      { timeout: 400 }
    );
  });

  it('should preserve other params when searching', async () => {
    const user = userEvent.setup();
    render(<SearchBar basePath="/byte" otherParams={{ sort: 'desc' }} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/byte?q=test&page=1&sort=desc',
          { scroll: false }
        );
      },
      { timeout: 400 }
    );
  });
});
