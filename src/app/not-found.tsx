import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: `This page does not exist on ${SITE_NAME}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you requested is not part of {SITE_NAME}.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm font-medium text-foreground underline underline-offset-4"
      >
        Back to {SITE_NAME}
      </Link>
    </main>
  );
}
