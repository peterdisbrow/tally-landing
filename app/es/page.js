/**
 * Spanish landing page — /es
 *
 * All user-visible text is in Spanish. Components are inlined here
 * following the same pattern as HeroEs / FaqEs / FooterEs.
 *
 * 'use client' is required because AppShowcaseEs, PricingEs, and
 * FeatureComparisonEs use useState for tabs / billing toggle / expand.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import { t } from '../../lib/i18n';

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
          EN · English
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

// ─── Spanish Features ────────────────────────────────────────────────────────

const FEATURES_ES = [
  { tag: 'CONMUTACIÓN DE SEÑAL', name: 'Señal Perdida — Tally Cambia Instantáneamente', desc: 'El diagnóstico multi-señal detecta pérdida de video, silencio de audio y desconexiones del ATEM. Cambia automáticamente a una fuente segura, alerta a tu DT y verifica la estabilidad antes de volver.' },
  { tag: 'AUTO-RECUPERACIÓN',   name: 'El Stream se Cae — Tally lo Arregla',           desc: 'La auto-recuperación reinicia tu stream antes de que la congregación lo note. Funciona con OBS, vMix y codificadores de hardware.' },
  { tag: 'ALERTAS',             name: 'Alertas por Slack + Telegram',                   desc: 'Tu DT recibe una alerta en Slack o Telegram en segundos — con pasos de diagnóstico y confirmación con un toque. Escalación si nadie responde en 5 minutos.' },
  { tag: 'PRE-SERVICIO',        name: 'Verificación Automática del Sistema',            desc: 'Confirmación de luz verde 30 min antes de cada servicio. Cada dispositivo probado, cada conexión verificada. Sin más recorridos manuales.' },
  { tag: 'CONTROL REMOTO',      name: 'Control Profundo de ProPresenter + ATEM',        desc: 'Corta cámaras, avanza diapositivas, activa looks, envía mensajes al escenario, inicia temporizadores — todo desde tu teléfono o Telegram.' },
  { tag: 'COMANDOS CON IA',     name: 'Control por Lenguaje Natural',                   desc: 'Escribe "cortar a cámara 2 y luego iniciar grabación" y Tally lo hace. El análisis de comandos con IA entiende el español — sin necesidad de memorizar menús.' },
  { tag: 'PILOTO AUTOMÁTICO',   name: 'Piloto Automático con IA',                       desc: 'Crea reglas como "cuando empiecen las diapositivas de adoración, cambiar a cámara 1". Tally las ejecuta automáticamente durante el servicio — hasta 25 reglas en Enterprise.' },
  { tag: 'PORTAL DE IGLESIA',   name: 'Portal de Iglesia de Autoservicio',              desc: 'Cada iglesia tiene su propio panel — administra DTs, establece horarios de servicio, ve el historial de sesiones, configura alertas y gestiona la facturación.' },
  { tag: 'CRONOLOGÍA',          name: 'Resumen Post-Servicio',                          desc: 'Cada servicio tiene una cronología: qué pasó, qué falló, qué se recuperó automáticamente. Los resúmenes de sesión se envían automáticamente a Planning Center.' },
  { tag: 'PLANNING CENTER',     name: 'Sincronización + Escritura en Planning Center',  desc: 'Sincroniza los horarios de servicio automáticamente. Después de cada servicio, las notas de producción se envían al plan — sin captura manual de datos.' },
  { tag: 'ACCESO INVITADO',     name: 'Tokens para DT Invitado',                        desc: 'Genera tokens de acceso temporales para DTs invitados o voluntarios. Expiran automáticamente en 24 horas. Historial completo de cada acción.' },
  { tag: 'GUARDIA',             name: 'Rotación de DT de Guardia',                      desc: 'Rotación semanal con comandos de cambio en Telegram. Las alertas van al DT de guardia — no a todo el equipo.' },
  { tag: 'INFORMES',            name: 'Informes Mensuales de Salud',                    desc: 'Estadísticas de disponibilidad, incidentes y recuperaciones automáticas por iglesia. Los informes mensuales mantienen informado al liderazgo — entregados el 1ro de cada mes.' },
  { tag: 'CONFIGURACIÓN IA',    name: 'Asistente de Configuración con IA',              desc: 'Sube una lista de patch o diagrama de cámaras y Tally configura automáticamente los canales de tu mezclador y etiquetas del ATEM. Analiza CSVs, PDFs y fotos con visión IA — configuración en minutos, no horas.' },
  { tag: 'MULTI-SEDE',          name: 'Diseñado para Multi-Sala',                       desc: 'Comienza con una sala en Connect, escala a 3 en Plus, 5 en Pro, o ilimitadas en Enterprise — sin complicar tu domingo.' },
  { tag: 'MULTI-ENCODER',       name: 'Cualquier Encoder, Cualquier Flujo de Trabajo',  desc: 'OBS, vMix, Ecamm, Blackmagic, Teradek, YoloBox, Epiphan, AJA HELO — Tally monitorea cualquier encoder que uses.' },
  { tag: 'PRÓXIMAMENTE',        name: 'Vista Previa de Video en Vivo',                  desc: 'Ve tu señal de programa desde cualquier lugar. Stream de monitoreo H.264 enrutado de forma segura — requiere un encoder de hardware Tally Box. En desarrollo.' },
  { tag: 'GUÍAS',               name: '15 Guías de Configuración Paso a Paso',          desc: 'Guías en lenguaje claro con resúmenes de inicio rápido, niveles de dificultad y secciones avanzadas que puedes expandir cuando las necesites. Escritas para voluntarios, no para ingenieros.' },
  { tag: 'PROTECCIÓN',          name: 'Protecciones para Comandos en Vivo',             desc: 'Tally advierte antes de ejecutar comandos peligrosos mientras estás en vivo — como detener un stream o cambiar fuentes. Confirma con tu DT antes de que ocurra algo arriesgado.' },
  { tag: 'CONTROL DE AUDIO',    name: 'Control Completo de Consola de Audio',           desc: 'EQ, compresión, compuertas, faders, silencio/solo — controla cada canal en tu consola Allen & Heath, Behringer, Midas o Yamaha desde Telegram.' },
  { tag: 'BIBLIOTECA DE PRESETS', name: 'Recall de Presets con Un Toque',              desc: 'Guarda configuraciones complejas de múltiples dispositivos y recupéralas al instante. Escenas del mezclador, macros del ATEM, colecciones de OBS — un toque para cambiar toda tu configuración de producción.' },
  { tag: 'PORTAL MÓVIL',        name: 'Portal de Iglesia para Móvil',                  desc: 'Tu panel de iglesia funciona en cualquier dispositivo. Verifica el estado del equipo, administra DTs y revisa sesiones desde tu iPhone durante el servicio.' },
];

function FeaturesEs() {
  return (
    <section id="features" style={{ padding: '128px 5%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>QUÉ HACE TALLY</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 64px',
          color: WHITE, maxWidth: 700,
        }}>
          Resuelve los problemas que aún no has tenido.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {FEATURES_ES.map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: CARD_BG, border: `1px solid ${BORDER}`,
              borderRadius: 16, padding: '32px 28px',
              transition: 'border-color .2s, box-shadow .2s',
            }}>
              <div style={{
                display: 'inline-block', marginBottom: 20,
                fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                fontWeight: 700, letterSpacing: '0.12em',
                color: f.tag === 'PRÓXIMAMENTE' ? '#eab308' : GREEN,
                background: f.tag === 'PRÓXIMAMENTE' ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)',
                border: f.tag === 'PRÓXIMAMENTE' ? '1px solid rgba(234,179,8,0.2)' : '1px solid rgba(34,197,94,0.2)',
                borderRadius: 4, padding: '4px 10px',
              }}>{f.tag}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px', color: WHITE }}>{f.name}</h3>
              <p style={{ color: MUTED, margin: 0, fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: DIM, fontSize: '0.9rem', marginBottom: 14 }}>
            Compatible con más de 26 integraciones: mezcladores, codificadores, audio y software de presentación.
          </p>
          <a href="/hardware" style={{
            display: 'inline-block', padding: '12px 28px', fontSize: '0.9rem', fontWeight: 700,
            borderRadius: 8, textDecoration: 'none',
            border: `1px solid ${BORDER}`, background: 'transparent', color: WHITE,
            transition: 'border-color .2s',
          }}>Ver Hardware Compatible &rarr;</a>
        </div>
      </div>
    </section>
  );
}

// ─── Spanish IncidentTimeline ────────────────────────────────────────────────

const TIMELINE_STEPS_ES = [
  { time: '01', label: 'Falla Detectada',    desc: 'Tally detecta la caída — encoder, stream, audio o señal de video', color: '#ef4444' },
  { time: '02', label: 'Verificado',          desc: 'Confirma que es una interrupción real, no un parpadeo momentáneo', color: '#f59e0b' },
  { time: '03', label: 'Auto-Recuperación',   desc: 'Reinicia el stream, reactiva el encoder, cambia al respaldo', color: '#3b82f6' },
  { time: '04', label: 'En Vivo Confirmado',  desc: 'Stream verificado. Tu DT recibe una alerta. La congregación nunca se entera.', color: GREEN },
];

function IncidentTimelineEs() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ padding: '128px 5%', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>CÓMO FUNCIONA LA AUTO-RECUPERACIÓN</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE, maxWidth: 700,
        }}>
          Se cae. Tally lo arregla.
        </h2>
        <p style={{ color: DIM, textAlign: 'center', marginBottom: 64, fontSize: '0.95rem' }}>
          Detección automática, verificación y recuperación &mdash; antes de que tu congregación se dé cuenta.
        </p>

        <div className={`incident-timeline${isVisible ? ' timeline-visible' : ''}`} style={{ position: 'relative' }}>
          {/* connecting line */}
          <div className="timeline-line" style={{
            position: 'absolute', top: 28, left: 0, right: 0,
            height: 2, background: BORDER, zIndex: 0,
          }} />
          {/* animated progress line */}
          <div className="timeline-progress" style={{
            position: 'absolute', top: 28, left: 0,
            height: 2,
            background: `linear-gradient(90deg, #ef4444, #f59e0b, #3b82f6, ${GREEN})`,
            zIndex: 1, width: '0%',
          }} />

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12, position: 'relative', zIndex: 2,
          }}>
            {TIMELINE_STEPS_ES.map((step, i) => (
              <div
                key={i}
                className={`timeline-step timeline-step-${i}`}
                style={{ textAlign: 'center', opacity: 0 }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: BG, border: `3px solid ${step.color}`,
                  margin: '0 auto 20px',
                  boxShadow: `0 0 12px ${step.color}40`,
                  position: 'relative',
                }}>
                  <div className={`dot-ping dot-ping-${i}`} style={{
                    position: 'absolute', inset: -6, borderRadius: '50%',
                    border: `2px solid ${step.color}`, opacity: 0,
                  }} />
                </div>
                <div style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem',
                  fontWeight: 700, letterSpacing: '0.08em', color: step.color,
                  marginBottom: 8,
                }}>{step.time}</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: WHITE, marginBottom: 6 }}>{step.label}</div>
                <p style={{ color: MUTED, fontSize: '0.8rem', lineHeight: 1.5, margin: 0, padding: '0 4px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes timeline-fade-in {
            0%   { opacity: 0; transform: translateY(16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes timeline-progress-fill {
            0%   { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes dot-ping-anim {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .timeline-visible .timeline-step-0 { animation: timeline-fade-in 0.5s ease-out 0.3s forwards; }
          .timeline-visible .timeline-step-1 { animation: timeline-fade-in 0.5s ease-out 0.8s forwards; }
          .timeline-visible .timeline-step-2 { animation: timeline-fade-in 0.5s ease-out 1.3s forwards; }
          .timeline-visible .timeline-step-3 { animation: timeline-fade-in 0.5s ease-out 1.8s forwards; }
          .timeline-visible .timeline-progress { animation: timeline-progress-fill 2.0s ease-out 0.3s forwards; }
          .timeline-visible .dot-ping-0 { animation: dot-ping-anim 1s ease-out 0.5s; }
          .timeline-visible .dot-ping-1 { animation: dot-ping-anim 1s ease-out 1.0s; }
          .timeline-visible .dot-ping-2 { animation: dot-ping-anim 1s ease-out 1.5s; }
          .timeline-visible .dot-ping-3 { animation: dot-ping-anim 1s ease-out 2.0s; }
          @media (max-width: 640px) {
            .incident-timeline > div:last-child { grid-template-columns: 1fr !important; gap: 32px !important; }
            .timeline-line, .timeline-progress { display: none !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .timeline-step-0, .timeline-step-1, .timeline-step-2, .timeline-step-3 { animation: none !important; opacity: 1 !important; }
            .timeline-progress { animation: none !important; width: 100% !important; }
            .dot-ping-0, .dot-ping-1, .dot-ping-2, .dot-ping-3 { animation: none !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

// ─── Spanish AppShowcase ──────────────────────────────────────────────────────

const TABS_ES = [
  { id: 'status',    label: 'Vista de Estado' },
  { id: 'equipment', label: 'Configuración de Equipos' },
  { id: 'engineer',  label: 'Tally Engineer' },
];

const CAPTIONS_ES = {
  status: [
    { label: 'Todo verde',               desc: 'Relay, ATEM, OBS, Companion, ProPresenter — cada conexión de un vistazo' },
    { label: 'Cámaras PGM y PVW',        desc: 'Ve de un vistazo qué cámara está en vivo y cuál está en espera' },
    { label: 'Alertas de auto-recuperación', desc: 'Tally arregla problemas antes de que los notes — luego te muestra qué pasó' },
  ],
  equipment: [
    { label: 'Detecta dispositivos automáticamente', desc: 'Encuentra tu ATEM, OBS, Companion, ProPresenter, HyperDecks y cámaras PTZ' },
    { label: 'Configuración de una sola vez', desc: 'Ingresa las IPs una vez, prueba conexiones, guarda — listo en 10 minutos' },
    { label: 'Audio + video',             desc: 'Cámaras PTZ, HyperDecks, consolas de audio — todo desde la misma pantalla' },
  ],
  engineer: [
    { label: 'Estado Listo / No Listo',  desc: 'Un vistazo te dice si todos los sistemas están listos para el servicio' },
    { label: 'Diagnósticos con IA',      desc: 'Haz preguntas en español — Tally Engineer revisa tu equipo y responde' },
    { label: 'Planes de acción',          desc: 'Pasos priorizados para solucionar problemas antes de que se conviertan en crisis el domingo' },
  ],
};

function AppShowcaseEs() {
  const [activeTab, setActiveTab] = useState('status');

  return (
    <section id="the-app" style={{
      padding: '128px 5%',
      background: CARD_BG,
      borderTop: `1px solid ${BORDER}`,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>LA APP</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE,
        }}>
          Ve exactamente qué está pasando.<br />Desde cualquier lugar.
        </h2>
        <p style={{
          color: MUTED, textAlign: 'center', fontSize: '1rem',
          maxWidth: 560, margin: '0 auto 64px', lineHeight: 1.7,
        }}>
          El cliente de Tally se instala en tu computadora de cabina en minutos.
          Tu DT ve el estado de cada dispositivo de un vistazo &mdash; y tú ves cada iglesia desde tu teléfono.
        </p>

        {/* Tab selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: 4, gap: 4,
          }}>
            {TABS_ES.map(tab => (
              <button
                key={tab.id}
                className="app-tab-btn"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 22px', border: 'none', borderRadius: 7,
                  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all .2s',
                  background: activeTab === tab.id ? GREEN : 'transparent',
                  color: activeTab === tab.id ? '#000' : MUTED,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot frame */}
        <div style={{
          position: 'relative', borderRadius: 16,
          border: `1px solid ${activeTab === 'status' ? GREEN : BORDER}`,
          overflow: 'hidden',
          boxShadow: activeTab === 'status'
            ? '0 0 60px rgba(34,197,94,0.18), 0 32px 80px rgba(0,0,0,0.6)'
            : '0 0 30px rgba(34,197,94,0.06), 0 32px 80px rgba(0,0,0,0.6)',
          transition: 'box-shadow .3s, border-color .3s',
          animation: 'glow-pulse 3s ease-in-out infinite',
        }}>
          {/* Window chrome bar */}
          <div style={{
            background: '#0d1117', padding: '12px 18px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{
              marginLeft: 12, fontSize: '0.78rem',
              fontFamily: 'ui-monospace, monospace', color: DIM,
            }}>
              Tally &mdash; {activeTab === 'status' ? 'Santuario Principal' : activeTab === 'equipment' ? 'Configuración de Equipos' : 'Tally Engineer'}
            </span>
          </div>
          <Image
            src={activeTab === 'status' ? '/app-status.png' : activeTab === 'equipment' ? '/app-equipment.png' : '/app-engineer.png'}
            alt={activeTab === 'status' ? 'Panel de estado de Tally mostrando el estado del stream en vivo, dispositivos conectados y vista previa de cámara' : activeTab === 'equipment' ? 'Pantalla de configuración de equipos de Tally mostrando ATEM, OBS y Companion detectados automáticamente' : 'Diagnósticos IA de Tally Engineer con estado Listo/No Listo y planes de acción'}
            width={1200}
            height={761}
            priority={activeTab === 'status'}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Caption */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16, marginTop: 32,
        }}>
          {CAPTIONS_ES[activeTab].map((item, i) => (
            <div key={i} style={{
              background: BG, border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '18px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div>
                <div style={{ fontWeight: 700, color: WHITE, fontSize: '0.9rem', marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: MUTED, fontSize: '0.82rem', lineHeight: 1.55 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Spanish Integrations ────────────────────────────────────────────────────

const INTEGRATIONS_ES = [
  { name: 'ATEM Switcher',       tag: 'MEZCLADOR'    },
  { name: 'OBS Studio',          tag: 'STREAMING'    },
  { name: 'vMix',                tag: 'STREAMING'    },
  { name: 'Ecamm Live',          tag: 'STREAMING'    },
  { name: 'ProPresenter',        tag: 'DIAPOSITIVAS' },
  { name: 'Bitfocus Companion',  tag: 'CONTROL'      },
  { name: 'Planning Center',     tag: 'HORARIO'      },
  { name: 'Slack',               tag: 'ALERTAS'      },
  { name: 'Telegram',            tag: 'ALERTAS'      },
  { name: 'Resolume Arena',      tag: 'VIDEOWALL'    },
  { name: 'Allen & Heath',       tag: 'AUDIO'        },
  { name: 'Behringer X32',       tag: 'AUDIO'        },
  { name: 'Midas M32',           tag: 'AUDIO'        },
  { name: 'Yamaha CL/QL',        tag: 'AUDIO'        },
  { name: 'Dante Audio',         tag: 'AUDIO'        },
  { name: 'HyperDeck',           tag: 'GRABACIÓN'    },
  { name: 'PTZ Cameras',         tag: 'CÁMARA'       },
  { name: 'Video Hub',           tag: 'ENRUTADOR'    },
  { name: 'Blackmagic Encoder',  tag: 'ENCODER'      },
  { name: 'Teradek',             tag: 'ENCODER'      },
  { name: 'YoloBox',             tag: 'ENCODER'      },
  { name: 'Epiphan',             tag: 'ENCODER'      },
  { name: 'AJA HELO',            tag: 'ENCODER'      },
  { name: 'YouTube Live',        tag: 'CDN'          },
  { name: 'Facebook Live',       tag: 'CDN'          },
  { name: 'Vimeo Live',          tag: 'CDN'          },
];

function IntegrationsEs() {
  return (
    <section style={{
      padding: '128px 5%',
      background: CARD_BG,
      borderTop: `1px solid ${BORDER}`,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>INTEGRACIONES</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 64px',
          color: WHITE,
        }}>
          COMPATIBLE CON TODO<br />LO QUE TIENES EN TU CABINA
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
        }}>
          {INTEGRATIONS_ES.map((d, i) => (
            <div key={i} className="integration-card" style={{
              background: BG, border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '20px 16px',
              transition: 'border-color .2s, box-shadow .2s',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <span style={{ fontWeight: 700, color: WHITE, fontSize: '0.88rem', lineHeight: 1.3 }}>{d.name}</span>
              <span style={{
                fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                fontWeight: 700, letterSpacing: '0.1em', color: GREEN,
              }}>{d.tag}</span>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: 'center', color: DIM, fontSize: '0.9rem',
          marginTop: 36, fontStyle: 'italic',
        }}>
          26 integraciones y contando. Si está en tu cabina, Tally lo monitorea.
        </p>
      </div>
    </section>
  );
}

// ─── Spanish HowItWorks ───────────────────────────────────────────────────────

const STEPS_ES = [
  {
    num: '01',
    title: 'Instalar',
    desc: 'Configuración en 10 minutos. Ejecuta la app en la computadora de cabina. Detecta automáticamente tu ATEM, OBS y Companion. El Asistente de Configuración con IA puede configurar automáticamente los canales de tu mezclador y etiquetas de cámara desde una lista de patch.',
  },
  {
    num: '02',
    title: 'Conectar',
    desc: 'Tu iglesia aparece en vivo en el panel de Tally. Cada dispositivo, cada estado — visible desde cualquier lugar al instante.',
  },
  {
    num: '03',
    title: 'Descansar',
    desc: 'Tally vigila toda tu producción. Si algo falla, lo arregla primero — y luego te avisa.',
  },
];

function HowItWorksEs() {
  return (
    <section id="how-it-works" style={{ padding: '128px 5%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>CÓMO FUNCIONA</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 80px',
          color: WHITE,
        }}>Tres pasos. Diez minutos.</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 0, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 28, left: '16.66%', right: '16.66%',
            height: 1, background: BORDER, zIndex: 0,
          }} />

          {STEPS_ES.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 32px 0', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: BG, border: `2px solid ${GREEN}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
                fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem',
                fontWeight: 800, color: GREEN,
                boxShadow: '0 0 20px rgba(34,197,94,0.15)',
              }}>{s.num}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 14px', color: WHITE, letterSpacing: '-0.01em' }}>{s.title}</h3>
              <p style={{ color: MUTED, margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Spanish Pricing ──────────────────────────────────────────────────────────

const PRICING_ES = [
  {
    name: 'Connect',
    plan: 'connect',
    monthlyPrice: 79,
    annualPrice: 711,
    foundingMonthlyPrice: 49,
    foundingAnnualPrice: 441,
    desc: 'Monitoreo, alertas y control remoto para una sola sala.',
    featured: false,
    cta: 'Iniciar Prueba Gratuita \u2192',
    ctaHref: '/signup?plan=connect',
    features: [
      '1 sala incluida',
      'Monitoreo ATEM, OBS, vMix',
      'Verificación automática pre-servicio',
      'Alertas Slack + Telegram con escalación',
      'Control remoto por Telegram',
      'Auto-recuperación (reinicio de stream)',
      'Cronología de incidentes post-servicio',
      'Portal de Iglesia (panel de autoservicio)',
      'Soporte por email',
    ],
  },
  {
    name: 'Plus',
    plan: 'plus',
    monthlyPrice: 99,
    annualPrice: 891,
    desc: 'Integraciones completas, comandos de IA y soporte multi-sala para equipos en crecimiento.',
    featured: false,
    cta: 'Iniciar Prueba Gratuita \u2192',
    ctaHref: '/signup?plan=plus',
    features: [
      'Todo lo de Connect',
      'Hasta 3 salas',
      'Conmutación de señal (cambio automático a fuente segura)',
      'Las 26 integraciones de dispositivos',
      'Control profundo de ProPresenter (looks, temporizadores, mensajes)',
      'Rotación de DT de guardia',
      'Tokens de acceso para DT invitado',
      'Comandos IA en lenguaje natural',
      'Asistente de Configuración IA (auto-configurar desde listas de patch)',
      'Soporte prioritario por email',
    ],
  },
  {
    name: 'Pro',
    plan: 'pro',
    monthlyPrice: 149,
    annualPrice: 1341,
    desc: 'Piloto automático con IA, sincronización con Planning Center e informes mensuales para operaciones multi-sala.',
    featured: true,
    cta: 'Iniciar Prueba Gratuita \u2192',
    ctaHref: '/signup?plan=pro',
    features: [
      'Todo lo de Plus',
      'Hasta 5 salas',
      'Piloto Automático IA (10 reglas de automatización)',
      'Sincronización + escritura en Planning Center',
      'Informes mensuales de salud para el liderazgo',
      'Resúmenes de sesión con cronología completa',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Enterprise',
    plan: 'managed',
    monthlyPrice: 499,
    annualPrice: 4491,
    desc: 'Salas ilimitadas, onboarding personalizado y soporte dedicado.',
    featured: false,
    cta: 'Contactar Ventas \u2192',
    ctaHref: 'mailto:sales@tallyconnect.app',
    features: [
      'Todo lo de Pro',
      'Salas ilimitadas',
      'Onboarding y configuración dedicados',
      'Piloto Automático IA (25 reglas de automatización)',
      'Reglas de piloto automático personalizadas',
      'Cambios de configuración remotos',
      'Revisión mensual de salud del sistema',
      'SLA de respuesta 15 minutos (Lun–Vie 9–5 ET + ventanas de servicio)',
      'Ingeniero de soporte dedicado',
    ],
  },
];

const FC_TIERS = ['Connect', 'Plus', 'Pro', 'Enterprise'];
const FC_TIER_PRICES = ['$79', '$99', '$149', '$499'];

const FC_ROWS_ES = [
  { feature: 'Salas', values: ['1', '3', '5', 'Ilimitadas'] },
  { feature: 'Monitoreo ATEM / OBS / vMix', values: [true, true, true, true] },
  { feature: 'Verificación Pre-Servicio Automática', values: [true, true, true, true] },
  { feature: 'Alertas Slack + Telegram', values: [true, true, true, true] },
  { feature: 'Control Remoto por Telegram', values: [true, true, true, true] },
  { feature: 'Auto-Recuperación (Reinicio de Stream)', values: [true, true, true, true] },
  { feature: 'Cronología Post-Servicio', values: [true, true, true, true] },
  { feature: 'Portal de Iglesia', values: [true, true, true, true] },
  { feature: 'Conmutación de Señal', values: [false, true, true, true] },
  { feature: 'Las 26 Integraciones', values: [false, true, true, true] },
  { feature: 'Control Profundo de ProPresenter', values: [false, true, true, true] },
  { feature: 'Rotación de DT de Guardia', values: [false, true, true, true] },
  { feature: 'Tokens de DT Invitado', values: [false, true, true, true] },
  { feature: 'Comandos IA en Lenguaje Natural', values: [false, true, true, true] },
  { feature: 'Asistente de Configuración IA', values: [false, true, true, true] },
  { feature: 'Reglas de Piloto Automático IA', values: [false, false, '10', '25'] },
  { feature: 'Sincronización + Escritura en Planning Center', values: [false, false, true, true] },
  { feature: 'Informes Mensuales de Salud', values: [false, false, true, true] },
  { feature: 'Onboarding Dedicado', values: [false, false, false, true] },
  { feature: 'Reglas de Piloto Automático Personalizadas', values: [false, false, false, true] },
  { feature: 'Cambios de Configuración Remotos', values: [false, false, false, true] },
  { feature: 'SLA de Respuesta 15 Min', values: [false, false, false, true] },
  { feature: 'Ingeniero de Soporte Dedicado', values: [false, false, false, true] },
];

function CellValue({ value }) {
  if (value === true)  return <span style={{ color: GREEN, fontSize: '1.1rem', fontWeight: 700 }}>{'\u2713'}</span>;
  if (value === false) return <span style={{ color: DIM, fontSize: '1rem' }}>&mdash;</span>;
  return <span style={{ color: WHITE, fontWeight: 700, fontSize: '0.85rem', fontFamily: 'ui-monospace, monospace' }}>{value}</span>;
}

const FC_INITIAL_COUNT = 12;

function FeatureComparisonEs() {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? FC_ROWS_ES : FC_ROWS_ES.slice(0, FC_INITIAL_COUNT);

  return (
    <div style={{ maxWidth: 1100, margin: '48px auto 0' }}>
      <h3 style={{
        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900,
        letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 12px',
        color: WHITE,
      }}>Compara los planes lado a lado</h3>
      <p style={{ color: DIM, textAlign: 'center', marginBottom: 40, fontSize: '0.88rem' }}>
        Cada plan comienza con una prueba gratuita de 30 días. Todas las funciones incluidas.
      </p>

      {/* Desktop table */}
      <div className="comparison-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left', padding: '16px 16px', color: MUTED,
                borderBottom: `2px solid ${BORDER}`, fontWeight: 600, minWidth: 200,
              }}>Función</th>
              {FC_TIERS.map((tier, i) => (
                <th key={tier} style={{
                  textAlign: 'center', padding: '16px 12px',
                  borderBottom: `2px solid ${tier === 'Pro' ? GREEN : BORDER}`,
                  color: tier === 'Pro' ? GREEN : WHITE,
                  fontWeight: 800, fontSize: '0.9rem', minWidth: 100,
                }}>
                  {tier}
                  <div style={{
                    fontWeight: 600, fontSize: '0.75rem',
                    color: tier === 'Pro' ? GREEN : DIM, marginTop: 2,
                  }}>{FC_TIER_PRICES[i]}/mes</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <td style={{
                  padding: '12px 16px', color: MUTED, fontWeight: 500,
                  borderBottom: `1px solid ${BORDER}`,
                }}>{row.feature}</td>
                {row.values.map((val, j) => (
                  <td key={j} style={{
                    textAlign: 'center', padding: '12px 12px',
                    borderBottom: `1px solid ${BORDER}`,
                  }}>
                    <CellValue value={val} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {FC_ROWS_ES.length > FC_INITIAL_COUNT && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => setShowAll(prev => !prev)}
            style={{
              padding: '10px 28px', fontSize: '0.88rem', fontWeight: 700,
              borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
              color: WHITE, cursor: 'pointer', transition: 'border-color .2s',
            }}
          >
            {showAll ? 'Mostrar menos funciones' : `Mostrar las ${FC_ROWS_ES.length} funciones`}
          </button>
        </div>
      )}

      {/* Mobile card view */}
      <style>{`
        .comparison-mobile-cards { display: none; }
        @media (max-width: 768px) {
          .comparison-table-wrap { display: none; }
          .comparison-mobile-cards { display: block; }
        }
      `}</style>
      <div className="comparison-mobile-cards">
        {FC_TIERS.map((tier, ti) => (
          <details key={tier} style={{
            background: tier === 'Pro' ? 'rgba(34,197,94,0.06)' : BG,
            border: `1px solid ${tier === 'Pro' ? GREEN : BORDER}`,
            borderRadius: 12, marginBottom: 12, overflow: 'hidden',
          }}>
            <summary style={{
              padding: '16px 20px', cursor: 'pointer',
              fontWeight: 800, fontSize: '1rem',
              color: tier === 'Pro' ? GREEN : WHITE,
              listStyle: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{tier} <span style={{ fontWeight: 600, fontSize: '0.85rem', color: DIM, marginLeft: 8 }}>{FC_TIER_PRICES[ti]}/mes</span></span>
              <span style={{ color: MUTED, fontSize: '0.8rem' }}>toca para expandir</span>
            </summary>
            <div style={{ padding: '0 20px 16px' }}>
              {FC_ROWS_ES.map((row, ri) => (
                <div key={ri} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${BORDER}`,
                }}>
                  <span style={{ color: MUTED, fontSize: '0.85rem' }}>{row.feature}</span>
                  <CellValue value={row.values[ti]} />
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function TrialBadgesEs() {
  const badges = [
    { icon: '\u2713', text: 'Todas las funciones incluidas durante la prueba' },
    { icon: '\u2717', text: 'No se requiere tarjeta de crédito' },
    { icon: '\u21e9', text: 'Conserva tus datos si cancelas' },
  ];

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
      gap: 16, margin: '40px auto 0', maxWidth: 800,
    }}>
      {badges.map((badge, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 10, padding: '12px 20px',
        }}>
          <span style={{ color: GREEN, fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>{badge.icon}</span>
          <span style={{ color: MUTED, fontSize: '0.88rem', fontWeight: 600 }}>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}

function PricingEs() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" style={{
      padding: '128px 5%',
      background: CARD_BG,
      borderTop: `1px solid ${BORDER}`,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>PRECIOS</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 12px',
          color: WHITE,
        }}>Precios simples y honestos.</h2>
        <p style={{ color: DIM, textAlign: 'center', marginBottom: 36, fontSize: '0.95rem' }}>
          Prueba gratuita de 30 días para cada iglesia &mdash; sin tarjeta de crédito. Cancela cuando quieras.
        </p>

        {/* Monthly / Annual toggle */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 12, marginBottom: 48,
        }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700,
              borderRadius: 8, border: `1px solid ${annual ? BORDER : GREEN}`,
              background: annual ? 'transparent' : 'rgba(34,197,94,0.12)',
              color: annual ? MUTED : GREEN,
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            Mensual
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700,
              borderRadius: 8, border: `1px solid ${annual ? GREEN : BORDER}`,
              background: annual ? 'rgba(34,197,94,0.12)' : 'transparent',
              color: annual ? GREEN : MUTED,
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            Anual
          </button>
          {annual && (
            <span style={{
              fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem',
              fontWeight: 700, letterSpacing: '0.08em', color: GREEN,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 20, padding: '5px 14px', whiteSpace: 'nowrap',
            }}>
              AHORRA 3 MESES
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {PRICING_ES.map((plan, i) => {
            const isFounding = plan.plan === 'connect' && plan.foundingMonthlyPrice;
            const displayPrice = annual
              ? `$${Math.round(plan.annualPrice / 12)}`
              : `$${plan.monthlyPrice}`;
            const foundingDisplayPrice = isFounding
              ? (annual ? `$${Math.round(plan.foundingAnnualPrice / 12)}` : `$${plan.foundingMonthlyPrice}`)
              : null;
            const ctaHref = plan.plan === 'managed'
              ? plan.ctaHref
              : `${plan.ctaHref}${annual ? '&interval=annual' : ''}`;

            return (
              <div key={i} className={plan.featured ? '' : 'price-card-default'} style={{
                background: plan.featured ? 'rgba(34,197,94,0.06)' : BG,
                border: plan.featured ? `2px solid ${GREEN}` : `1px solid ${BORDER}`,
                borderRadius: 16, padding: '36px 28px',
                position: 'relative',
                transition: plan.featured ? undefined : 'border-color .2s',
                boxShadow: plan.featured ? '0 0 40px rgba(34,197,94,0.08)' : undefined,
              }}>
                {plan.featured && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: GREEN, color: '#000', padding: '4px 18px',
                    borderRadius: 20, fontSize: '0.7rem', fontWeight: 800,
                    letterSpacing: '0.08em', whiteSpace: 'nowrap',
                    fontFamily: 'ui-monospace, monospace',
                  }}>MÁS POPULAR</div>
                )}

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: WHITE }}>{plan.name}</h3>
                <p style={{ color: DIM, fontSize: '0.82rem', margin: '0 0 24px', lineHeight: 1.5 }}>{plan.desc}</p>

                <div style={{ marginBottom: 28 }}>
                  {isFounding ? (
                    <>
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: '3rem', fontWeight: 900, color: GREEN, letterSpacing: '-0.03em' }}>{foundingDisplayPrice}</span>
                        <span style={{ fontSize: '0.95rem', color: DIM }}>/mes</span>
                        <span style={{ fontSize: '0.82rem', color: DIM, marginLeft: 10, textDecoration: 'line-through' }}>{displayPrice}</span>
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: 20, padding: '4px 12px', marginBottom: 4,
                        fontFamily: 'ui-monospace, monospace', fontSize: '0.68rem',
                        fontWeight: 700, letterSpacing: '0.08em', color: GREEN,
                      }}>
                        PRECIO IGLESIA FUNDADORA — CUPOS LIMITADOS
                      </div>
                      {annual && (
                        <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 4 }}>
                          ${plan.foundingAnnualPrice}/año &mdash; facturado anualmente
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem', fontWeight: 900, color: WHITE, letterSpacing: '-0.03em' }}>{displayPrice}</span>
                      <span style={{ fontSize: '0.95rem', color: DIM }}>/mes</span>
                      {annual && (
                        <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 4 }}>
                          ${plan.annualPrice}/año &mdash; facturado anualmente
                        </div>
                      )}
                    </>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      padding: '8px 0', color: MUTED, fontSize: '0.88rem',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      <span style={{ color: GREEN, flexShrink: 0, marginTop: 1, fontSize: '0.8rem' }}>{'\u2713'}</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a href={ctaHref} style={{
                  display: 'block', textAlign: 'center',
                  padding: '13px 24px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: 8, textDecoration: 'none',
                  background: plan.featured ? GREEN : 'transparent',
                  color: plan.featured ? '#000' : WHITE,
                  border: plan.featured ? 'none' : `1px solid ${BORDER}`,
                }}>
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <p style={{ color: DIM, textAlign: 'center', fontSize: '0.82rem', marginBottom: 12 }}>
          Todos los planes incluyen soporte por email en{' '}
          <a href="mailto:support@tallyconnect.app" style={{ color: GREEN, textDecoration: 'none' }}>support@tallyconnect.app</a>
        </p>
        <p style={{ textAlign: 'center', marginBottom: 24 }}>
          <a href="/hardware" style={{ color: GREEN, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
            Ver compatibilidad de hardware &rarr;
          </a>
        </p>

        {/* Event add-on */}
        <div style={{
          background: BG, border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', color: GREEN,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 6, padding: '4px 12px', whiteSpace: 'nowrap',
          }}>ÚNICO</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ fontWeight: 800, color: WHITE, fontSize: '1rem' }}>Evento &mdash; $99</span>
            <span style={{ color: DIM, fontSize: '0.88rem', marginLeft: 12 }}>72 horas de monitoreo para conferencias, Pascua, bodas. Sin suscripción.</span>
          </div>
          <a href="mailto:sales@tallyconnect.app" style={{
            padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700,
            borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent',
            color: WHITE, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>Reservar un Evento &rarr;</a>
        </div>

        <TrialBadgesEs />
        <FeatureComparisonEs />
      </div>
    </section>
  );
}

// ─── Spanish Testimonials ─────────────────────────────────────────────────────

const FALLBACK_REVIEWS_ES = [
  {
    id: 'fallback-es-1',
    rating: 5,
    body: 'Nuestro stream se cayó a mitad del sermón un Domingo de Pascua el año pasado. Este año Tally detectó y recuperó la caída en 8 segundos. Nadie en la congregación se dio cuenta.',
    reviewer_name: 'Marcus T.',
    reviewer_role: 'Director Técnico',
    church_name: 'Grace Community Church',
  },
  {
    id: 'fallback-es-2',
    rating: 5,
    body: 'Pasamos de necesitar un técnico pagado cada domingo a tener voluntarios manejando toda la producción con confianza. Tally se encarga de los problemas para que ellos puedan concentrarse en cámaras y diapositivas.',
    reviewer_name: 'Sarah K.',
    reviewer_role: 'Pastora de Alabanza',
    church_name: 'Harvest Fellowship',
  },
  {
    id: 'fallback-es-3',
    rating: 5,
    body: 'Solo la verificación previa al servicio ya vale la suscripción. Cada domingo por la mañana recibimos luz verde 30 minutos antes del servicio. Se acabaron los recorridos frenéticos por la cabina.',
    reviewer_name: 'David R.',
    reviewer_role: 'Líder de Producción',
    church_name: 'New Life Church',
  },
];

function TestimonialsEs() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {});
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS_ES;

  return (
    <section id="testimonials" style={{ padding: '96px 5%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 16,
        }}>LO QUE DICEN LAS IGLESIAS</p>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
          letterSpacing: '-0.02em', color: WHITE,
          textAlign: 'center', marginBottom: 48, lineHeight: 1.15,
        }}>
          Con la confianza de equipos de producción<br />en todo el país
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {displayReviews.map(review => (
            <div
              key={review.id}
              className="testimonial-card"
              style={{
                background: CARD_BG, border: `1px solid ${BORDER}`,
                borderRadius: 16, padding: '28px 24px',
                transition: 'border-color .2s, box-shadow .2s',
              }}
            >
              <div style={{ marginBottom: 12, color: GREEN, fontSize: '1.1rem', letterSpacing: 2 }}>
                {'★'.repeat(review.rating)}
                <span style={{ color: '#334155' }}>{'★'.repeat(5 - review.rating)}</span>
              </div>

              <p style={{
                color: WHITE, fontSize: '0.95rem', lineHeight: 1.65,
                marginBottom: 20, fontStyle: 'italic',
              }}>
                &ldquo;{review.body}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${GREEN}, #16a34a)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.85rem', color: '#000', flexShrink: 0,
                }}>
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: WHITE, fontSize: '0.85rem' }}>
                    {review.reviewer_name}
                  </div>
                  <div style={{ color: DIM, fontSize: '0.75rem' }}>
                    {[review.reviewer_role, review.church_name].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
          EN · English
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
    a: 'No. Tally está diseñado para directores técnicos voluntarios y pastores sin conocimientos técnicos. La configuración toma menos de 30 minutos. Usas Telegram para controlar todo.',
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
      <div style={{ textAlign: 'center', padding: '60px 5% 20px' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: WHITE, marginBottom: 12 }}>
          {t('faq.title', LOCALE)}
        </h2>
      </div>
      <div style={{ marginTop: 32 }}>
        {FAQ_ES.map((item, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${BORDER}`, padding: '22px 0' }}>
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
        <FeaturesEs />
        <IncidentTimelineEs />
        <AppShowcaseEs />
        <IntegrationsEs />
        <HowItWorksEs />
        <PricingEs />
        <TestimonialsEs />
        <FaqEs />
      </main>
      <FooterEs />
    </div>
  );
}
