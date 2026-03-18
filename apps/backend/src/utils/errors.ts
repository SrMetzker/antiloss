export class AppError extends Error {
  public code?: string
  public details?: unknown

  constructor(
    public statusCode: number,
    message: string,
    options?: {
      code?: string
      details?: unknown
    }
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options?.code || 'VALIDATION_ERROR'
    this.details = options?.details
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message)
    this.name = 'InternalServerError'
  }
}
