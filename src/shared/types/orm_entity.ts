type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

export type ORMEntity<T extends Record<string, any>> = {
  [K in NonFunctionPropertyNames<T>]: any;
};
