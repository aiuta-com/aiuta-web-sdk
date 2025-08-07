import { ReactNode } from "react";

export type SwipTypes = {
  buttonText: string;
  children: ReactNode;
  onClickButton: () => void;
};
