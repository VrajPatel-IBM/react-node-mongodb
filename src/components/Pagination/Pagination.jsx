import { useState } from 'react';
import './Pagination.css';

function getPageNumbers(page, totalPages) {
  const pages = new Set([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const withEllipsis = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withEllipsis.push('...');
    withEllipsis.push(p);
  });
  return withEllipsis;
}

function Pagination({ page, totalPages, onPageChange }) {
  const [jumpValue, setJumpValue] = useState('');

  const goToPage = (target) => {
    const clamped = Math.min(Math.max(1, target), totalPages);
    onPageChange(clamped);
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(jumpValue);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    goToPage(Math.trunc(parsed));
    setJumpValue('');
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__nav"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        ‹ Prev
      </button>

      <ul className="pagination__pages">
        {getPageNumbers(page, totalPages).map((p, i) =>
          p === '...' ? (
            <li key={`ellipsis-${i}`} className="pagination__ellipsis">…</li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={`pagination__page${p === page ? ' pagination__page--active' : ''}`}
                onClick={() => goToPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="pagination__nav"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        Next ›
      </button>

      <form className="pagination__jump" onSubmit={handleJumpSubmit}>
        <label htmlFor="pagination-jump-input">Go to page</label>
        <input
          id="pagination-jump-input"
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          placeholder={String(page)}
        />
        <button type="submit">Go</button>
      </form>
    </nav>
  );
}

export default Pagination;
