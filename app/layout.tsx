import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hero Prototype Interpreter",
  description: "Turn four wordless Hero's Journey workshop posters into a clickable prototype."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
