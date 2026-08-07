"use client";

import { Button, type ButtonProps } from "@mui/material";
import Link from "next/link";

type NavButtonProps = Omit<ButtonProps, "href" | "component"> & {
  href: string;
};

export default function NavButton({ href, ...props }: NavButtonProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Button component="span" {...props} />
    </Link>
  );
}
