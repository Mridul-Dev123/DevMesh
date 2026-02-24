import ApiError from '../../core/ApiError.js';
import postRepository from './post.repository.js';

const createPost = async (data, userId) => {
  const { content } = data;
  if (!content) throw new ApiError(400, 'Content is required');
  const Post = await postRepository.createPost({ content, authorId: userId });
  return Post;
};
const getFeed = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const take = Number(limit);

  return postRepository.getAllPosts({ skip, take });
};

const getPost = async (body) => {
  const { id } = body;
  const post = await postRepository.findPostById(id);
  if (!post) throw new ApiError(404, 'No Post with Given Id exists');
  return post;
};
const getUserPosts = async (id, { skip = 0, take = 20 }) => {
  const posts = await postRepository.getPostsByUser(id, { skip, take });
  return posts;
};
export default { createPost, getPost, getFeed, getUserPosts };
