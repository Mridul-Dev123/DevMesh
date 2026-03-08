/**
 * Create a local preview URL for a selected image file.
 * This URL is browser-local and should only be used for UI preview.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export const uploadProfilePicture = async (file) => {
  if (!(file instanceof File)) {
    throw new Error('A valid image file is required');
  }

  return URL.createObjectURL(file);
};
