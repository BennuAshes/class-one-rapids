export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

export const Ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const Err = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

export const isOk = <T, E>(result: Result<T, E>): result is { success: true; data: T } => {
  return result.success;
};

export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
  return !result.success;
};