import ApiError from '../../core/ApiError.js';
import followRepository from './follow.repository.js';
import {
  buildFollowRequestAcceptedNotification,
  emitNotificationToUser,
} from '../../utils/notifications.js';

/**
 * Send a follow request from one user to another
 * @param {string} followerId - ID of the requesting user
 * @param {string} followingId - ID of the user to follow
 * @throws {ApiError} 400 - If user tries to follow themselves or request already exists
 * @returns {Promise<Follow>} The created follow record with PENDING status
 */
const sendFollowRequest = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const existing = await followRepository.findFollow(followerId, followingId);

  if (existing) {
    throw new ApiError(400, 'Follow request already exists');
  }

  const follow = await followRepository.createFollow(followerId, followingId);

  return follow;
};

/**
 * Accept a pending follow request, updating its status to ACCEPTED
 * @param {string} userId - ID of the user accepting the request
 * @param {string} followerId - ID of the user who sent the request
 * @throws {ApiError} 404 - If no follow request exists
 * @throws {ApiError} 400 - If already accepted
 * @returns {Promise<{ followerCount: number }>}
 */
const acceptFollowRequest = async (userId, followerId, io = null) => {
  const follow = await followRepository.findFollow(followerId, userId);

  if (!follow) {
    throw new ApiError(404, 'Follow request not found');
  }

  if (follow.status === 'ACCEPTED') {
    throw new ApiError(400, 'Follow request already accepted');
  }

  const acceptedFollow = await followRepository.updateFollowStatus(followerId, userId, 'ACCEPTED');

  const followerCount = await followRepository.countFollowers(userId);

  if (acceptedFollow.following?.id && acceptedFollow.follower?.id) {
    const payload = buildFollowRequestAcceptedNotification({
      actor: acceptedFollow.following,
    });
    emitNotificationToUser(io, acceptedFollow.follower.id, payload);
  }

  return { followerCount };
};

/**
 * Reject and delete a pending follow request
 * @param {string} userId - ID of the user rejecting the request
 * @param {string} followerId - ID of the user who sent the request
 * @throws {ApiError} 404 - If no follow request exists
 * @throws {ApiError} 400 - If request is already accepted
 * @returns {Promise<void>}
 */
const rejectFollowRequest = async (userId, followerId) => {
  const follow = await followRepository.findFollow(followerId, userId);

  if (!follow) {
    throw new ApiError(404, 'Follow request not found');
  }

  if (follow.status === 'ACCEPTED') {
    throw new ApiError(400, 'Cannot reject an already accepted follow');
  }

  await followRepository.deleteFollow(followerId, userId);
};

/**
 * Remove an accepted follow relationship
 * @param {string} followerId - ID of the user unfollowing
 * @param {string} followingId - ID of the user being unfollowed
 * @throws {ApiError} 404 - If the follow relationship does not exist
 * @returns {Promise<void>}
 */
const unfollow = async (followerId, followingId) => {
  const follow = await followRepository.findFollow(followerId, followingId);

  if (!follow) {
    throw new ApiError(404, 'You are not following this user');
  }

  await followRepository.deleteFollow(followerId, followingId);
};

/**
 * Get paginated accepted followers of a user
 * @param {string} userId - ID of the user
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<{ followers: Follow[], followerCount: number }>}
 */
const getFollowers = async (userId, { skip = 0, take = 20 }) => {
  const [followers, followerCount] = await Promise.all([
    followRepository.getFollowers(userId, { skip, take }),
    followRepository.countFollowers(userId),
  ]);

  return { followers, followerCount };
};

/**
 * Get paginated accepted following relationships of a user
 * @param {string} userId - ID of the user
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<{ following: Follow[], followingCount: number }>}
 */
const getFollowing = async (userId, { skip = 0, take = 20 }) => {
  const [following, followingCount] = await Promise.all([
    followRepository.getFollowing(userId, { skip, take }),
    followRepository.countFollowing(userId),
  ]);

  return { following, followingCount };
};

/**
 * Get all pending follow requests received by a user
 * @param {string} userId - ID of the user receiving requests
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Follow[]>} Pending follow requests with requester details
 */
const getPendingRequests = async (userId, { skip = 0, take = 20 }) => {
  return followRepository.getPendingRequests(userId, { skip, take });
};

/**
 * Get the follow status between two users
 * @param {string} currentUserId - ID of the authenticated user
 * @param {string} targetUserId - ID of the target user
 * @returns {Promise<{ status: 'NONE' | 'PENDING' | 'ACCEPTED' }>}
 */
const getFollowStatus = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    return { status: 'SELF' };
  }

  const follow = await followRepository.findFollow(currentUserId, targetUserId);

  return { status: follow ? follow.status : 'NONE' };
};

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
