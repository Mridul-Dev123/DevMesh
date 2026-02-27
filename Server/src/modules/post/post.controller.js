import { ApiResponse, asyncHandler } from '../../core/index.js';
import postService from './post.service.js';

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user.id);
  return res.status(201).json(new ApiResponse(201, post, 'Post created SuccessFully'));
});
const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPost(req.params);
  return res.status(200).json(new ApiResponse(200, post, 'Requested Post fetched Successfully'));
});
const getFeed = asyncHandler(async (req, res) => {
  const posts = await postService.getFeed(req.user.id);
  return res.status(200).json(new ApiResponse(200, posts, 'Posts fetched successfully'));
});
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await postService.getUserPosts(req.user.id, req.query);
  return res.status(200).json(new ApiResponse(200, posts, 'User Posts Fetched Successfully'));
});
const updatePost = asyncHandler(async (req, res) => {});
const deletePost = asyncHandler(async (req, res) => {});

export default { createPost, getUserPosts, getPost, getFeed, updatePost, deletePost };
