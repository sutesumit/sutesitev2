import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaginationControls from '../PaginationControls';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockPagination = {
  page: 2,
  limit: 10,
  total: 50,
  totalPages: 5,
  hasMore: true,
};

describe('PaginationControls', () => {
  it('should render pagination when there are multiple pages', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('should show "Showing X-Y of Z" text', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    expect(screen.getByText('Showing 11 - 20 of 50')).toBeInTheDocument();
  });

  it('should NOT render prev button on page 1', () => {
    renderWithRouter(
      <PaginationControls
        pagination={{ ...mockPagination, page: 1, hasMore: true }}
        basePath="/byte"
      />
    );

    expect(screen.queryByRole('link', { name: /prev/i })).not.toBeInTheDocument();
  });

  it('should NOT render next button on last page', () => {
    renderWithRouter(
      <PaginationControls
        pagination={{ ...mockPagination, page: 5, hasMore: false }}
        basePath="/byte"
      />
    );

    expect(screen.queryByRole('link', { name: /next/i })).not.toBeInTheDocument();
  });

  it('should render prev button when not on first page', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    expect(screen.getByRole('link', { name: /prev/i })).toBeInTheDocument();
  });

  it('should render next button when has more pages', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument();
  });

  it('should preserve search query in prev link', () => {
    renderWithRouter(
      <PaginationControls
        pagination={mockPagination}
        basePath="/byte"
        searchQuery="test"
      />
    );

    const prevLink = screen.getByRole('link', { name: /prev/i });
    // URLSearchParams may order params differently, so check both params exist
    expect(prevLink).toHaveAttribute('href', expect.stringContaining('q=test'));
    expect(prevLink).toHaveAttribute('href', expect.stringContaining('page=1'));
  });

  it('should preserve search query in next link', () => {
    renderWithRouter(
      <PaginationControls
        pagination={mockPagination}
        basePath="/byte"
        searchQuery="test"
      />
    );

    const nextLink = screen.getByRole('link', { name: /next/i });
    expect(nextLink).toHaveAttribute('href', expect.stringContaining('q=test'));
    expect(nextLink).toHaveAttribute('href', expect.stringContaining('page=3'));
  });

  it('should not render when only one page', () => {
    const { container } = renderWithRouter(
      <PaginationControls
        pagination={{ ...mockPagination, totalPages: 1, hasMore: false }}
        basePath="/byte"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle last page with partial items', () => {
    renderWithRouter(
      <PaginationControls
        pagination={{ page: 2, limit: 10, total: 15, totalPages: 2, hasMore: false }}
        basePath="/byte"
      />
    );

    expect(screen.getByText('Showing 11 - 15 of 15')).toBeInTheDocument();
  });
});
