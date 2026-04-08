import { Link } from "react-router-dom";

import { useDeletePost } from "../features/posts/post.hooks";
import { useAuth } from "../hooks/useAuth";

import Avatar from "./Avatar";
import BookmarkButton from "./BookmarkButton";
import CommentList from "./CommentList";
import LikeButton from "./LikeButton";

/**
 * Format a date as a relative time string (e.g. "3 hours ago")
 */
const formatRelative = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

/**
 * PostCard — renders a single post with author info, content, likes, and comments
 * Props:
 *   post: Post object from API
 */
const PostCard = ({ post }) => {
    const { user } = useAuth();
    const deletePost = useDeletePost();
    const isOwner = user?.id === post.author?.id;

    return (
        <article className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm hover:border-gray-700 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <Link
                    to={`/profile/${post.author?.id}`}
                    className="flex items-center gap-3 group"
                >
                    <Avatar user={post.author} size={40} />
                    <div>
                        <p className="text-sm font-semibold text-gray-100 group-hover:text-cyan-300 transition-colors">
                            {post.author?.username}
                        </p>
                        <p className="text-xs text-gray-500">{formatRelative(post.createdAt)}</p>
                    </div>
                </Link>

                {isOwner && (
                    <button
                        onClick={() => deletePost.mutate(post.id)}
                        disabled={deletePost.isPending}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10"
                        aria-label="Delete post"
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Content */}
            <Link to={`/post/${post.id}`} className="block">
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                    {post.content}
                </p>

                {/* Post image */}
                {post.mediaUrl && (
                    <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-96 object-cover rounded-xl border border-gray-800 mb-3"
                        loading="lazy"
                    />
                )}

                {/* Code snippet */}
                {post.codeSnippet && (
                    <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs text-cyan-100 overflow-x-auto font-mono mb-3">
                        <code>{post.codeSnippet}</code>
                    </pre>
                )}
            </Link>

            {/* Footer — likes + comments */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
                <LikeButton
                    postId={post.id}
                    count={post._count?.likes ?? 0}
                    isLiked={post.isLiked ?? false}
                />
                <BookmarkButton
                    postId={post.id}
                    isBookmarked={post.isBookmarked ?? false}
                />
                <CommentList
                    postId={post.id}
                    commentCount={post._count?.comments ?? 0}
                />
            </div>
        </article>
    );
};

export default PostCard;
