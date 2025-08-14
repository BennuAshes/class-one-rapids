export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

export const Result = {
  ok<T>(data: T): Success<T> {
    return { success: true, data };
  },

  err<E>(error: E): Failure<E> {
    return { success: false, error };
  },

  from<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  },

  async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const data = await fn();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Helper functions
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return !result.success;
}

// Common error types
export class InsufficientFundsError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient funds: required ${required}, available ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

export class InvalidOperationError extends Error {
  constructor(operation: string, reason: string) {
    super(`Invalid operation '${operation}': ${reason}`);
    this.name = 'InvalidOperationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}