import { ClassProps } from "./class_props";

export type BaseErrorProps<T> = Omit<ClassProps<T>, "stack" | "cause" | "name">;
