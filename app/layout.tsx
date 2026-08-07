import type { Metadata } from "next";
import { AppBar, Container, Toolbar } from "@mui/material";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import MainNav from "./components/main-nav";
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
          <AppBar
            position="static"
            color="inherit"
            elevation={0}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Container maxWidth="lg">
              <Toolbar disableGutters>
                <MainNav />
              </Toolbar>
            </Container>
          </AppBar>
          {children}
          {modal}
        </MuiProvider>
      </body>
    </html>
  );
}
