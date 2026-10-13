"use client";

import { ToggleButton } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ShowDeletedToggleProps = {
  checked: boolean;
  label?: string;
  param?: string;
  clearParams?: string[];
};

export default function ShowDeletedToggle({
  checked,
  label = "Show trash",
  param = "showDeleted",
  clearParams = [],
}: ShowDeletedToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = () => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!checked) {
      nextParams.set(param, "true");
      clearParams.forEach((name) => nextParams.delete(name));
    } else {
      nextParams.delete(param);
    }

    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <ToggleButton
      onChange={handleChange}
      selected={checked}
      size="small"
      value={param}
    >
      {label}
    </ToggleButton>
  );
}