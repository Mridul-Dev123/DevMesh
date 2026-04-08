import { ApiError, ApiResponse, asyncHandler } from '../../core/index.js';
import userService from './user.service.js';
import passport from 'passport';
import { uploadImageBuffer } from '../../utils/cloudinary.js';

/**
 * Register a new user account
 * @route POST /api/auth/register
 * @access Public
 * @body {string} username - Unique username
 * @body {string} email - User email address
 * @body {string} password - Plain-text password (will be hashed)
 * @returns {201} Created user object (password excluded)
 */
const register = asyncHandler(async (req, res) => {
  const user = await userService.register(req.body);
  return res.status(201).json(new ApiResponse(201, user, 'User Registered Successfully'));
});

/**
 * Log in with username and password using Passport local strategy
 * @route POST /api/auth/login
 * @access Public
 * @body {string} username - Registered username
 * @body {string} password - Account password
 * @returns {200} Authenticated user object
 */
const login = asyncHandler(async (req, res, next) => {
  // Backward compatible: allow { username, password } or { email, password } payloads.
  if (!req.body.identifier) {
    req.body.identifier = req.body.username || req.body.email;
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return next(
        new ApiError(401, info?.message || 'Invalid credentials', {
          code: 'INVALID_CREDENTIALS',
          errors: [{ field: 'identifier', message: info?.message || 'Invalid credentials' }],
        })
      );
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json(new ApiResponse(200, user, 'Login Successfull'));
    });
  })(req, res, next);
});

/**
 * Get the currently authenticated user's profile
 * @route GET /api/auth/me
 * @access Private
 * @returns {200} The authenticated user object from the session
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

/**
 * Log out the current user and destroy their session
 * @route POST /api/auth/logout
 * @access Private
 * @returns {200} Logout confirmation
 */
const logout = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    if (!req.session) {
      res.clearCookie('connect.sid');
      return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    }

    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    });
  });
});

/**
 * Get a user's public profile by user id
 * @route GET /api/auth/profile/:userId
 * @access Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.params.userId);
  return res.status(200).json(new ApiResponse(200, profile, 'Profile fetched successfully'));
});

/**
 * Update the authenticated user's profile
 * @route PATCH /api/auth/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file?.buffer) {
    try {
      const cloudinaryResult = await uploadImageBuffer(req.file.buffer, {
        folder: 'devmesh/profiles',
        publicId: `${req.user.id}_${Date.now()}`,
      });
      payload.avatarUrl = cloudinaryResult.secure_url;
    } catch {
      throw new ApiError(500, 'Avatar upload failed');
    }
  }

  const updated = await userService.updateProfile(req.user.id, payload);
  return res.status(200).json(new ApiResponse(200, updated, 'Profile updated successfully'));
});

const userController = { register, login, getMe, logout, getProfile, updateProfile };

export default userController;
