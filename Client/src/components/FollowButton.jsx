import { useAuth } from "../hooks/useAuth";
import { useFollowStatus, useFollow, useUnfollow } from "../features/follow/follow.hooks";

/**
 * FollowButton — displays Follow / Requested / Unfollow based on current relationship.
 * Hidden when viewing your own profile.
 *
 * Props:
 *   targetUserId: string — the ID of the user whose profile is being viewed
 */
const FollowButton = ({ targetUserId }) => {
    const { user } = useAuth();
    const { data: followData, isLoading } = useFollowStatus(targetUserId);
    const followMutation = useFollow(targetUserId);
    const unfollowMutation = useUnfollow(targetUserId);

    // Don't render if not logged in or viewing own profile
    if (!user || user.id === targetUserId) return null;

    const status = followData?.status ?? "NONE";
    const isPending = followMutation.isPending || unfollowMutation.isPending;

    if (isLoading) {
        return (
            <button
                disabled
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-1.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
            >
                …
            </button>
        );
    }

    // ACCEPTED → show Unfollow button
    if (status === "ACCEPTED") {
        return (
            <button
                onClick={() => unfollowMutation.mutate()}
                disabled={isPending}
                className="group relative rounded-lg border border-cyan-700/60 bg-cyan-950/50 px-4 py-1.5 text-xs font-semibold text-cyan-200 transition-all duration-200 hover:border-red-500/60 hover:bg-red-950/40 hover:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <span className="group-hover:hidden">Following</span>
                <span className="hidden group-hover:inline">
                    {isPending ? "Unfollowing…" : "Unfollow"}
                </span>
            </button>
        );
    }

    // PENDING → show Requested (disabled-ish, but clicking cancels via unfollow)
    if (status === "PENDING") {
        return (
            <button
                onClick={() => unfollowMutation.mutate()}
                disabled={isPending}
                title="Click to cancel request"
                className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-4 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:border-red-500/60 hover:bg-red-950/40 hover:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isPending ? "Cancelling…" : "Requested"}
            </button>
        );
    }

    // NONE → show follow button
    return (
        <button
            onClick={() => followMutation.mutate()}
            disabled={isPending}
            className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {isPending ? "Sending…" : "Follow"}
        </button>
    );
};

export default FollowButton;
