import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { legalPagesApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface LegalContentPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackContent: string;
  metaDescription: string;
}

/**
 * Renders one of the four fixed policy pages (Privacy, Terms, Cookie,
 * Cancellation & Refund). Content is fetched from the backend so an admin
 * can edit it from the dashboard; the text baked into each page as
 * `fallbackContent` is only used if that fetch fails (e.g. before the
 * migration/seed has run), so the page is never blank.
 */
const LegalContentPage = ({ slug, fallbackTitle, fallbackContent, metaDescription }: LegalContentPageProps) => {
  const [title, setTitle] = useState(fallbackTitle);
  const [content, setContent] = useState(fallbackContent);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    legalPagesApi.getBySlug(slug)
      .then((page) => {
        setTitle(page.title || fallbackTitle);
        setContent(page.content || fallbackContent);
        setUpdatedAt(page.updated_at || null);
      })
      .catch((err) => console.error(`Failed to load legal page "${slug}", showing built-in copy:`, err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'July 2026';

  return (
    <>
      <Helmet>
        <title>{title} - Pawtectors</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {content}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LegalContentPage;