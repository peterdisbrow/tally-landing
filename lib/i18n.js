/**
 * i18n — Translation strings for key landing page content.
 *
 * Structure: translations[locale][key] = string
 *
 * Supported locales: en (default), es (Spanish)
 *
 * Usage:
 *   import { t } from '@/lib/i18n';
 *   t('hero.headline', 'es')
 */

export const translations = {
  en: {
    // Nav
    'nav.pricing': 'Pricing',
    'nav.features': 'Features',
    'nav.hardware': 'Hardware',
    'nav.blog': 'Blog',
    'nav.signin': 'Sign in',
    'nav.start_free': 'Start Free',

    // Hero
    'hero.badge': 'TALLY — AI BROADCAST ENGINEER',
    'hero.headline': 'YOUR STREAM JUST CRASHED. TALLY ALREADY FIXED IT.',
    'hero.headline_part1': 'YOUR STREAM JUST CRASHED.',
    'hero.headline_part2': 'TALLY ALREADY FIXED IT.',
    'hero.subtext': 'Tally watches your entire production — ATEM, OBS, audio, encoders, ProPresenter — and auto-recovers failures before anyone notices. Your TD gets an alert. Your congregation never knows.',
    'hero.proof': '26 integrations · Automatic recovery · AI natural language control · Self-service church portal',
    'hero.cta_primary': 'Start Free — 30 Days →',
    'hero.cta_secondary': 'See the App ↓',

    // Problem section
    'problem.title': "The Sunday Morning Panic is Real",
    'problem.subtitle': "Every church production team knows this moment.",

    // Features
    'features.title': 'Everything Your Production Team Needs',
    'features.subtitle': 'One platform. Every device. Every service.',

    // Pricing
    'pricing.title': 'Simple, Honest Pricing',
    'pricing.subtitle': 'Start free. No credit card required.',
    'pricing.trial': '30-day free trial',
    'pricing.cta': 'Start Free Trial',

    // CTA / conversion
    'cta.free_trial': 'Free 30-day trial',
    'cta.no_card': 'No credit card required',
    'cta.start': 'Get Started Free',

    // FAQ
    'faq.title': 'Frequently Asked Questions',

    // Footer
    'footer.tagline': 'AI-powered broadcast engineering for every church.',
    'footer.rights': '© 2025 Tally. All rights reserved.',
    'footer.lang_switch': 'Español',
    'footer.lang_switch_en': 'English',
  },

  es: {
    // Nav
    'nav.pricing': 'Precios',
    'nav.features': 'Funciones',
    'nav.hardware': 'Hardware',
    'nav.blog': 'Blog',
    'nav.signin': 'Iniciar sesión',
    'nav.start_free': 'Prueba Gratis',

    // Hero
    'hero.badge': 'TALLY — INGENIERO DE TRANSMISIÓN CON IA',
    'hero.headline': 'TU TRANSMISIÓN SE CAYÓ. TALLY YA LO ARREGLÓ.',
    'hero.headline_part1': 'TU TRANSMISIÓN SE CAYÓ.',
    'hero.headline_part2': 'TALLY YA LO ARREGLÓ.',
    'hero.subtext': 'Tally monitorea toda tu producción — ATEM, OBS, audio, codificadores, ProPresenter — y recupera fallas antes de que alguien lo note. Tu director técnico recibe una alerta. Tu congregación nunca lo sabe.',
    'hero.proof': '26 integraciones · Recuperación automática · Control por lenguaje natural con IA · Portal de iglesia',
    'hero.cta_primary': 'Empieza Gratis — 30 Días →',
    'hero.cta_secondary': 'Ver la Aplicación ↓',

    // Problem section
    'problem.title': 'El Pánico del Domingo en la Mañana es Real',
    'problem.subtitle': 'Todo equipo de producción de iglesia conoce este momento.',

    // Features
    'features.title': 'Todo lo que tu equipo de producción necesita',
    'features.subtitle': 'Una plataforma. Cada dispositivo. Cada servicio.',

    // Pricing
    'pricing.title': 'Precios simples y transparentes',
    'pricing.subtitle': 'Empieza gratis. No se requiere tarjeta de crédito.',
    'pricing.trial': '30 días de prueba gratis',
    'pricing.cta': 'Iniciar Prueba Gratuita',

    // CTA / conversion
    'cta.free_trial': 'Prueba gratuita de 30 días',
    'cta.no_card': 'Sin tarjeta de crédito',
    'cta.start': 'Empezar Gratis',

    // FAQ
    'faq.title': 'Preguntas Frecuentes',

    // Footer
    'footer.tagline': 'Ingeniería de transmisión con IA para cada iglesia.',
    'footer.rights': '© 2025 Tally. Todos los derechos reservados.',
    'footer.lang_switch': 'Español',
    'footer.lang_switch_en': 'English',
  },
};

/**
 * Get a translated string.
 * @param {string} key
 * @param {'en'|'es'} locale
 * @returns {string}
 */
export function t(key, locale = 'en') {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
