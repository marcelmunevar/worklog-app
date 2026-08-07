"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

type MuiProviderProps = {
  children: React.ReactNode;
};

export default function MuiProvider({ children }: MuiProviderProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
