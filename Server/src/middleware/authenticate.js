import { ApiError, asyncHandler } from '../core/index.js';
const authenticate = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  throw new ApiError(401, 'unauthorized- Please Login first');
});
export { authenticate };
