import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import { BLOG_POSTS, getAllTags } from '../../lib/blog';
import BlogFilter from '../components/BlogFilter';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

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
  const tags = getAllTags();

  /* Strip non-serializable `content` function from posts for the client component */
  const serializablePosts = BLOG_POSTS.map(({ content, ...rest }) => rest);

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
    <>
      <Nav />
      <main
        style={{
          minHeight: '100vh',
          background: BG,
          color: WHITE,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          paddingTop: 80,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 80,
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
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

        {/* Filter + Post grid */}
        <BlogFilter posts={serializablePosts} tags={tags} />
      </div>
    </main>
    <Footer />
    </>
  );
}
