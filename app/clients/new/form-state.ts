export type CreateClientFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCreateClientFormState: CreateClientFormState = {
  status: "idle",
  message: "",
};
