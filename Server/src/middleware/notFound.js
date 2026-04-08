import ApiError from '../core/ApiError.js';

const notFound = (_req, _res, next) => {
  next(new ApiError(404, 'Route not found', { code: 'ROUTE_NOT_FOUND' }));
};

export default notFound;
