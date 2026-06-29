import { ImageResponse } from "next/og"

export const runtime     = "edge"
export const size        = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(145deg, #a78bfa 0%, #7c3aed 55%, #5b21b6 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shine */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.30) 0%, transparent 55%)",
          }}
        />
        <span style={{ fontSize: 17, fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 1, position: "relative" }}>
          R
        </span>
      </div>
    ),
    { ...size },
  )
}
