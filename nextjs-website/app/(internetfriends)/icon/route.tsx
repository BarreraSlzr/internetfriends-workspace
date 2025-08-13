import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(145deg, #1d4ed8, #3b82f6)",
          borderRadius: "12px",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "1px",
          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
          }}
        />
        IF
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "37%",
            width: 2,
            height: 2,
            background: "#ffffff",
            borderRadius: "50%",
            opacity: 0.8,
          }}
        />
      </div>
    ),
    {
      width: 32,
      height: 32,
    },
  );
}

import { generateStamp } from "@/lib/utils/timestamp";