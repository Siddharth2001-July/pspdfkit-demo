import { Color } from "pspdfkit";

export enum AnnotationTypeEnum {
  NAME = "name",
  SIGNATURE = "signature",
  DATE = "date",
}

export interface User {
  id: number;
  name: string;
  email: string;
  color: Color;
}

export interface UserField {
  userID: number;
  fieldID: number;
}
