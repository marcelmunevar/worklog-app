"use client";

import { Tabs, Tab } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

function getNavValue(pathname: string): string {
  if (pathname.startsWith("/projects")) {
    return "/projects";
  }

  if (pathname.startsWith("/clients")) {
    return "/clients";
  }

  return "/entries";
}

export default function MainNav() {
  const pathname = usePathname();
  const value = getNavValue(pathname);

  return (
    <Tabs
      value={value}
      variant="scrollable"
      allowScrollButtonsMobile
      textColor="primary"
      indicatorColor="primary"
      aria-label="Main navigation"
    >
      <Tab label="Entries" value="/entries" component={Link} href="/entries" />
      <Tab
        label="Projects"
        value="/projects"
        component={Link}
        href="/projects"
      />
      <Tab label="Clients" value="/clients" component={Link} href="/clients" />
    </Tabs>
  );
}
