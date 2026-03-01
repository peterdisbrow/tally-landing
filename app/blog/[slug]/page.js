import { notFound } from 'next/navigation';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../../lib/tokens';
import { BLOG_POSTS, getPostBySlug, getAllSlugs, getRelatedPosts } from '../../../lib/blog';
import BlogCTA from '../../components/BlogCTA';
import BlogCard from '../../components/BlogCard';

export function generateStaticParams() {
  return getAllSlugs();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      url: `https://tallyconnect.app/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
    },
    alternates: {
      canonical: `https://tallyconnect.app/blog/${post.slug}`,
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 2);
  const Content = post.content;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tally',
      url: 'https://tallyconnect.app',
    },
    mainEntityOfPage: `https://tallyconnect.app/blog/${post.slug}`,
    keywords: post.keywords.join(', '),
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

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Back link */}
        <a href="/blog" style={{ color: MUTED, textDecoration: 'none', fontSize: 13 }}>
          &larr; Back to Blog
        </a>

        {/* Article card */}
        <div
          style={{
            marginTop: 14,
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: '40px 36px',
          }}
        >
          {/* Tags */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
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
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.2 }}>
            {post.title}
          </h1>

          {/* Meta */}
          <div style={{ fontSize: 13, color: DIM, marginBottom: 24 }}>
            {post.date} &middot; {post.readTime} &middot; By {post.author}
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '0 0 28px' }} />

          {/* Article content */}
          <article>
            <Content />
          </article>

          {/* CTA */}
          <BlogCTA />
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: WHITE }}>
              More from the blog
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              {related.map(p => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
