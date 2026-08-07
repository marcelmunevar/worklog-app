import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import MuiProvider from "./mui-provider";

export const metadata: Metadata = {
  title: {
    default: "Work Tracker",
    template: "%s | Work Tracker",
  },
  description: "Track your daily work, tasks, and productivity.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MuiProvider>
          {children}
          {modal}
        </MuiProvider>
      </body>
    </html>
  );
}
