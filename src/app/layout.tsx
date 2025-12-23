import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minesweeper",
  description: "Classic Minesweeper game built with React and Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
