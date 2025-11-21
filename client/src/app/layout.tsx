import type { Metadata } from "next";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";

export const metadata: Metadata = {
  title: "Workspace OS",
  description:
    "A modern project workspace for planning, task execution, team visibility, and delivery control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}
