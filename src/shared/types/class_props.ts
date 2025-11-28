export type ClassProps<C> = {
  [Key in keyof C as C[Key] extends Function ? never : Key]: C[Key];
};
