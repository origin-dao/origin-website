"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ backgroundColor: "#0a0a0a", color: "#00ff41", fontFamily: "monospace", padding: "2rem" }}>
        <h2>Something went wrong</h2>
        <pre style={{ color: "#ff3333" }}>{error.message}</pre>
        <button
          onClick={() => reset()}
          style={{
            border: "1px solid #00ff41",
            background: "transparent",
            color: "#00ff41",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          {">"} TRY AGAIN
        </button>
      </body>
    </html>
  );
}
