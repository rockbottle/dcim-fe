/* src/app/layout.tsx */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./DashboardWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DCIM Dashboard",
  description: "Data Center Infrastructure Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* This tiny script runs before the page renders to check localStorage directly */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const persisted = localStorage.getItem('persist:root');
                if (persisted) {
                  const globalState = JSON.parse(JSON.parse(persisted).global);
                  if (globalState.isDarkMode) {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}