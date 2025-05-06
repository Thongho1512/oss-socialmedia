/**
 * Formats an avatar URL to ensure it's a complete URL
 * @param {string} avatarUrl - The avatar URL from the server
 * @returns {string} - The complete avatar URL
 */
export const formatAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";
  }

  // If the URL is already a complete URL, return it
  if (avatarUrl.startsWith("http")) {
    return avatarUrl;
  }

  // If it's a path like upload/images/... prepend the server URL
  return `http://localhost:8080/${avatarUrl}`;
};