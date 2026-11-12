// Operational error carrying an HTTP status and a stable machine-readable code (ADR-0007).
export interface ErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
  static badRequest(code: string, message: string, details?: ErrorDetail[]) { return new ApiError(400, code, message, details); }
  static unauthorized(code: string, message: string) { return new ApiError(401, code, message); }
  static forbidden(code: string, message: string) { return new ApiError(403, code, message); }
  static notFound(code: string, message: string) { return new ApiError(404, code, message); }
  static conflict(code: string, message: string) { return new ApiError(409, code, message); }
  static tooMany(code: string, message: string) { return new ApiError(429, code, message); }
  static badGateway(code: string, message: string) { return new ApiError(502, code, message); }
}
