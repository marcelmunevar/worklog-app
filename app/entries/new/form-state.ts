export type CreateEntryFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCreateEntryFormState: CreateEntryFormState = {
  status: "idle",
  message: "",
};
