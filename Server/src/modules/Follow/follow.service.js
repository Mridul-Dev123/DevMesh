import ApiError from '../../core/ApiError.js';
import followRepository from './follow.repository.js';

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

const acceptFollowRequest = async (userId, followerId) => {
  const follow = await followRepository.findFollow(followerId, userId);

  if (!follow) {
    throw new ApiError(404, 'Follow request not found');
  }

  if (follow.status === 'ACCEPTED') {
    throw new ApiError(400, 'Follow request already accepted');
  }

  await followRepository.updateFollowStatus(followerId, userId, 'ACCEPTED');

  const followerCount = await followRepository.countFollowers(userId);

  return { followerCount };
};

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

const unfollow = async (followerId, followingId) => {
  const follow = await followRepository.findFollow(followerId, followingId);

  if (!follow) {
    throw new ApiError(404, 'You are not following this user');
  }

  await followRepository.deleteFollow(followerId, followingId);
};

const getFollowers = async (userId, { skip = 0, take = 20 }) => {
  const [followers, followerCount] = await Promise.all([
    followRepository.getFollowers(userId, { skip, take }),
    followRepository.countFollowers(userId),
  ]);

  return { followers, followerCount };
};

const getFollowing = async (userId, { skip = 0, take = 20 }) => {
  const [following, followingCount] = await Promise.all([
    followRepository.getFollowing(userId, { skip, take }),
    followRepository.countFollowing(userId),
  ]);

  return { following, followingCount };
};

const getPendingRequests = async (userId, { skip = 0, take = 20 }) => {
  return followRepository.getPendingRequests(userId, { skip, take });
};

export default {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  unfollow,
  getFollowers,
  getFollowing,
  getPendingRequests,
};
