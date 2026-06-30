import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: Record<string, unknown>;

  public constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const sendError = (res: Response, error: ApiError): void => {
  res.status(error.statusCode).json({
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    }
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, new ApiError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ApiError) {
    sendError(res, err);
    return;
  }

  console.error(err);
  sendError(res, new ApiError(500, "INTERNAL_ERROR", "Internal server error"));
};
