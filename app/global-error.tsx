"use client"

// Rendered in place of the root layout, so it carries its own minimal styling.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#0d0d0c",
          color: "#edebe5",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ margin: 0, color: "#8b8983", fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Mountline
          </p>
          <h1 style={{ margin: "16px 0 0", fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "14px 0 0", color: "#a3a19b", fontSize: 15, lineHeight: 1.6 }}>
            The page couldn’t load. Try again, or write to hello@mountline.dev if it keeps happening.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 28,
              height: 40,
              padding: "0 18px",
              border: 0,
              borderRadius: 999,
              background: "#edebe5",
              color: "#0d0d0c",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
