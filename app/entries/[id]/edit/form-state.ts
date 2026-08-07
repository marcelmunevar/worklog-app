export type EditEntryFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialEditEntryFormState: EditEntryFormState = {
  status: "idle",
  message: "",
};
