import { ApiResponse, asyncHandler } from '../../core/index.js';
import followService from './follow.service.js';

/**
 * Send a follow request to another user
 * @route POST /api/follow/:userId
 * @access Private
 * @param {string} req.params.userId - ID of the user to follow
 * @returns {201} The created follow record with PENDING status
 */
const sendFollowRequest = asyncHandler(async (req, res) => {
  const data = await followService.sendFollowRequest(req.user.id, req.params.userId);

  res.status(201).json(new ApiResponse(201, data, 'Follow request sent'));
});

/**
 * Accept a pending follow request
 * @route PATCH /api/follow/:userId/accept
 * @access Private
 * @param {string} req.params.userId - ID of the user whose request to accept
 * @returns {200} Updated follower count
 */
const acceptFollowRequest = asyncHandler(async (req, res) => {
  const data = await followService.acceptFollowRequest(
    req.user.id,
    req.params.userId,
    req.app.get('io')
  );

  res.status(200).json(new ApiResponse(200, data, 'Follow request accepted'));
});

/**
 * Reject and delete a pending follow request
 * @route DELETE /api/follow/:userId/reject
 * @access Private
 * @param {string} req.params.userId - ID of the user whose request to reject
 * @returns {200} Success confirmation
 */
const rejectFollowRequest = asyncHandler(async (req, res) => {
  await followService.rejectFollowRequest(req.user.id, req.params.userId);

  res.status(200).json(new ApiResponse(200, null, 'Follow request rejected'));
});

/**
 * Unfollow an accepted follow (removes the follow record)
 * @route DELETE /api/follow/:userId
 * @access Private
 * @param {string} req.params.userId - ID of the user to unfollow
 * @returns {200} Success confirmation
 */
const unfollow = asyncHandler(async (req, res) => {
  await followService.unfollow(req.user.id, req.params.userId);

  res.status(200).json(new ApiResponse(200, null, 'Unfollowed successfully'));
});

/**
 * Get a user's accepted followers with pagination
 * @route GET /api/follow/:userId/followers
 * @access Private
 * @param {string} req.params.userId - ID of the user
 * @query {number} [skip=0] - Records to skip
 * @query {number} [take=20] - Records to return
 * @returns {200} Followers list and total follower count
 */
const getFollowers = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await followService.getFollowers(req.params.userId, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Followers fetched'));
});

/**
 * Get the list of users a given user is following (accepted only)
 * @route GET /api/follow/:userId/following
 * @access Private
 * @param {string} req.params.userId - ID of the user
 * @query {number} [skip=0] - Records to skip
 * @query {number} [take=20] - Records to return
 * @returns {200} Following list and total following count
 */
const getFollowing = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await followService.getFollowing(req.params.userId, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Following fetched'));
});

/**
 * Get all pending follow requests received by the authenticated user
 * @route GET /api/follow/pending
 * @access Private
 * @query {number} [skip=0] - Records to skip
 * @query {number} [take=20] - Records to return
 * @returns {200} Pending follow requests with requester details
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await followService.getPendingRequests(req.user.id, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Pending requests fetched'));
});

/**
 * Get follow status between the authenticated user and a target user
 * @route GET /api/follow/:userId/status
 * @access Private
 * @param {string} req.params.userId - ID of the target user
 * @returns {200} { status: 'NONE' | 'PENDING' | 'ACCEPTED' }
 */
const getFollowStatus = asyncHandler(async (req, res) => {
  const data = await followService.getFollowStatus(req.user.id, req.params.userId);

  res.status(200).json(new ApiResponse(200, data, 'Follow status fetched'));
});

export default {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  unfollow,
  getFollowers,
  getFollowing,
  getPendingRequests,
  getFollowStatus,
};
