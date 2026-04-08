import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as profileApi from './profile.api';

/**
 * Fetch profile by user id
 * @param {string} userId
 */
export const useProfile = (userId) => {
	return useQuery({
		queryKey: ['profile', userId],
		queryFn: () => profileApi.getProfile(userId),
		enabled: !!userId,
	});
};

/**
 * Fetch posts by user id — returns only the posts array from the paginated response
 * @param {string} userId
 */
export const useProfilePosts = (userId) => {
	return useQuery({
		queryKey: ['profilePosts', userId],
		queryFn: () => profileApi.getUserPosts(userId),
		enabled: !!userId,
		select: (data) => data.posts,
	});
};

/**
 * Update own profile data
 */
export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: profileApi.updateProfile,
		onSuccess: (updatedUser) => {
			queryClient.invalidateQueries({ queryKey: ['me'] });
			queryClient.invalidateQueries({ queryKey: ['profile', updatedUser.id] });
			queryClient.invalidateQueries({ queryKey: ['feed'] });
			toast.success('Profile updated successfully');
		},
		onError: (error) => {
			const message = error?.response?.data?.message ?? 'Failed to update profile.';
			toast.error(message);
		},
	});
};
