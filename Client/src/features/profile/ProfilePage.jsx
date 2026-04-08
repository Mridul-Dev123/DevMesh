import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Avatar from '../../components/Avatar';
import PostCard from '../../components/PostCard';
import FollowButton from '../../components/FollowButton';
import { useAuth } from '../../hooks/useAuth';
import { useProfile, useProfilePosts, useUpdateProfile } from './profile.hooks';
import { useStartConversation } from '../chat/chat.hooks';

const ProfilePage = () => {
	const { id: profileId } = useParams();
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();
	const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile(profileId);
	const { data: posts, isLoading: postsLoading } = useProfilePosts(profileId);
	const updateProfile = useUpdateProfile();
	const startConversation = useStartConversation();

	const isOwner = currentUser?.id === profileId;

	const [bio, setBio] = useState('');
	const [techStackInput, setTechStackInput] = useState('');
	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');

	useEffect(() => {
		if (!profile || !isOwner) return;
		setBio(profile.bio ?? '');
		setTechStackInput((profile.techStack ?? []).join(', '));
		setAvatarFile(null);
		setAvatarPreviewUrl('');
	}, [profile, isOwner]);

	useEffect(() => {
		return () => {
			if (avatarPreviewUrl) {
				URL.revokeObjectURL(avatarPreviewUrl);
			}
		};
	}, [avatarPreviewUrl]);

	const parsedTechStack = useMemo(() => {
		return techStackInput
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}, [techStackInput]);

	const handleFileChange = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (avatarPreviewUrl) {
			URL.revokeObjectURL(avatarPreviewUrl);
		}

		const previewUrl = URL.createObjectURL(file);
		setAvatarPreviewUrl(previewUrl);
		setAvatarFile(file);
		event.target.value = '';
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		updateProfile.mutate({
			bio,
			techStack: parsedTechStack,
			avatarFile,
		});
	};

	const handleMessageClick = async () => {
		if (!profileId || isOwner) return;
		try {
			const conversation = await startConversation.mutateAsync(profileId);
			navigate(`/messages?conversation=${conversation.id}`);
		} catch {
			// Error toast is already handled in hook.
		}
	};

	return (
		<div className="min-h-screen bg-gray-950 text-gray-100">
			<Navbar />

			<main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
				{profileLoading && (
					<div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 animate-pulse">
						<div className="h-8 bg-gray-800 rounded w-2/5 mb-3" />
						<div className="h-4 bg-gray-800 rounded w-1/3" />
					</div>
				)}

				{profileError && (
					<div className="rounded-2xl border border-red-800 bg-red-950/50 p-5 text-red-200">
						Failed to load profile.
					</div>
				)}

				{!profileLoading && !profileError && profile && (
					<>
						<section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
							<div className="flex items-start gap-4">
								<Avatar
									user={{
										username: profile.username,
										avatarUrl: isOwner && avatarPreviewUrl ? avatarPreviewUrl : profile.avatarUrl,
									}}
									size={64}
								/>

								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h1 className="text-2xl font-bold">@{profile.username}</h1>
										<FollowButton targetUserId={profileId} />
										{!isOwner && (
											<button
												onClick={handleMessageClick}
												disabled={startConversation.isPending}
												className="rounded-lg border border-cyan-700/60 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-500 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{startConversation.isPending ? 'Opening...' : 'Message'}
											</button>
										)}
									</div>
									<p className="text-sm text-gray-400 mt-1">{profile.bio || 'No bio yet.'}</p>

									<div className="mt-4 flex gap-5 text-sm text-gray-300">
										<span>
											<strong>{profile.stats?.posts ?? 0}</strong> posts
										</span>
										<span>
											<strong>{profile.stats?.followers ?? 0}</strong> followers
										</span>
										<span>
											<strong>{profile.stats?.following ?? 0}</strong> following
										</span>
									</div>

									{(profile.techStack?.length ?? 0) > 0 && (
										<div className="mt-4 flex flex-wrap gap-2">
											{profile.techStack.map((skill) => (
												<span
													key={skill}
													className="rounded-full border border-cyan-800/70 bg-cyan-950/40 px-2.5 py-1 text-xs text-cyan-200"
												>
													{skill}
												</span>
											))}
										</div>
									)}
								</div>
							</div>
						</section>

						{isOwner && (
							<section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
								<h2 className="text-lg font-semibold mb-4">Edit profile</h2>
								<form className="space-y-4" onSubmit={handleSubmit}>
									<div>
										<label className="block text-sm text-gray-300 mb-1.5">Profile picture</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-slate-200 hover:file:bg-slate-700"
										/>
										<p className="text-xs text-gray-500 mt-1">
											Preview shown instantly. Image uploads to backend on Save profile.
										</p>
									</div>

									<div>
										<label className="block text-sm text-gray-300 mb-1.5">Bio</label>
										<textarea
											value={bio}
											onChange={(e) => setBio(e.target.value)}
											maxLength={160}
											rows={3}
											className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
											placeholder="Tell people about yourself"
										/>
									</div>

									<div>
										<label className="block text-sm text-gray-300 mb-1.5">Tech stack (comma separated)</label>
										<input
											type="text"
											value={techStackInput}
											onChange={(e) => setTechStackInput(e.target.value)}
											className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
											placeholder="React, Node.js, Prisma"
										/>
									</div>

									<button
										type="submit"
										disabled={updateProfile.isPending}
										className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
									>
										{updateProfile.isPending ? 'Saving...' : 'Save profile'}
									</button>
								</form>
							</section>
						)}

						<section className="space-y-4">
							<h2 className="text-lg font-semibold">Posts</h2>

							{postsLoading && <p className="text-sm text-gray-400">Loading posts...</p>}

							{!postsLoading && (posts?.length ?? 0) === 0 && (
								<p className="text-sm text-gray-400">No posts yet.</p>
							)}

							{!postsLoading && (posts?.length ?? 0) > 0 &&
								posts.map((post) => <PostCard key={post.id} post={post} />)}
						</section>
					</>
				)}
			</main>
		</div>
	);
};

export default ProfilePage;
