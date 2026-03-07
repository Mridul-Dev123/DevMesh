import { useAuth } from "../hooks/useAuth";
import { useToggleLike } from "../features/likes/like.hooks";

/**
 * LikeButton — heart toggle with count
 * Props:
 *   postId: string
 *   count: number
 *   isLiked: boolean (server should tell us this; for now we derive from the feed)
 */
const LikeButton = ({ postId, count = 0, isLiked = false }) => {
    const { user } = useAuth();
    const toggleLike = useToggleLike(postId, isLiked);

    const handleClick = () => {
        if (!user) return;
        toggleLike.mutate();
    };

    return (
        <button
            onClick={handleClick}
            disabled={toggleLike.isPending}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-150
                ${isLiked
                    ? "text-rose-500"
                    : "text-gray-400 hover:text-rose-400"
                }`}
        >
            <span
                className={`text-lg leading-none transition-transform duration-150 ${toggleLike.isPending ? "scale-90" : isLiked ? "scale-110" : "scale-100"
                    }`}
            >
                {isLiked ? "❤️" : "🤍"}
            </span>
            <span>{count}</span>
        </button>
    );
};

export default LikeButton;
