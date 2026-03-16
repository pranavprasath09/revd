import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown>;
}

export default function SEOHead({
  title,
  description,
  ogImage,
  canonicalUrl,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = `${title} | RevD`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
