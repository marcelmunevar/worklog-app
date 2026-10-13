export const PROJECT_STATUSES = [
  "active",
  "on hold",
  "completed",
  "archived",
] as const;

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

export function isProjectStatus(value: string) {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}
