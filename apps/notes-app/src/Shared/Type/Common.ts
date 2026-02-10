export type ApiResponse<T> = {
  readonly data: T;
};

export type ApiError = {
  readonly error: string;
  readonly message: string;
  readonly statusCode: number;
};
