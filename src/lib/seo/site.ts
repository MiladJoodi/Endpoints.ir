/**
 * Production site URL for metadata, sitemap, and robots.
 * Prefer NEXT_PUBLIC_SITE_URL when set; otherwise endpoints.ir.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://endpoints.ir"
).replace(/\/$/, "");

export const SITE_NAME = "Endpoints";
export const SITE_HOST = "endpoints.ir";

export const SITE_TITLE_DEFAULT = "Endpoints — Lightweight API Client";

export const SITE_DESCRIPTION =
  "A fast, local-first HTTP API client for developers. Send requests, inspect responses, manage collections and environments — entirely in your browser.";

export const SITE_OG_DESCRIPTION =
  "Send HTTP requests, inspect responses, and organize collections. Local-first. No account required.";
