import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const size = parseInt((await params).size, 10);

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(145deg, #1d4ed8, #3b82f6)",
          borderRadius: size > 64 ? "24px" : "12px",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(size * 0.35, 16),
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: size > 64 ? "2px" : "1px",
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
            borderRadius: size > 64 ? "24px" : "12px",
          }}
        />
        IF
        {size > 64 && (
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "37%",
              width: Math.max(size * 0.06, 4),
              height: Math.max(size * 0.06, 4),
              background: "#ffffff",
              borderRadius: "50%",
              opacity: 0.8,
            }}
          />
        )}
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}

