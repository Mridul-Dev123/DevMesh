import multer from 'multer';
import ApiError from '../core/ApiError.js';

const createValidationError = (message, errors = []) =>
  new ApiError(400, message, { code: 'VALIDATION_ERROR', errors });

const mapPrismaError = (error) => {
  const code = error?.code;

  if (code === 'P2002') {
    const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(', ') : 'resource';
    return new ApiError(409, 'A record with this value already exists', {
      code: 'PRISMA_UNIQUE_CONSTRAINT',
      errors: [{ field: target, message: 'Value must be unique' }],
      cause: error,
    });
  }

  if (code === 'P2025') {
    return new ApiError(404, 'Requested record was not found', {
      code: 'PRISMA_NOT_FOUND',
      cause: error,
    });
  }

  if (code === 'P2003') {
    return new ApiError(409, 'Operation violates a related record constraint', {
      code: 'PRISMA_FOREIGN_KEY',
      cause: error,
    });
  }

  return new ApiError(500, 'Database request failed', {
    code: 'PRISMA_ERROR',
    cause: error,
    isOperational: false,
  });
};

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return createValidationError('Uploaded file is too large', [
        { field: 'file', message: 'File size exceeds allowed limit' },
      ]);
    }

    return createValidationError('File upload failed', [{ field: 'file', message: error.message }]);
  }

  const isJsonParseError = error instanceof SyntaxError && error?.status === 400 && 'body' in error;
  if (isJsonParseError) {
    return createValidationError('Invalid JSON payload');
  }

  const isPrismaKnownError =
    error?.name === 'PrismaClientKnownRequestError' ||
    error?.name === 'PrismaClientUnknownRequestError';
  if (isPrismaKnownError) {
    return mapPrismaError(error);
  }

  if (error?.name === 'PrismaClientValidationError') {
    return createValidationError('Invalid data provided for database operation');
  }

  return new ApiError(500, 'Internal Server Error', {
    code: 'INTERNAL_SERVER_ERROR',
    cause: error,
    isOperational: false,
  });
};

const errorHandler = (error, _req, res, next) => {
  void next;
  const normalized = normalizeError(error);
  const includeStack = process.env.NODE_ENV === 'development';

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  return res.status(normalized.statusCode).json(normalized.toJSON({ includeStack }));
};

export { normalizeError };
export default errorHandler;
