import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const nunitoSans = Nunito_Sans({ variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Null Board - The board collaboration platform",
  description: "Null Board is a open-sourced whiteboard collaboration platform that allows you to create and share whiteboards with your team",
  icons: [
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/nullboard.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/nullboard.png",
    },
  ],
};

import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={nunitoSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}