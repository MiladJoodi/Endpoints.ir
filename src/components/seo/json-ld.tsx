import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_URL,
} from "@/lib/seo/site";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Site-level structured data for the public API client. */
export function SiteJsonLd() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["Endpoints.ir", SITE_TITLE_DEFAULT],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
  };

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "HTTP request builder",
      "Response inspector",
      "Collections and folders",
      "Environments and variables",
      "Request history",
      "Import and export",
      "Local-first IndexedDB storage",
    ],
  };

  return (
    <>
      <JsonLd data={website} />
      <JsonLd data={webApplication} />
    </>
  );
}
