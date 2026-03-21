/**
 * Spanish landing page — /es
 *
 * Translates the key conversion surfaces (Hero, Problem summary, Pricing CTA,
 * FAQ intro, Footer) into Spanish while reusing existing English components
 * for complex sections that don't yet have translations.
 *
 * Full component-level i18n is tracked in the roadmap.
 */

import { BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import { t } from '../../lib/i18n';
import Problem from '../components/Problem';
import Features from '../components/Features';
import IncidentTimeline from '../components/IncidentTimeline';
import AppShowcase from '../components/AppShowcase';
import Integrations from '../components/Integrations';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';

const LOCALE = 'es';

// ─── Spanish Hero ────────────────────────────────────────────────────────────

function HeroEs() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      padding: '140px 5% 0', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.08) 0%, transparent 70%)',
      }} />

      {/* Language toggle */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <a href="/" style={{ color: DIM, fontSize: '0.8rem', textDecoration: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 10px' }}>
          🌐 English
        </a>
      </div>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 20, padding: '6px 16px', marginBottom: 36,
        fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
        fontWeight: 700, letterSpacing: '0.12em', color: GREEN,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
        {t('hero.badge', LOCALE)}
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)', fontWeight: 900,
        lineHeight: 1.08, margin: '0 auto 28px', letterSpacing: '-0.03em',
        color: WHITE, maxWidth: 960,
      }}>
        {t('hero.headline_part1', LOCALE)}<br />
        <span style={{ color: GREEN }}>{t('hero.headline_part2', LOCALE)}</span>
      </h1>

      {/* Subtext */}
      <p style={{
        fontSize: 'clamp(1rem, 2.2vw, 1.22rem)', color: MUTED,
        maxWidth: 680, margin: '0 auto 20px', lineHeight: 1.7,
      }}>
        {t('hero.subtext', LOCALE)}
      </p>

      {/* Social proof */}
      <p style={{
        color: DIM, fontSize: '0.9rem', margin: '0 auto 52px',
        fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
      }}>
        {t('hero.proof', LOCALE)}
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
        <a href="/signup" style={{
          display: 'inline-block', padding: '15px 36px', fontSize: '1rem', fontWeight: 700,
          borderRadius: 8, border: 'none', background: GREEN, color: '#000',
          cursor: 'pointer', textDecoration: 'none',
        }}>
          {t('hero.cta_primary', LOCALE)}
        </a>
        <a href="#features" style={{
          display: 'inline-block', padding: '15px 36px', fontSize: '1rem', fontWeight: 600,
          borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
          color: MUTED, cursor: 'pointer', textDecoration: 'none',
        }}>
          {t('hero.cta_secondary', LOCALE)}
        </a>
      </div>

      {/* Free trial note */}
      <p style={{ color: DIM, fontSize: '0.8rem', marginBottom: 40 }}>
        ✓ {t('cta.free_trial', LOCALE)} &nbsp;·&nbsp; ✓ {t('cta.no_card', LOCALE)}
      </p>
    </section>
  );
}

// ─── Spanish section header wrapper ─────────────────────────────────────────

function SectionBanner({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 5% 20px' }}>
      <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: WHITE, marginBottom: 12 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: MUTED, fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─── Spanish Footer ───────────────────────────────────────────────────────────

function FooterEs() {
  return (
    <footer style={{
      background: '#060608', borderTop: `1px solid ${BORDER}`,
      padding: '40px 5%',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
        <span style={{ color: WHITE, fontWeight: 800, fontSize: '0.95rem' }}>TALLY</span>
        <span style={{ color: DIM, fontSize: '0.8rem', marginLeft: 8 }}>{t('footer.tagline', LOCALE)}</span>
      </div>
      <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <a href="/blog" style={{ color: DIM, textDecoration: 'none' }}>Blog</a>
        <a href="/help" style={{ color: DIM, textDecoration: 'none' }}>Ayuda</a>
        <a href="/terms" style={{ color: DIM, textDecoration: 'none' }}>Términos</a>
        <a href="/privacy" style={{ color: DIM, textDecoration: 'none' }}>Privacidad</a>
        <a href="/" style={{ color: GREEN, textDecoration: 'none', fontSize: '0.78rem', border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 5, padding: '2px 8px' }}>
          🌐 English
        </a>
      </div>
      <p style={{ color: DIM, fontSize: '0.78rem', width: '100%', margin: 0 }}>
        {t('footer.rights', LOCALE)}
      </p>
    </footer>
  );
}

// ─── Spanish FAQ ────────────────────────────────────────────────────────────

const FAQ_ES = [
  {
    q: '¿Funciona con mi equipo actual?',
    a: 'Sí. Tally es compatible con más de 26 dispositivos incluyendo ATEM, OBS, vMix, ProPresenter, Blackmagic, Ecamm, BirdDog, Teradek, y más. No necesitas reemplazar nada.',
  },
  {
    q: '¿Necesito saber programar para usarlo?',
    a: 'No. Tally está diseñado para directores técnicos voluntarios y pastores que no son técnicos. La configuración toma menos de 30 minutos. Usas Telegram para controlar todo.',
  },
  {
    q: '¿Cómo funciona la recuperación automática?',
    a: 'Tally monitorea constantemente tu equipo. Cuando detecta un problema (caída de bitrate, desconexión del ATEM, silencio de audio), ejecuta automáticamente la recuperación y alerta a tu director técnico por Telegram — todo en segundos.',
  },
  {
    q: '¿Qué tan seguro es?',
    a: 'Toda comunicación está encriptada. Tus credenciales de Telegram nunca se almacenan. El servidor funciona en infraestructura segura con backups automáticos.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'El plan Connect empieza en $49/mes e incluye monitoreo básico y recuperación automática. Hay una prueba gratuita de 30 días. No se requiere tarjeta de crédito para empezar.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí, puedes cancelar en cualquier momento desde el portal de tu iglesia. No hay contratos ni penalizaciones.',
  },
];

function FaqEs() {
  return (
    <section id="faq" style={{ padding: '80px 5%', maxWidth: 760, margin: '0 auto' }}>
      <SectionBanner title={t('faq.title', LOCALE)} />
      <div style={{ marginTop: 32 }}>
        {FAQ_ES.map((item, i) => (
          <div key={i} style={{
            borderBottom: `1px solid ${BORDER}`, padding: '22px 0',
          }}>
            <h3 style={{ color: WHITE, fontWeight: 700, fontSize: '1rem', margin: '0 0 10px' }}>{item.q}</h3>
            <p style={{ color: MUTED, fontSize: '0.92rem', margin: 0, lineHeight: 1.7 }}>{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Spanish Page ─────────────────────────────────────────────────────────────

export default function SpanishHome() {
  return (
    <div style={{ background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>
      <main id="main-content">
        <HeroEs />
        <div id="features">
          <SectionBanner
            title={t('features.title', LOCALE)}
            subtitle={t('features.subtitle', LOCALE)}
          />
          <Features />
        </div>
        <IncidentTimeline />
        <AppShowcase />
        <Integrations />
        <HowItWorks />
        <div id="pricing">
          <SectionBanner
            title={t('pricing.title', LOCALE)}
            subtitle={t('pricing.subtitle', LOCALE)}
          />
          <Pricing />
        </div>
        <Testimonials />
        <FaqEs />
      </main>
      <FooterEs />
    </div>
  );
}
