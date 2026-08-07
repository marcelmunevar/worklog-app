export type CreateProjectFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCreateProjectFormState: CreateProjectFormState = {
  status: "idle",
  message: "",
};
