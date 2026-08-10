"use client";

import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { DatePreset } from "./date-filter-utils";

type DateRangeFilterProps = {
  preset: DatePreset;
  dateFrom: string;
  dateTo: string;
};

const PRESET_OPTIONS: Array<{ value: DatePreset; label: string }> = [
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "next_week", label: "Next week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "all_time", label: "All time" },
  { value: "custom", label: "Custom date range" },
];

export default function DateRangeFilter({
  preset,
  dateFrom,
  dateTo,
}: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPreset, setSelectedPreset] = useState(preset);
  const [fromDate, setFromDate] = useState(dateFrom);
  const [toDate, setToDate] = useState(dateTo);

  const customError = useMemo(() => {
    if (selectedPreset !== "custom") {
      return "";
    }

    if (!fromDate || !toDate) {
      return "";
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

  const updateParams = (nextPreset: DatePreset, nextFrom = "", nextTo = "") => {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.delete("datePreset");
    nextParams.delete("dateFrom");
    nextParams.delete("dateTo");

    nextParams.set("datePreset", nextPreset);

    if (nextPreset === "custom") {
      if (nextFrom) {
        nextParams.set("dateFrom", nextFrom);
      }

      if (nextTo) {
        nextParams.set("dateTo", nextTo);
      }
    }

    const nextQuery = nextParams.toString();

    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const handlePresetChange = (nextPreset: DatePreset) => {
    setSelectedPreset(nextPreset);

    if (nextPreset === "custom") {
      return;
    }

    setFromDate("");
    setToDate("");

    updateParams(nextPreset);
  };

  const handleFromDateChange = (value: string) => {
    setFromDate(value);

    if (!value || !toDate || value > toDate) {
      return;
    }

    updateParams("custom", value, toDate);
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);

    if (!fromDate || !value || fromDate > value) {
      return;
    }

    updateParams("custom", fromDate, value);
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
            handlePresetChange(event.target.value as DatePreset)
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
              onChange={(event) => handleFromDateChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { sm: 160 } }}
            />

            <TextField
              size="small"
              label="To"
              type="date"
              value={toDate}
              onChange={(event) => handleToDateChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { sm: 160 } }}
            />
          </>
        ) : null}

        {hasActiveDateParams ? (
          <Button variant="outlined" onClick={clearFilter}>
            Clear
          </Button>
        ) : null}
      </Stack>

      {selectedPreset === "custom" && customError ? (
        <Alert severity="error" sx={{ py: 0 }}>
          {customError}
        </Alert>
      ) : null}
    </Stack>
  );
}
