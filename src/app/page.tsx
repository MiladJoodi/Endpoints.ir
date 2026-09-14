import type { Metadata } from "next";
import { Workspace } from "@/components/workspace/workspace";
import { SITE_DESCRIPTION, SITE_OG_DESCRIPTION, SITE_TITLE_DEFAULT } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE_DEFAULT,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_OG_DESCRIPTION,
    url: "/",
    type: "website",
    siteName: "Endpoints",
    locale: "en_US",
  },
};

export default function HomePage() {
  return <Workspace />;
}
