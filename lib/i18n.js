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

    // Signup / login flow
    'signup.title': 'Start Your Free Trial',
    'signup.subtitle': '30 days free. No credit card required.',
    'signup.field.church_name': 'Church Name',
    'signup.field.email': 'Email Address',
    'signup.field.password': 'Password',
    'signup.field.plan': 'Plan',
    'signup.field.billing': 'Billing',
    'signup.field.billing.monthly': 'Monthly',
    'signup.field.billing.annual': 'Annual (save 3 months)',
    'signup.accept_tos': 'I agree to the',
    'signup.accept_privacy': 'I agree to the',
    'signup.cta': 'Create Free Account',
    'signup.cta_loading': 'Creating Account…',
    'signup.have_account': 'Already have an account?',
    'signup.signin_link': 'Sign in',
    'signup.error.name_required': 'Church name is required',
    'signup.error.email_invalid': 'Enter a valid email address',
    'signup.error.password_short': 'Password must be at least 8 characters',
    'signup.error.tos_required': 'You must accept the terms',
    'signup.error.privacy_required': 'You must accept the privacy policy',
    'signup.success': 'Account created! Check your email to verify.',

    'signin.title': 'Sign In',
    'signin.subtitle': 'Access your church portal',
    'signin.field.email': 'Email Address',
    'signin.field.password': 'Password',
    'signin.cta': 'Sign In',
    'signin.cta_loading': 'Signing in…',
    'signin.no_account': "Don't have an account?",
    'signin.signup_link': 'Start free trial',
    'signin.forgot': 'Forgot password?',
    'signin.error.invalid': 'Invalid email or password',

    // Portal section headers
    'portal.nav.overview': 'Overview',
    'portal.nav.tds': 'Tech Directors',
    'portal.nav.schedule': 'Schedule',
    'portal.nav.notifications': 'Notifications',
    'portal.nav.sessions': 'Sessions',
    'portal.nav.guests': 'Guests',
    'portal.nav.engineer': 'Tally Engineer',
    'portal.nav.campuses': 'Campuses',
    'portal.nav.profile': 'Profile',
    'portal.nav.billing': 'Billing',

    'portal.overview.title': 'Overview',
    'portal.overview.sub': 'Live monitoring status for your church',
    'portal.overview.connection': 'Connection',
    'portal.overview.sessions': 'Sessions (30d)',
    'portal.overview.tds': 'Tech Directors',
    'portal.overview.preservice': 'Pre-Service Check',
    'portal.overview.preservice.all_clear': 'All Clear',
    'portal.overview.preservice.issues': '{{n}} Issue(s)',
    'portal.overview.preservice.run_now': 'Run Check Now',
    'portal.overview.preservice.fix': 'Fix All Safe Issues',
    'portal.overview.preservice.not_run': 'Not Run',

    'portal.tds.title': 'Tech Directors',
    'portal.tds.sub': 'People who receive alerts and have TD access',
    'portal.tds.add': '+ Add TD',
    'portal.tds.copy_invite': 'Copy Invite Link',
    'portal.tds.invite_copied': 'Invite link copied! Share with your TD — they click it and are registered automatically.',
    'portal.tds.role': 'Role',
    'portal.tds.remove': 'Remove',
    'portal.tds.name': 'Name',
    'portal.tds.email': 'Email',
    'portal.tds.phone': 'Phone',

    'portal.schedule.title': 'Service Schedule',
    'portal.schedule.sub': 'Define your recurring service windows for smart alerts',

    // Email template strings (for reference and overrides)
    'email.trial_7days.subject': 'Your Tally trial ends in {{n}} days — here\'s what you\'ll lose',
    'email.trial_soon.subject': 'Your Tally trial ends in {{n}} day(s)',
    'email.trial_tomorrow.subject': 'Your Tally trial ends tomorrow',
    'email.trial_expired.subject': 'Your Tally trial has ended',
    'email.session_recap.subject': 'Service Recap: {{church}} — {{day}} {{date}}',

    // Error messages
    'error.generic': 'Something went wrong. Please try again.',
    'error.offline': 'Could not connect. Check your internet connection.',
    'error.session_expired': 'Your session has expired. Please sign in again.',
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

    // Signup / login flow
    'signup.title': 'Comienza tu Prueba Gratuita',
    'signup.subtitle': '30 días gratis. No se requiere tarjeta de crédito.',
    'signup.field.church_name': 'Nombre de la Iglesia',
    'signup.field.email': 'Correo Electrónico',
    'signup.field.password': 'Contraseña',
    'signup.field.plan': 'Plan',
    'signup.field.billing': 'Facturación',
    'signup.field.billing.monthly': 'Mensual',
    'signup.field.billing.annual': 'Anual (ahorra 3 meses)',
    'signup.accept_tos': 'Acepto los',
    'signup.accept_privacy': 'Acepto la',
    'signup.cta': 'Crear Cuenta Gratis',
    'signup.cta_loading': 'Creando cuenta…',
    'signup.have_account': '¿Ya tienes una cuenta?',
    'signup.signin_link': 'Iniciar sesión',
    'signup.error.name_required': 'El nombre de la iglesia es obligatorio',
    'signup.error.email_invalid': 'Ingresa un correo electrónico válido',
    'signup.error.password_short': 'La contraseña debe tener al menos 8 caracteres',
    'signup.error.tos_required': 'Debes aceptar los términos de uso',
    'signup.error.privacy_required': 'Debes aceptar la política de privacidad',
    'signup.success': '¡Cuenta creada! Revisa tu correo para verificarla.',

    'signin.title': 'Iniciar Sesión',
    'signin.subtitle': 'Accede a tu portal de iglesia',
    'signin.field.email': 'Correo Electrónico',
    'signin.field.password': 'Contraseña',
    'signin.cta': 'Iniciar Sesión',
    'signin.cta_loading': 'Iniciando sesión…',
    'signin.no_account': '¿No tienes una cuenta?',
    'signin.signup_link': 'Prueba gratis',
    'signin.forgot': '¿Olvidaste tu contraseña?',
    'signin.error.invalid': 'Correo o contraseña inválidos',

    // Portal section headers
    'portal.nav.overview': 'Resumen',
    'portal.nav.tds': 'Directores Técnicos',
    'portal.nav.schedule': 'Horario',
    'portal.nav.notifications': 'Notificaciones',
    'portal.nav.sessions': 'Sesiones',
    'portal.nav.guests': 'Invitados',
    'portal.nav.engineer': 'Ingeniero Tally',
    'portal.nav.campuses': 'Sedes',
    'portal.nav.profile': 'Perfil',
    'portal.nav.billing': 'Facturación',

    'portal.overview.title': 'Resumen',
    'portal.overview.sub': 'Estado de monitoreo en vivo para tu iglesia',
    'portal.overview.connection': 'Conexión',
    'portal.overview.sessions': 'Sesiones (30d)',
    'portal.overview.tds': 'Directores Técnicos',
    'portal.overview.preservice': 'Verificación Pre-Servicio',
    'portal.overview.preservice.all_clear': 'Todo en Orden',
    'portal.overview.preservice.issues': '{{n}} Problema(s)',
    'portal.overview.preservice.run_now': 'Ejecutar Verificación',
    'portal.overview.preservice.fix': 'Corregir Problemas Seguros',
    'portal.overview.preservice.not_run': 'Sin Ejecutar',

    'portal.tds.title': 'Directores Técnicos',
    'portal.tds.sub': 'Personas que reciben alertas y tienen acceso de DT',
    'portal.tds.add': '+ Agregar DT',
    'portal.tds.copy_invite': 'Copiar Enlace de Invitación',
    'portal.tds.invite_copied': '¡Enlace copiado! Compártelo con tu DT — al hacer clic quedarán registrados automáticamente.',
    'portal.tds.role': 'Rol',
    'portal.tds.remove': 'Eliminar',
    'portal.tds.name': 'Nombre',
    'portal.tds.email': 'Correo',
    'portal.tds.phone': 'Teléfono',

    'portal.schedule.title': 'Horario de Servicios',
    'portal.schedule.sub': 'Define tus ventanas de servicio recurrentes para alertas inteligentes',

    // Email template strings
    'email.trial_7days.subject': 'Tu prueba de Tally termina en {{n}} días — esto es lo que perderás',
    'email.trial_soon.subject': 'Tu prueba de Tally termina en {{n}} día(s)',
    'email.trial_tomorrow.subject': 'Tu prueba de Tally termina mañana',
    'email.trial_expired.subject': 'Tu prueba de Tally ha finalizado',
    'email.session_recap.subject': 'Resumen del Servicio: {{church}} — {{day}} {{date}}',

    // Error messages
    'error.generic': 'Algo salió mal. Por favor intenta de nuevo.',
    'error.offline': 'No se pudo conectar. Verifica tu conexión a internet.',
    'error.session_expired': 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
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
