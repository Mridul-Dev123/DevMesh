import { useParams, useNavigate } from "react-router-dom";
import { usePost } from "./post.hooks";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import CommentList from "../../components/CommentList";

/**
 * PostPage — single post detail view, reached via /post/:id
 */
const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: post, isLoading, isError } = usePost(id);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                >
                    ← Back
                </button>

                {isLoading && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse space-y-4">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-800" />
                            <div className="space-y-2 flex-1">
                                <div className="h-3 bg-gray-800 rounded w-1/4" />
                                <div className="h-2 bg-gray-800 rounded w-1/6" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-full" />
                            <div className="h-3 bg-gray-800 rounded w-3/4" />
                        </div>
                    </div>
                )}

                {isError && (
                    <p className="text-center text-gray-400 py-12">
                        Post not found or failed to load.
                    </p>
                )}

                {post && (
                    <>
                        <PostCard post={post} />
                        {/* Expanded comments always visible on the detail page */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <h2 className="text-sm font-semibold text-gray-400 mb-4">All Comments</h2>
                            <CommentList postId={post.id} commentCount={post._count?.comments ?? 0} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default PostPage;
