import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/queryProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { AppChrome } from "@/components/appChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mailpilot.shubhojeet.com"),
  title: {
    default: "MailPilot - AI-Powered Email Assistant",
    template: "%s | MailPilot",
  },
  description:
    "MailPilot is an AI-powered email assistant that lets you control Gmail with natural language. Filter mail, open threads, draft replies, and queue actions for approval.",
  keywords: [
    "AI email assistant",
    "Gmail AI",
    "natural language email",
    "email automation",
    "smart inbox",
    "email productivity",
    "AI mail",
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mailpilot.shubhojeet.com",
    siteName: "MailPilot",
    title: "MailPilot - AI-Powered Email Assistant",
    description:
      "Control Gmail with natural language. Filter mail, open threads, draft replies, and queue actions for AI-powered email productivity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MailPilot - AI-Powered Email Assistant",
    description:
      "Control Gmail with natural language. Filter mail, open threads, draft replies, and queue actions for AI-powered email productivity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppChrome>{children}</AppChrome>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
