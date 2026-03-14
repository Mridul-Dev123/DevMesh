import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useCreatePost } from "./post.hooks";
import Avatar from "../../components/Avatar";

/**
 * CreatePost — post composer card with optional image upload
 */
const CreatePost = () => {
    const { user } = useAuth();
    const createPost = useCreatePost();
    const fileInputRef = useRef(null);

    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { content: "", codeSnippet: "", language: "" } });

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const removeMedia = () => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaFile(null);
        setMediaPreview("");
    };

    const onSubmit = (data) => {
        const payload = {
            content: data.content,
            ...(data.codeSnippet ? { codeSnippet: data.codeSnippet, language: data.language || undefined } : {}),
            ...(mediaFile ? { media: mediaFile } : {}),
        };
        createPost.mutate(payload, {
            onSuccess: () => {
                reset();
                removeMedia();
            },
        });
    };

    if (!user) return null;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex gap-3">
                    <Avatar user={user} size={40} className="shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                        <textarea
                            id="post-content"
                            placeholder={`What's on your mind, ${user.username}?`}
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                            {...register("content", {
                                required: "Content is required",
                                maxLength: { value: 500, message: "Max 500 characters" },
                            })}
                        />
                        {errors.content && (
                            <p className="text-xs text-red-400">{errors.content.message}</p>
                        )}

                        {/* Image preview */}
                        {mediaPreview && (
                            <div className="relative group">
                                <img
                                    src={mediaPreview}
                                    alt="Upload preview"
                                    className="w-full max-h-64 object-cover rounded-xl border border-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={removeMedia}
                                    className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Code snippet toggle */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const el = document.getElementById("code-snippet-section");
                                        el.classList.toggle("hidden");
                                    }}
                                    className="text-xs text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1"
                                >
                                    <span>{"</>"}</span>
                                    <span>Add code snippet</span>
                                </button>

                                {/* Image upload button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1"
                                >
                                    <span>🖼️</span>
                                    <span>Add image</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <div id="code-snippet-section" className="hidden space-y-2">
                                <input
                                    placeholder="Language (e.g. javascript, python)"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                    {...register("language")}
                                />
                                <textarea
                                    placeholder="Paste your code here…"
                                    rows={5}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-cyan-100 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                                    {...register("codeSnippet")}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={createPost.isPending}
                                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
