import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/common/theme-provider";
import { QueryProvider } from "@/components/common/query-provider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Festive — a quieter way to find live events",
    template: "%s · Festive",
  },
  description:
    "Festive is a thoughtfully curated marketplace for concerts, conferences, festivals and workshops. Discover what's worth showing up for.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Festive",
    description: "A quieter way to find live events.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="bottom-right" theme="light" closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
