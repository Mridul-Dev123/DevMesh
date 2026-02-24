import { ApiError, ApiResponse, asyncHandler } from '../../utils';
import userService from './user.service.js';
import passport from 'passport';
const register = asyncHandler(async (req, res) => {
  const user = await userService.register(req.body);
  return res.status(201).json(new ApiResponse(201, user, 'User Registered Successfully'));
});

const login = asyncHandler(async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return next(new ApiError(404, info?.message || 'User Not Exists'));
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json(new ApiResponse(200, user, 'Login Successfull'));
    });
  })(req, res, next);
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

const logout = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
  });
  req.session.destroy((err) => {
    if (err) return next(err);
  });
  res.clearCookie('connect.sid');

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const userController = { register, login, getMe, logout };

export default userController;
