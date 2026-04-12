import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(160deg, rgba(22,33,62,1) 0%, rgba(15,52,96,1) 100%)",
          color: "white",
          display: "flex",
          fontFamily: "Avenir Next, Segoe UI, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.04em",
          width: "100%",
        }}
      >
        iFix
      </div>
    ),
    size
  );
}
