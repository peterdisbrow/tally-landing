import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import { BLOG_POSTS } from '../../lib/blog';
import BlogCard from '../components/BlogCard';

export const metadata = {
  title: 'Blog — Tally',
  description: 'Church production tips, live streaming guides, and ATEM tutorials from the Tally team.',
  openGraph: {
    title: 'Blog — Tally',
    description: 'Church production tips, live streaming guides, and ATEM tutorials from the Tally team.',
    type: 'website',
    url: 'https://tallyconnect.app/blog',
  },
};

export default function BlogIndex() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Tally Blog',
    description: metadata.description,
    url: 'https://tallyconnect.app/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Tally',
      url: 'https://tallyconnect.app',
    },
    blogPost: BLOG_POSTS.map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      author: { '@type': 'Person', name: p.author },
      url: `https://tallyconnect.app/blog/${p.slug}`,
    })),
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BG,
        color: WHITE,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        padding: '48px 20px 80px',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Back link */}
        <a href="/" style={{ color: MUTED, textDecoration: 'none', fontSize: 13 }}>
          &larr; Back to Home
        </a>

        {/* Header */}
        <div style={{ marginTop: 24, marginBottom: 40 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              fontFamily: 'ui-monospace, monospace',
              color: GREEN,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            BLOG
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
            Church Production Insights
          </h1>
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
            Practical guides for church tech teams — live streaming, ATEM setup, volunteer training, and production monitoring.
          </p>
        </div>

        {/* Post grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {BLOG_POSTS.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
