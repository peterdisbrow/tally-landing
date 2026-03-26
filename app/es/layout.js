export const metadata = {
  title: 'Tally | Monitoreo y Recuperación Automática para Iglesias',
  description:
    'Tu transmisión se cayó. Tally ya lo arregló. Monitoreo con recuperación automática para equipos de producción de iglesia. 23 integraciones. Prueba gratuita.',
  metadataBase: new URL('https://tallyconnect.app'),
  keywords: [
    'software de transmisión para iglesias',
    'monitoreo de producción de iglesia',
    'recuperación automática de OBS',
    'transmisión en vivo iglesia',
    'automatización AV para iglesias',
    'control ProPresenter',
    'director técnico iglesia',
    'herramientas de producción para iglesias',
  ],
  openGraph: {
    title: 'Tally | Monitoreo y Recuperación Automática para Iglesias',
    description:
      'Tu transmisión se cayó. Tally ya lo arregló. Recuperación automática de transmisión, monitoreo de producción y control con IA para equipos de iglesia. 23 integraciones. 30 días gratis.',
    url: 'https://tallyconnect.app/es',
    siteName: 'Tally',
    locale: 'es-419',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tallyconnect.app/es',
    languages: {
      'en': 'https://tallyconnect.app',
      'es-419': 'https://tallyconnect.app/es',
    },
  },
};

// Nested layouts must NOT include <html>/<body> — those are owned by the
// root layout (app/layout.js). This layout only contributes metadata.
export default function SpanishLayout({ children }) {
  return <>{children}</>;
}
