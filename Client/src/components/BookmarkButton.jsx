import { useToggleBookmark } from "../features/bookmarks/bookmark.hooks";
import { useAuth } from "../hooks/useAuth";

/**
 * BookmarkButton - save/unsave toggle for a post.
 * Props:
 *   postId: string
 *   isBookmarked: boolean
 */
const BookmarkButton = ({ postId, isBookmarked = false }) => {
    const { user } = useAuth();
    const toggleBookmark = useToggleBookmark(postId, isBookmarked);

    const handleClick = () => {
        if (!user) return;
        toggleBookmark.mutate();
    };

    return (
        <button
            onClick={handleClick}
            disabled={toggleBookmark.isPending}
            aria-label={isBookmarked ? "Remove bookmark" : "Save post"}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-150 ${
                isBookmarked
                    ? "text-cyan-300"
                    : "text-gray-400 hover:text-cyan-300"
            }`}
        >
            <span
                className={`text-base leading-none transition-transform duration-150 ${
                    toggleBookmark.isPending
                        ? "scale-90"
                        : isBookmarked
                          ? "scale-110"
                          : "scale-100"
                }`}
            >
                {isBookmarked ? "🔖" : "📑"}
            </span>
            <span>{isBookmarked ? "Saved" : "Save"}</span>
        </button>
    );
};

export default BookmarkButton;
