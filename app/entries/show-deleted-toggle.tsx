"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ShowDeletedToggleProps = {
  checked: boolean;
  label?: string;
};

export default function ShowDeletedToggle({
  checked,
  label = "Show soft deleted entries",
}: ShowDeletedToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    value: boolean,
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("showDeleted", "true");
    } else {
      nextParams.delete("showDeleted");
    }

    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={handleChange} />}
      label={label}
    />
  );
}
