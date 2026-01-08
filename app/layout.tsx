import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // title: "la prosperité store",
  // description: "Your one-stop shop for all your needs.",

title: {
    
        template: "%s / la prosperité store",
        default: "bienvenue à la prosperité store",
    
  },
  description: "la prosperité store la meilleure boutique en ligne dans la ville de kinshasa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
       <Header />
        <main>
          {children}
        </main>
        <footer>
         <Footer />
        </footer>
      </body>
    </html>
  );
}
