import type { Metadata, Viewport } from "next";
import "./globals.css";

// Brand fonts are added here (next/font/google or next/font/local) once they
// are confirmed in design/design-system/typography.md. Until then the app
// uses the system font stack defined in globals.css.

export const metadata: Metadata = {
  title: {
    default: "Line-Up",
    template: "%s | Line-Up",
  },
  description: "Public transport for Kigali — routes, tickets, queues and live buses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
