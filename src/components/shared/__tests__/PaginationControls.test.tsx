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
  it('should render page numbers when there are multiple pages', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    // Should render page numbers 1, 2, 3, 4, 5
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render current page as a span', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    const currentPage = screen.getByText('2');
    expect(currentPage.tagName).toBe('SPAN');
    expect(currentPage).toHaveClass('bg-blue-600');
  });

  it('should render other pages as links', () => {
    renderWithRouter(
      <PaginationControls pagination={mockPagination} basePath="/byte" />
    );

    const page1 = screen.getByRole('link', { name: /Page 1/i });
    expect(page1).toHaveAttribute('href', '/byte?page=1');

    const page3 = screen.getByRole('link', { name: /Page 3/i });
    expect(page3).toHaveAttribute('href', '/byte?page=3');
  });

  it('should preserve search query in links', () => {
    renderWithRouter(
      <PaginationControls
        pagination={mockPagination}
        basePath="/byte"
        searchQuery="test"
      />
    );

    const page1 = screen.getByRole('link', { name: /Page 1/i });
    expect(page1.getAttribute('href')).toContain('q=test');
    expect(page1.getAttribute('href')).toContain('page=1');
  });

  it('should render ellipsis for many pages', () => {
    renderWithRouter(
      <PaginationControls
        pagination={{ ...mockPagination, page: 5, totalPages: 10 }}
        basePath="/byte"
      />
    );

    // For page 5 of 10, it should show 1, ..., 4, 5, 6, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
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
});
