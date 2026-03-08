import apiClient from '../../services/apiClient';

/**
 * Fetch a user's profile by id
 * @param {string} userId
 */
export const getProfile = async (userId) => {
	const res = await apiClient.get(`/auth/profile/${userId}`);
	return res.data.data;
};

/**
 * Update authenticated user's profile
 * @param {{ bio?: string, techStack?: string[]|string, avatarFile?: File }} data
 */
export const updateProfile = async (data) => {
	const formData = new FormData();

	if (typeof data.bio === 'string') {
		formData.append('bio', data.bio);
	}

	if (Array.isArray(data.techStack)) {
		formData.append('techStack', data.techStack.join(','));
	} else if (typeof data.techStack === 'string') {
		formData.append('techStack', data.techStack);
	}

	if (data.avatarFile instanceof File) {
		formData.append('avatar', data.avatarFile);
	}

	const res = await apiClient.patch('/auth/profile', formData);
	return res.data.data;
};

/**
 * Fetch posts for a specific user
 * @param {string} userId
 * @param {{ skip?: number, take?: number }} params
 */
export const getUserPosts = async (userId, { skip = 0, take = 20 } = {}) => {
	const res = await apiClient.get(`/post/user/${userId}`, {
		params: { skip, take },
	});
	return res.data.data;
};
