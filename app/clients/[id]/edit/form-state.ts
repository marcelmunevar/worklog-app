export type EditClientFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialEditClientFormState: EditClientFormState = {
  status: "idle",
  message: "",
};
