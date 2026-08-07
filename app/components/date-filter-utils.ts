export const DATE_PRESETS = [
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "custom",
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number];

type SearchParamsLike = Record<string, string | string[] | undefined>;

export type DateFilterState = {
  preset: DatePreset;
  dateFrom: string;
  dateTo: string;
  isActive: boolean;
};

const DEFAULT_PRESET: DatePreset = "last_30_days";

function isDatePreset(value: string): value is DatePreset {
  return DATE_PRESETS.includes(value as DatePreset);
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function resolvePresetRange(preset: Exclude<DatePreset, "custom">, now: Date) {
  const utcToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  if (preset === "last_7_days") {
    const from = new Date(utcToday);
    from.setUTCDate(from.getUTCDate() - 6);
    return {
      dateFrom: formatIsoDate(from),
      dateTo: formatIsoDate(utcToday),
    };
  }

  if (preset === "last_30_days") {
    const from = new Date(utcToday);
    from.setUTCDate(from.getUTCDate() - 29);
    return {
      dateFrom: formatIsoDate(from),
      dateTo: formatIsoDate(utcToday),
    };
  }

  if (preset === "this_month") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return {
      dateFrom: formatIsoDate(from),
      dateTo: formatIsoDate(utcToday),
    };
  }

  const from = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));

  return {
    dateFrom: formatIsoDate(from),
    dateTo: formatIsoDate(to),
  };
}

export function getDateFilterState(
  searchParams: SearchParamsLike,
  now = new Date(),
): DateFilterState {
  const presetParam = firstValue(searchParams.datePreset);
  const dateFromParam = firstValue(searchParams.dateFrom);
  const dateToParam = firstValue(searchParams.dateTo);

  const customFromValid = !!dateFromParam && isIsoDate(dateFromParam);
  const customToValid = !!dateToParam && isIsoDate(dateToParam);

  if (presetParam === "custom") {
    const customIsValid =
      customFromValid && customToValid && dateFromParam <= dateToParam;

    return {
      preset: "custom",
      dateFrom: customFromValid ? dateFromParam : "",
      dateTo: customToValid ? dateToParam : "",
      isActive: customIsValid,
    };
  }

  if (presetParam && isDatePreset(presetParam) && presetParam !== "custom") {
    const { dateFrom, dateTo } = resolvePresetRange(presetParam, now);
    return {
      preset: presetParam,
      dateFrom,
      dateTo,
      isActive: true,
    };
  }

  if (customFromValid && customToValid && dateFromParam <= dateToParam) {
    return {
      preset: "custom",
      dateFrom: dateFromParam,
      dateTo: dateToParam,
      isActive: true,
    };
  }

  return {
    preset: DEFAULT_PRESET,
    dateFrom: "",
    dateTo: "",
    isActive: false,
  };
}

export function toInclusiveTimestampBounds(dateFrom: string, dateTo: string) {
  const from = new Date(`${dateFrom}T00:00:00.000Z`);
  const to = new Date(`${dateTo}T23:59:59.999Z`);

  return { from, to };
}
