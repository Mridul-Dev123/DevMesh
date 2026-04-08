import { useState } from "react";

import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import { useSavedPosts } from "../bookmarks/bookmark.hooks";

import CreatePost from "./CreatePost";
import { useFeed, useFollowingFeed } from "./post.hooks";

const TABS = [
    { key: "global", label: "Global" },
    { key: "following", label: "Following" },
    { key: "saved", label: "Saved" },
];

/**
 * FeedPage - the main landing page after login
 */
const FeedPage = () => {
    const [activeTab, setActiveTab] = useState("global");

    const globalFeed = useFeed();
    const followingFeed = useFollowingFeed();
    const savedFeed = useSavedPosts();

    const { data: posts, isLoading, isError } =
        activeTab === "global"
            ? globalFeed
            : activeTab === "following"
              ? followingFeed
              : savedFeed;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">Feed</h1>
                    <p className="text-sm text-gray-500 mt-0.5">What the community is sharing</p>
                </div>

                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === tab.key
                                    ? "bg-cyan-500 text-slate-950"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <CreatePost />

                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse"
                            >
                                <div className="flex gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 bg-gray-800 rounded w-1/4" />
                                        <div className="h-2 bg-gray-800 rounded w-1/6" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-800 rounded w-full" />
                                    <div className="h-3 bg-gray-800 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Failed to load feed. Please try again.</p>
                    </div>
                )}

                {!isLoading && !isError && posts?.length === 0 && (
                    <div className="text-center py-16 space-y-2">
                        <p className="text-4xl">Saved</p>
                        <p className="text-gray-300 font-medium">
                            {activeTab === "following"
                                ? "No posts from people you follow yet"
                                : activeTab === "saved"
                                  ? "No saved posts yet"
                                  : "Nothing here yet"}
                        </p>
                        <p className="text-gray-500 text-sm">
                            {activeTab === "following"
                                ? "Follow some users to see their posts here!"
                                : activeTab === "saved"
                                  ? "Save posts to keep useful ideas and references close."
                                  : "Be the first to share something!"}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && posts?.length > 0 && (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FeedPage;
