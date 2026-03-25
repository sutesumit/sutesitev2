import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ViewCounter from '../ViewCounter';

vi.mock('@/components/shared/ScrambleText', () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe('ViewCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state with "xxx"', async () => {
    render(<ViewCounter type="bloq" identifier="test-slug" />);
    const spans = screen.getAllByText('xxx');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('should display view count after loading', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: 42 }),
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="bloq" identifier="test-slug" />);

    await waitFor(() => {
      expect(screen.getByText('042')).toBeInTheDocument();
    });
  });

  it('should handle bloq content type', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: 100 }),
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="bloq" identifier="my-bloq" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/views?type=bloq&id=my-bloq', expect.any(Object));
    });
  });

  it('should handle byte content type', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: 50 }),
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="byte" identifier="123" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/views?type=byte&id=123', expect.any(Object));
    });
  });

  it('should handle blip content type', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: 25 }),
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="blip" identifier="456" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/views?type=blip&id=456', expect.any(Object));
    });
  });

  it('should handle project content type', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: 75 }),
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="project" identifier="my-project" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/views?type=project&id=my-project', expect.any(Object));
    });
  });

  it('should re-render when identifier changes', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: 10 }),
        })
      ) as jest.Mock
    );

    const { rerender } = render(<ViewCounter type="bloq" identifier="slug-1" />);

    await waitFor(() => {
      expect(screen.getByText('010')).toBeInTheDocument();
    });

    fetchSpy.mockClear();

    rerender(<ViewCounter type="bloq" identifier="slug-2" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/views?type=bloq&id=slug-2', expect.any(Object));
    });
  });

  it('should show 000 on API error response', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="bloq" identifier="test-slug" />);

    await waitFor(() => {
      expect(screen.getByText('000')).toBeInTheDocument();
    });
  });

  it('should show 000 on fetch error', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock
    );

    render(<ViewCounter type="bloq" identifier="test-slug" />);

    await waitFor(() => {
      expect(screen.getByText('000')).toBeInTheDocument();
    });
  });

  it('should handle null views from API', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ views: null }),
        })
      ) as jest.Mock
    );

    render(<ViewCounter type="bloq" identifier="test-slug" />);

    await waitFor(() => {
      expect(screen.getByText('000')).toBeInTheDocument();
    });
  });
});
