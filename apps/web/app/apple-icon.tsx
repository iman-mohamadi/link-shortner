import { ImageResponse } from "next/og"

export const runtime     = "edge"
export const size        = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(145deg, #a78bfa 0%, #7c3aed 55%, #5b21b6 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shine overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, transparent 52%)",
          }}
        />
        <span
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            position: "relative",
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size },
  )
}
