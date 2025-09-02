import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/providers/QueryProvider";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CallFlow Admin - Modern Administration Dashboard",
  description: "Professional admin interface for CallFlow platform management",
  keywords: ["admin", "dashboard", "callflow", "management", "analytics"],
  authors: [{ name: "CallFlow Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AdminAuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </AdminAuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
