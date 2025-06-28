import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/providers/QueryProvider";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";
import { AdminVerification } from "@/components/providers/AdminVerification";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CallFlowHQ Admin",
  description: "CallFlowHQ Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AdminAuthProvider>
            <AdminVerification>
              <QueryProvider>{children}</QueryProvider>
            </AdminVerification>
          </AdminAuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
