export type EditProjectFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialEditProjectFormState: EditProjectFormState = {
  status: "idle",
  message: "",
};
