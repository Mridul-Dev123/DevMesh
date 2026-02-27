import { ApiResponse, asyncHandler } from '../../core/index.js';
import followService from './follow.service.js';

const sendFollowRequest = asyncHandler(async (req, res) => {
  const data = await followService.sendFollowRequest(req.user.id, req.params.userId);

  res.status(201).json(new ApiResponse(201, data, 'Follow request sent'));
});

const acceptFollowRequest = asyncHandler(async (req, res) => {
  const data = await followService.acceptFollowRequest(req.user.id, req.params.userId);

  res.status(200).json(new ApiResponse(200, data, 'Follow request accepted'));
});

const rejectFollowRequest = asyncHandler(async (req, res) => {
  await followService.rejectFollowRequest(req.user.id, req.params.userId);

  res.status(200).json(new ApiResponse(200, null, 'Follow request rejected'));
});

const unfollow = asyncHandler(async (req, res) => {
  await followService.unfollow(req.user.id, req.params.userId);

  res.status(200).json(new ApiResponse(200, null, 'Unfollowed successfully'));
});

const getFollowers = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await followService.getFollowers(req.params.userId, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Followers fetched'));
});

const getFollowing = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await followService.getFollowing(req.params.userId, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Following fetched'));
});

const getPendingRequests = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await followService.getPendingRequests(req.user.id, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Pending requests fetched'));
});

export default {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  unfollow,
  getFollowers,
  getFollowing,
  getPendingRequests,
};
