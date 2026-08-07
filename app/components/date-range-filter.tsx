"use client";

import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { DatePreset } from "./date-filter-utils";

type DateRangeFilterProps = {
  preset: DatePreset;
  dateFrom: string;
  dateTo: string;
};

const PRESET_OPTIONS: Array<{ value: DatePreset; label: string }> = [
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom" },
];

export default function DateRangeFilter({
  preset,
  dateFrom,
  dateTo,
}: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(preset);
  const [fromDate, setFromDate] = useState(dateFrom);
  const [toDate, setToDate] = useState(dateTo);

  const customError = useMemo(() => {
    if (selectedPreset !== "custom") {
      return "";
    }

    if (!fromDate || !toDate) {
      return "Both start and end dates are required.";
    }

    if (fromDate > toDate) {
      return "Start date must be before or equal to end date.";
    }

    return "";
  }, [selectedPreset, fromDate, toDate]);

  const hasActiveDateParams = useMemo(() => {
    return (
      !!searchParams.get("datePreset") ||
      !!searchParams.get("dateFrom") ||
      !!searchParams.get("dateTo")
    );
  }, [searchParams]);

  const applyFilter = () => {
    if (selectedPreset === "custom" && customError) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("datePreset");
    nextParams.delete("dateFrom");
    nextParams.delete("dateTo");

    if (selectedPreset === "custom") {
      nextParams.set("datePreset", "custom");
      nextParams.set("dateFrom", fromDate);
      nextParams.set("dateTo", toDate);
    } else {
      nextParams.set("datePreset", selectedPreset);
    }

    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const clearFilter = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("datePreset");
    nextParams.delete("dateFrom");
    nextParams.delete("dateTo");

    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <Stack
      spacing={1}
      sx={{
        display: { xs: "flex", sm: "inline-flex" },
        width: { xs: "100%", sm: "auto" },
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          select
          size="small"
          label="Date range"
          value={selectedPreset}
          onChange={(event) =>
            setSelectedPreset(event.target.value as DatePreset)
          }
          sx={{ minWidth: { sm: 180 } }}
        >
          {PRESET_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {selectedPreset === "custom" ? (
          <>
            <TextField
              size="small"
              label="From"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { sm: 160 } }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { sm: 160 } }}
            />
          </>
        ) : null}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={applyFilter}
            disabled={selectedPreset === "custom" && !!customError}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            onClick={clearFilter}
            disabled={!hasActiveDateParams}
          >
            Clear
          </Button>
        </Box>
      </Stack>

      {selectedPreset === "custom" && customError ? (
        <Alert severity="error" sx={{ py: 0 }}>
          {customError}
        </Alert>
      ) : null}
    </Stack>
  );
}
