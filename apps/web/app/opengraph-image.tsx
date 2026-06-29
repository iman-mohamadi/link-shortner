import { ImageResponse } from "next/og"

export const runtime     = "edge"
export const alt         = "RizO — Forge Short Links That Convert"
export const size        = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0c080f 0%, #160a10 40%, #0c080f 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 420,
            background: "radial-gradient(ellipse, rgba(124,58,237,0.28) 0%, transparent 68%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "15%",
            top: "20%",
            width: 300,
            height: 300,
            background: "radial-gradient(ellipse, rgba(251,113,133,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "12%",
            bottom: "18%",
            width: 280,
            height: 280,
            background: "radial-gradient(ellipse, rgba(225,29,72,0.14) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 36 }}>
          {/* Logomark */}
          <div
            style={{
              width: 76,
              height: 76,
              background: "linear-gradient(145deg, #a78bfa 0%, #7c3aed 55%, #5b21b6 100%)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 48px rgba(124,58,237,0.55), 0 0 0 1px rgba(255,255,255,0.12) inset",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shine */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, transparent 55%)",
              }}
            />
            <span
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                position: "relative",
              }}
            >
              R
            </span>
          </div>

          {/* Wordmark */}
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "white",
              lineHeight: 1,
            }}
          >
            Riz
            <span style={{ color: "#7c3aed" }}>O</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "rgba(251,113,133,0.92)",
            marginBottom: 18,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Forge Short Links That Convert
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(186,192,204,0.68)",
            textAlign: "center",
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          Real-time analytics · Custom slugs · QR codes · Password protection · Sub-50ms redirects
        </div>

        {/* Stats pill */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginTop: 52,
            background: "rgba(255,255,255,0.055)",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          {[
            ["<50ms", "Redirects"],
            ["99.9%", "Uptime"],
            ["Free", "To Start"],
            ["∞", "Clicks/link"],
          ].map(([val, label], i) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "18px 42px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>{val}</span>
              <span style={{ fontSize: 12, color: "rgba(140,146,160,0.70)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom domain pill */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            background: "rgba(124,58,237,0.12)",
            borderRadius: 999,
            border: "1px solid rgba(124,58,237,0.24)",
          }}
        >
          <span style={{ fontSize: 16, color: "rgba(251,113,133,0.85)", fontWeight: 500 }}>rizo.link</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
