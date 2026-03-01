import { CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

export default function BlogCard({ post }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="blog-card"
      style={{
        display: 'block',
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: '32px 28px',
        textDecoration: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {post.tags.map(tag => (
          <span
            key={tag}
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontFamily: 'ui-monospace, monospace',
              color: GREEN,
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: WHITE, margin: '0 0 10px', lineHeight: 1.3 }}>
        {post.title}
      </h3>

      {/* Excerpt */}
      <p style={{ fontSize: '0.9rem', color: MUTED, lineHeight: 1.6, margin: '0 0 16px' }}>
        {post.excerpt}
      </p>

      {/* Meta */}
      <div style={{ fontSize: '0.82rem', color: DIM }}>
        {post.date} &middot; {post.readTime}
      </div>
    </a>
  );
}
