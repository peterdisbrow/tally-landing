'use client';

export default function SkipNav() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute', left: '-9999px', top: 'auto',
        width: '1px', height: '1px', overflow: 'hidden',
        zIndex: 9999, padding: '12px 24px', background: '#22c55e',
        color: '#000', fontWeight: 700, borderRadius: 4,
        textDecoration: 'none', fontSize: '0.9rem',
      }}
      onFocus={(e) => { e.target.style.position = 'fixed'; e.target.style.left = '16px'; e.target.style.top = '16px'; e.target.style.width = 'auto'; e.target.style.height = 'auto'; }}
      onBlur={(e) => { e.target.style.position = 'absolute'; e.target.style.left = '-9999px'; e.target.style.width = '1px'; e.target.style.height = '1px'; }}
    >
      Skip to main content
    </a>
  );
}
