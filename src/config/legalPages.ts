export interface LegalPagePreset {
  slug: string;
  title: string;
  metaDescription: string;
  fallbackContent: string;
}

export interface LegalPageDraft {
  title: string;
  content: string;
}

export const legalPagePresets: LegalPagePreset[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    metaDescription: 'Learn how Pawtectors collects, uses, and protects your information.',
    fallbackContent: `Pawtectors collects the information needed to create accounts, manage bookings and orders, and keep the platform running smoothly. We use cookies and local storage to keep you signed in, remember preferences, and improve the experience.

We only share the minimum information required with the service provider you choose so they can complete your request. You can review and update your profile at any time and contact us if you want to request account deletion.`,
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    metaDescription: 'Read the terms that apply when using Pawtectors and its services.',
    fallbackContent: `By using Pawtectors, you agree to provide accurate account information, follow our booking and payment rules, and use the platform only for lawful purposes. Service availability, pricing, and timings are managed by the individual providers listed on the site.

We may update these terms when the platform or our services change. Continued use of Pawtectors after an update means you accept the revised terms.`,
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    metaDescription: 'Understand how Pawtectors uses cookies and browser storage.',
    fallbackContent: `Pawtectors uses cookies and similar storage technologies to keep sessions active, remember preferences, and help us understand how visitors use the site. Some features may not work correctly if cookies are disabled.

You can manage cookies through your browser settings. If you clear your browser storage, you may need to sign in again and reset some preferences.`,
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    metaDescription: 'Review Pawtectors cancellation and refund rules for bookings and orders.',
    fallbackContent: `Cancellation requests should be made as early as possible. Booking and order cancellations may depend on the provider, the service type, and how far the request has progressed.

If a cancellation is approved, any applicable refund will follow the provider rules shared at the time of booking or purchase. For urgent cases, contact support as soon as possible.`,
  },
];

export const legalPageDrafts = (): Record<string, LegalPageDraft> =>
  Object.fromEntries(
    legalPagePresets.map((page) => [page.slug, { title: page.title, content: page.fallbackContent }])
  );
