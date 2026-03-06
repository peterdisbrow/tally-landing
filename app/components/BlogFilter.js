'use client';

import { useState, useMemo } from 'react';
import { CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM, BG } from '../../lib/tokens';
import BlogCard from './BlogCard';

export default function BlogFilter({ posts, tags }) {
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = posts;
    if (activeTag) {
      result = result.filter(p => p.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeTag, search]);

  return (
    <>
      {/* Search + Filter bar */}
      <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke={DIM}
            strokeWidth={1.8}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              pointerEvents: 'none',
            }}
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="12.5" y1="12.5" x2="18" y2="18" />
          </svg>
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              fontSize: 14,
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              background: CARD_BG,
              color: WHITE,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = GREEN)}
            onBlur={e => (e.target.style.borderColor = BORDER)}
          />
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            onClick={() => setActiveTag(null)}
            style={pillStyle(activeTag === null)}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={pillStyle(activeTag === tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: DIM,
            fontSize: 15,
          }}
        >
          <p style={{ marginBottom: 8 }}>No articles found{search ? ` for "${search}"` : ''}.</p>
          <button
            onClick={() => {
              setSearch('');
              setActiveTag(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: GREEN,
              cursor: 'pointer',
              fontSize: 14,
              padding: 0,
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* Result count when filtering */}
      {(activeTag || search.trim()) && filtered.length > 0 && (
        <p style={{ color: DIM, fontSize: 13, marginTop: 16 }}>
          Showing {filtered.length} of {posts.length} article{posts.length !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}

function pillStyle(active) {
  return {
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: '0.04em',
    borderRadius: 20,
    border: `1px solid ${active ? GREEN : BORDER}`,
    background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
    color: active ? GREEN : MUTED,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  };
}
