import { ImageResponse } from 'next/og';
import { getPostBySlug } from '../../../lib/blog';

export const runtime = 'edge';
export const alt = 'Tally Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post ? post.title : 'Tally Blog';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#09090B',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Blog label */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#22c55e',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          TALLY BLOG
        </div>

        {/* Post title */}
        <div
          style={{
            fontSize: title.length > 50 ? 42 : 48,
            fontWeight: 900,
            color: '#F8FAFC',
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
            }}
          />
          <span style={{ color: '#475569', fontSize: 16 }}>tallyconnect.app/blog</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
