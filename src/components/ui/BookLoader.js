'use client';

/**
 * BookLoader — animated page-turning book loader from UIverse.io by anand_4957.
 *
 * Props:
 *   label {string}   — optional text shown below the book (default: "Loading...")
 *   size  {number}   — em-based scale multiplier (default: 1)
 */
export default function BookLoader({ label = 'Loading...', size = 1 }) {
  return (
    <div className="book-loader-wrapper" style={{ '--book-scale': size }}>
      <div className="book">
        <div className="book__pg-shadow" />
        <div className="book__pg" />
        <div className="book__pg book__pg--2" />
        <div className="book__pg book__pg--3" />
        <div className="book__pg book__pg--4" />
        <div className="book__pg book__pg--5" />
      </div>
      {label && <p className="book-loader-label">{label}</p>}
    </div>
  );
}

/**
 * PageLoader — full-screen centered BookLoader overlay.
 * Drop this in wherever you need a full-page loading state.
 */
export function PageLoader({ label }) {
  return (
    <div className="page-loader-screen">
      <BookLoader label={label} size={1.1} />
    </div>
  );
}
