import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Medora | Clinic Management Platform",
    template: "%s | Medora",
  },
  description:
    "Manage clinic appointments, doctors, branches, and services with Medora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}