import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

/**
 * Open Graph image for social sharing (Facebook, LinkedIn, etc.)
 *
 * SEO Notes:
 * - Dynamically generated at build/request time
 * - Standard OG image size: 1200x630 pixels
 * - Automatically served at /opengraph-image route
 * - No external fonts — uses system fonts for reliability
 */

export const runtime = "edge";

export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Mine icon - inline SVG for edge runtime compatibility */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "#2d3748",
              border: "4px solid #e53e3e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(229, 62, 62, 0.4)",
            }}
          >
            <svg
              width="90"
              height="90"
              viewBox="0 0 384 384"
              style={{ marginTop: "-10px" }}
            >
              {/* Main bomb body */}
              <path
                fill="#1a1a1a"
                d="m310.54,231.81c0,71.45-57.79,129.23-129.2,129.17-71.05-.06-129.06-57.71-128.97-128.19.09-71.64,57.25-129.67,127.81-129.76,72.3-.09,130.37,57.28,130.37,128.78Z"
              />
              {/* Fuse base */}
              <path
                fill="#4a5568"
                d="m247.51,107.26c-30.82-15.66-62.78-19.87-96.7-12.98.7-5.52,1.32-10.76,2.03-16,.89-6.66,1.83-13.32,2.79-19.98.62-4.28,1.55-5.09,5.94-4.52,19.88,2.6,39.76,5.29,59.63,7.95,8.52,1.14,17.03,2.3,25.56,3.42,5.32.7,6.22,1.7,5.52,7.03-1.51,11.48-3.12,22.94-4.77,35.08Z"
              />
              {/* Fuse cord */}
              <path
                fill="#718096"
                d="m204.49,47.38c7.01-9.94,15.66-16.69,25.87-21.43,20.91-9.71,42.21-9.4,63.67-1.95,4.2,1.46,5.87,4.5,4.7,8.01-1.11,3.33-4.52,4.67-8.67,3.24-15.38-5.3-30.89-6.51-46.61-1.63-8.57,2.66-16.31,6.88-22.73,13.19-1.9,1.87-3.62,2.54-6.23,1.96-3-.67-6.1-.87-9.99-1.39Z"
              />
              {/* Spark elements */}
              <path
                fill="#f6e05e"
                d="m304.81,54.37c-1.56,4.89-3.21,11.02-5.54,16.87-1.11,2.8-4.12,3.55-7.04,2.39-2.88-1.14-4.46-3.55-3.7-6.54,1.4-5.53,3.11-11,4.98-16.39,1.03-2.97,3.59-4.02,6.64-3.5,2.77.47,4.69,3.02,4.66,7.17Z"
              />
              <path
                fill="#f6e05e"
                d="m336.25,23.34c-.6.8-1.52,2.78-3.06,3.93-3.96,2.98-8.15,5.66-12.34,8.32-3.23,2.05-6.64,1.42-8.56-1.35-1.89-2.73-1.23-6.33,1.8-8.45,4.16-2.92,8.38-5.79,12.7-8.46,4.37-2.71,9.43-.07,9.47,6.01Z"
              />
              <path
                fill="#f6e05e"
                d="m319.67,45.02c2.14,1.08,3.71,1.6,4.93,2.54,3.84,2.95,7.6,6.01,11.29,9.14,3.1,2.64,3.51,6.16,1.22,8.82-2.19,2.55-5.61,2.81-8.65.44-4.02-3.13-7.95-6.36-11.88-9.6-2.17-1.79-2.96-4.35-1.71-6.68.99-1.85,3.11-3.09,4.8-4.66Z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#ffffff",
            margin: "0 0 20px 0",
            textAlign: "center",
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          {SITE_NAME}
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "32px",
            color: "#a0aec0",
            margin: "0 0 30px 0",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          Modern mobile-friendly puzzle game
        </p>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "20px",
          }}
        >
          {["Custom Grid Sizes", "Multiple Levels", "Touch Friendly"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "20px",
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
