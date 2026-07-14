"use client";

/**
 * Catches errors thrown by the root layout itself (outside app/error.tsx's
 * reach). Renders its own <html>/<body> and replaces the whole page, so it
 * can't rely on providers (i18n, theme, design-system CSS vars) — plain
 * markup and English text only, per Next.js's own convention for this file.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <p>The app hit an unexpected error. Try reloading the page.</p>
          <button onClick={() => reset()} style={{ marginTop: 12, padding: "8px 16px", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
