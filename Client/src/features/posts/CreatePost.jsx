import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useCreatePost } from "./post.hooks";
import Avatar from "../../components/Avatar";

/**
 * CreatePost — post composer card
 */
const CreatePost = () => {
    const { user } = useAuth();
    const createPost = useCreatePost();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({ defaultValues: { content: "", codeSnippet: "", language: "" } });

    const [showCodeField, setShowCodeField] = [
        watch("codeSnippet") !== "" || false,
        () => { },
    ];

    const onSubmit = (data) => {
        const payload = {
            content: data.content,
            ...(data.codeSnippet ? { codeSnippet: data.codeSnippet, language: data.language || undefined } : {}),
        };
        createPost.mutate(payload, { onSuccess: () => reset() });
    };

    if (!user) return null;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex gap-3">
                    <Avatar user={user} size={40} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                        <textarea
                            id="post-content"
                            placeholder={`What's on your mind, ${user.username}?`}
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                            {...register("content", {
                                required: "Content is required",
                                maxLength: { value: 500, message: "Max 500 characters" },
                            })}
                        />
                        {errors.content && (
                            <p className="text-xs text-red-400">{errors.content.message}</p>
                        )}

                        {/* Code snippet toggle */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById("code-snippet-section");
                                    el.classList.toggle("hidden");
                                }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                            >
                                <span>{"</>"}</span>
                                <span>Add code snippet</span>
                            </button>

                            <div id="code-snippet-section" className="hidden space-y-2">
                                <input
                                    placeholder="Language (e.g. javascript, python)"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    {...register("language")}
                                />
                                <textarea
                                    placeholder="Paste your code here…"
                                    rows={5}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-indigo-200 font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                                    {...register("codeSnippet")}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={createPost.isPending}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {createPost.isPending ? "Posting…" : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
