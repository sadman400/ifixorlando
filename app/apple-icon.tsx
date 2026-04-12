import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(26,26,46,1) 0%, rgba(15,52,96,1) 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Avenir Next, Segoe UI, sans-serif",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "4px solid rgba(255,255,255,0.18)",
            borderRadius: 40,
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            padding: "18px 28px",
          }}
        >
          iFix
        </div>
        <div
          style={{
            fontSize: 18,
            letterSpacing: "0.18em",
            marginTop: 14,
            opacity: 0.82,
            textTransform: "uppercase",
          }}
        >
          Orlando
        </div>
      </div>
    ),
    size
  );
}
