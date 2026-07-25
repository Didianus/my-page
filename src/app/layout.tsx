import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Didi — Web Developer Full Stack",
  description:
    "Portfolio Didi, web developer full stack dengan latar belakang Teknologi Informasi. Membangun website dari frontend hingga backend dengan PHP, JavaScript, dan framework modern — di-deploy ke Vercel & InfinityFree.",

  keywords: [
    "web developer",
    "full stack developer",
    "PHP",
    "Laravel",
    "React",
    "Next.js",
    "MySQL",
    "Teknologi Informasi",
    "Vercel",
    "InfinityFree",
    "GitHub",
    "portfolio",
  ],

  authors: [{ name: "Didi" }],

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "Didi — Web Developer Full Stack",
    description:
      "Web developer full stack dengan latar belakang Teknologi Informasi. Membangun website modern dengan PHP, JavaScript, dan framework modern.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Didi Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Didi — Web Developer Full Stack",
    description:
      "Portfolio Web Developer Full Stack dengan Next.js, Laravel, React, dan PostgreSQL.",
    images: ["/logo.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground font-sans selection:bg-gold/30 selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
