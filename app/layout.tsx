import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.startsWith("127.") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  const description = "An interactive custom mobile software system for iPhone and iPad, with its own expandable app store.";

  return {
    title: "Custom Software — Device Studio",
    description,
    applicationName: "Custom Software",
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: "Custom Software — Device Studio",
      description,
      images: [{ url: image, width: 1200, height: 630, alt: "Custom Software on a phone and tablet" }],
    },
    twitter: { card: "summary_large_image", title: "Custom Software — Device Studio", description, images: [image] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#11131a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
