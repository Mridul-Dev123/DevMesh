import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useComments, useCreateComment, useDeleteComment } from "../features/comments/comment.hooks";
import Avatar from "./Avatar";

/**
 * CommentList — expandable comments section for a post card
 * Props:
 *   postId: string
 *   commentCount: number  (shown on the toggle button before expand)
 */
const CommentList = ({ postId, commentCount = 0 }) => {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const { data: comments, isLoading } = useComments(open ? postId : null);
    const createComment = useCreateComment(postId);
    const deleteComment = useDeleteComment(postId);

    const { register, handleSubmit, reset } = useForm();

    const onSubmit = ({ content }) => {
        createComment.mutate({ content }, { onSuccess: () => reset() });
    };

    return (
        <div className="mt-2">
            {/* Toggle button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-cyan-300 transition-colors"
            >
                <span>💬</span>
                <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>
            </button>

            {open && (
                <div className="mt-3 space-y-3">
                    {/* Comment list */}
                    {isLoading ? (
                        <p className="text-xs text-gray-500">Loading comments…</p>
                    ) : comments?.length === 0 ? (
                        <p className="text-xs text-gray-500">No comments yet. Be the first!</p>
                    ) : (
                        comments?.map((comment) => (
                            <div key={comment.id} className="flex gap-2 items-start group">
                                <Avatar user={comment.author} size={28} />
                                <div className="flex-1 bg-gray-800/60 rounded-lg px-3 py-2">
                                    <p className="text-xs font-semibold text-cyan-300">
                                        @{comment.author?.username}
                                    </p>
                                    <p className="text-sm text-gray-200 mt-0.5">{comment.content}</p>
                                </div>
                                {/* Delete button — only visible for own comments */}
                                {user?.id === comment.authorId && (
                                    <button
                                        onClick={() => deleteComment.mutate(comment.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity"
                                        aria-label="Delete comment"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))
                    )}

                    {/* New comment form */}
                    {user && (
                        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mt-1">
                            <Avatar user={user} size={28} />
                            <div className="flex-1 flex gap-2">
                                <input
                                    placeholder="Write a comment…"
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                    {...register("content", { required: true, minLength: 1 })}
                                />
                                <button
                                    type="submit"
                                    disabled={createComment.isPending}
                                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {createComment.isPending ? "…" : "Post"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentList;
