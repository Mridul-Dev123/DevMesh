class ApiError extends Error {
  constructor(statusCode = 500, message = 'Something went wrong', errorOrOptions = [], stack = '') {
    super(message);
    const options =
      Array.isArray(errorOrOptions) || errorOrOptions === null
        ? { errors: errorOrOptions ?? [] }
        : errorOrOptions;

    this.name = 'ApiError';
    this.statusCode = Number.isInteger(statusCode) ? statusCode : 500;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = Array.isArray(options.errors) ? options.errors : [];
    this.code =
      typeof options.code === 'string' && options.code.trim()
        ? options.code
        : `HTTP_${this.statusCode}`;
    this.isOperational =
      typeof options.isOperational === 'boolean' ? options.isOperational : this.statusCode < 500;
    if (options.cause) {
      this.cause = options.cause;
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace?.(this, this.constructor);
    }
  }

  toJSON({ includeStack = false } = {}) {
    const payload = {
      success: false,
      message: this.message,
      code: this.code,
      errors: this.errors,
    };

    if (includeStack) {
      payload.stack = this.stack;
    }

    return payload;
  }
}

export default ApiError;
