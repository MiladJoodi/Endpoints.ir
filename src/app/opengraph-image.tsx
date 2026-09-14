import { ImageResponse } from "next/og";

export const alt = "Endpoints — Lightweight API Client";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function OgMarkup() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background:
          "linear-gradient(145deg, #171a21 0%, #1f2430 55%, #2a2418 100%)",
        color: "#fff8e8",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#8f6b09",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff8e8",
            letterSpacing: 1,
          }}
        >
          EP
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
          Endpoints.ir
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            maxWidth: 920,
          }}
        >
          Lightweight API Client
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#c9c2b4",
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Build requests, inspect responses, and organize collections — local-first
          in your browser.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 22,
          color: "#a89f8e",
          letterSpacing: 0.2,
        }}
      >
        No account · Collections · Environments · History
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(<OgMarkup />, { ...size });
}
