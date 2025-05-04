import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Tạo instance Axios với cấu hình cơ bản
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New states for user activity
  const [userLikes, setUserLikes] = useState([]);
  const [userShares, setUserShares] = useState([]);
  const [userFollowing, setUserFollowing] = useState([]);
  const [userFollowers, setUserFollowers] = useState([]);
  const [userSavedPosts, setUserSavedPosts] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  
  // Loading states for each category
  const [likesLoading, setLikesLoading] = useState(false);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [followsLoading, setFollowsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // New state for tracking followed user IDs with their follow IDs
  const [followedUsers, setFollowedUsers] = useState({}); // { userId: followId }

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");

    if (!userId || !accessToken) {
      console.warn("User ID hoặc Token không tồn tại!");
      setError("User ID hoặc Token không tồn tại!");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.Status === 200) {
          setUserData(response.data.Data1);
          setUserPosts(response.data.Data2);
          
          // Fetch additional user data
          fetchUserLikes();
          fetchUserShares();
          fetchUserFollows();
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API User:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserById = useCallback(async (userId) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const localAvatar = localStorage.getItem('user_avatar');
      const localCover = localStorage.getItem('user_cover');
      const currentUserId = localStorage.getItem("user_id");
      const isCurrentUser = userId === currentUserId;

      const response = await api.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        // Only apply locally stored images if this is the current user
        if (isCurrentUser) {
          setUserData({
            ...response.data.Data1,
            avatarUrl: localAvatar || response.data.Data1.avatarUrl,
            coverUrl: localCover || response.data.Data1.coverUrl
          });
        } else {
          setUserData(response.data.Data1);
        }
        setUserPosts(response.data.Data2);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API User:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user likes
  const fetchUserLikes = useCallback(async (page = 0, size = 10) => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    
    if (!userId || !accessToken) return;
    
    try {
      setLikesLoading(true);
      const response = await api.get(`/likes?page=${page}&size=${size}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        // Filter likes for the current user
        const userLikesData = response.data.Data.likes.filter(
          like => String(like.userId) === String(userId)
        );
        
        setUserLikes(prevLikes => 
          page === 0 ? userLikesData : [...prevLikes, ...userLikesData]
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lượt thích:", err);
    } finally {
      setLikesLoading(false);
    }
  }, []);

  // Fetch user shares
  const fetchUserShares = useCallback(async (page = 0, size = 10) => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    
    if (!userId || !accessToken) return;
    
    try {
      setSharesLoading(true);
      const response = await api.get(`/shares?page=${page}&size=${size}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        // Filter shares for the current user
        const userSharesData = response.data.Data.shares.filter(
          share => String(share.userId) === String(userId)
        );
        
        setUserShares(prevShares => 
          page === 0 ? userSharesData : [...prevShares, ...userSharesData]
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu chia sẻ:", err);
    } finally {
      setSharesLoading(false);
    }
  }, []);

  // Enhanced fetchUserFollows to update followedUsers mapping
  const fetchUserFollows = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    
    if (!userId || !accessToken) return;
    
    try {
      setFollowsLoading(true);
      const response = await api.get(`/follows?page=0&size=50`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        let followingEntries = [];
        
        if (response.data.Data && response.data.Data.follows) {
          // Filter follows where the user is the follower (following others)
          followingEntries = response.data.Data.follows.filter(
            follow => String(follow.followerId) === String(userId)
          );
          
          // Filter follows where the user is being followed (followers)
          const followers = response.data.Data.follows.filter(
            follow => String(follow.followeeId) === String(userId)
          );
          
          setUserFollowing(followingEntries);
          setUserFollowers(followers);
        } else if (Array.isArray(response.data.Data)) {
          // Alternative API response format
          followingEntries = response.data.Data.filter(
            follow => String(follow.followerId) === String(userId)
          );
          
          const followers = response.data.Data.filter(
            follow => String(follow.followeeId) === String(userId)
          );
          
          setUserFollowing(followingEntries);
          setUserFollowers(followers);
        }
        
        // Build a mapping of followed user IDs to their follow entry IDs
        const followMapping = {};
        followingEntries.forEach(follow => {
          followMapping[follow.followeeId] = follow.id;
        });
        
        setFollowedUsers(followMapping);
        console.log("Updated followed users mapping:", followMapping);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu theo dõi:", err);
    } finally {
      setFollowsLoading(false);
    }
  }, []);

  // Handle adding a new like
  const addLike = useCallback(async (postId) => {
    const accessToken = localStorage.getItem("access_token");
    
    try {
      const response = await api.post(
        "/likes",
        { postId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        // Add the new like to the userLikes state
        const newLike = response.data.Data;
        setUserLikes(prevLikes => [newLike, ...prevLikes]);
        return newLike;
      }
    } catch (err) {
      console.error("Lỗi khi thích bài viết:", err);
      throw err;
    }
  }, []);

  // Handle removing a like
  const removeLike = useCallback(async (postId) => {
    const accessToken = localStorage.getItem("access_token");
    
    try {
      const response = await api.delete(`/posts/${postId}/likes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        // Remove the like from userLikes state
        setUserLikes(prevLikes => 
          prevLikes.filter(like => like.postId !== postId)
        );
        return true;
      }
    } catch (err) {
      console.error("Lỗi khi bỏ thích bài viết:", err);
      throw err;
    }
  }, []);

  // Handle sharing a post
  const sharePost = useCallback(async (postId, content = "") => {
    const accessToken = localStorage.getItem("access_token");
    
    try {
      const response = await api.post(
        "/shares",
        { postId, content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        // Add the new share to the userShares state
        const newShare = response.data.Data;
        setUserShares(prevShares => [newShare, ...prevShares]);
        return newShare;
      }
    } catch (err) {
      console.error("Lỗi khi chia sẻ bài viết:", err);
      throw err;
    }
  }, []);

  // Handle deleting a share
  const deleteShare = useCallback(async (shareId) => {
    const accessToken = localStorage.getItem("access_token");
    
    try {
      const response = await api.delete(`/shares/${shareId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        // Remove the share from userShares state
        setUserShares(prevShares => 
          prevShares.filter(share => share.id !== shareId)
        );
        return true;
      }
    } catch (err) {
      console.error("Lỗi khi xóa chia sẻ:", err);
      throw err;
    }
  }, []);

  // Enhanced followUser to update followedUsers mapping
  const followUser = useCallback(async (followeeId) => {
    const accessToken = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    
    try {
      console.log(`Calling POST /api/v1/follows API to follow user: ${followeeId}`);
      const response = await api.post(
        "/follows",
        { followeeId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Raw follow API response:", response.data);
      
      if (response.data && response.data.Status === 200) {
        // Generate a temporary follow object with what we know
        // since the API might not return a complete follow object
        const newFollow = {
          // Use response data if it exists, otherwise create our own follow object
          ...(response.data.Data || {}),
          id: response.data.Data?.id || followeeId, // Use the followeeId as fallback
          followerId: userId,
          followeeId: followeeId,
          createdAt: new Date().toISOString()
        };
        
        console.log("Created follow object:", newFollow);
        
        // Add to userFollowing state
        setUserFollowing(prevFollowing => [newFollow, ...prevFollowing]);
        
        // Update the followedUsers mapping
        setFollowedUsers(prev => ({
          ...prev,
          [followeeId]: newFollow.id
        }));
        
        // Update user data to reflect new following count
        setUserData(prevData => ({
          ...prevData,
          followingCount: (prevData.followingCount || 0) + 1
        }));
        
        // Refresh follows data to ensure our state is in sync
        setTimeout(() => fetchUserFollows(), 500);
        
        return newFollow;
      } else {
        console.error("Follow API returned error:", response.data);
        return null;
      }
    } catch (err) {
      console.error("Error when following user:", err);
      throw err;
    }
  }, [fetchUserFollows]);

  // Enhanced unfollowUser to update followedUsers mapping and handle "Resource not found" errors silently
  const unfollowUser = useCallback(async (followId) => {
    const accessToken = localStorage.getItem("access_token");
    
    if (!followId) {
      console.error("Cannot unfollow: No follow ID provided");
      // Silent error, no alert to avoid user annoyance
      return false;
    }
    
    // Declare followeeId at the function scope so it's available in the catch block
    let followeeId = null;
    
    try {
      // Find the followee ID before attempting to unfollow
      const followEntryToRemove = userFollowing.find(follow => follow.id === followId);
      followeeId = followEntryToRemove?.followeeId;
      
      if (!followeeId) {
        console.warn("Could not find followeeId for the given followId:", followId);
        // We'll continue anyway as we have the followId
      }
      
      console.log(`Calling DELETE /api/v1/follows/${followId} API to unfollow`);
      const response = await api.delete(`/follows/${followId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Raw unfollow API response:", response.data);
      
      if (response.data && response.data.Status === 200) {
        // Remove the follow from userFollowing state
        setUserFollowing(prevFollowing => 
          prevFollowing.filter(follow => follow.id !== followId)
        );
        
        // Update the followedUsers mapping if we found a followeeId
        if (followeeId) {
          setFollowedUsers(prev => {
            const newMapping = {...prev};
            delete newMapping[followeeId];
            return newMapping;
          });
        }
        
        // Update user data to reflect new following count
        setUserData(prevData => ({
          ...prevData,
          followingCount: Math.max(0, (prevData.followingCount || 0) - 1)
        }));
        
        // Refresh follows data to ensure our state is in sync
        setTimeout(() => fetchUserFollows(), 500);
        
        return true;
      } else {
        console.error("Unfollow API returned error:", response.data);
        // No alerts for API errors to avoid user annoyance
        return false;
      }
    } catch (err) {
      console.error("Error when unfollowing user:", err);
      
      // Check for "Resource not found" error
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
        
        // Don't show alerts for 404 errors since they're common when unfollowing
        // Users don't need to know about this technical detail
        if (err.response.status === 404) {
          console.log("Resource not found (404) - Silently handling as successful unfollow");
          
          // Handle 404 as a successful unfollow - the relationship is already gone
          // Update the followedUsers mapping if we found a followeeId
          if (followeeId) {
            setFollowedUsers(prev => {
              const newMapping = {...prev};
              delete newMapping[followeeId];
              return newMapping;
            });
          }
          
          // Update user data to reflect new following count
          setUserData(prevData => ({
            ...prevData,
            followingCount: Math.max(0, (prevData.followingCount || 0) - 1)
          }));
          
          // Refresh follows data to ensure our state is in sync
          setTimeout(() => fetchUserFollows(), 500);
          
          // Return true to signal "success" to the caller
          return true;
        } else if (err.response.data && err.response.data.Message) {
          // For other errors, log but don't show alerts
          console.error(`API Error: ${err.response.data.Message}`);
        } 
      } else {
        console.error(`Error when unfollowing: ${err.message}`);
      }
      
      return false;
    }
  }, [userFollowing, fetchUserFollows]);

  // Check if the current user likes a specific post
  const isPostLiked = useCallback((postId) => {
    return userLikes.some(like => like.postId === postId);
  }, [userLikes]);

  // Check if the current user has shared a specific post
  const isPostShared = useCallback((postId) => {
    return userShares.some(share => share.postId === postId);
  }, [userShares]);

  // Enhanced method to check if a user is followed, using the mapping
  const isUserFollowed = useCallback((targetUserId) => {
    return !!followedUsers[targetUserId];
  }, [followedUsers]);

  // Get the follow ID for a specific user (useful for unfollow operations)
  const getFollowId = useCallback((targetUserId) => {
    return followedUsers[targetUserId] || null;
  }, [followedUsers]);

  return (
    <UserContext.Provider
      value={{
        userData,
        userPosts,
        loading,
        error,
        fetchUserById,
        
        // User activity data
        userLikes,
        userShares,
        userFollowing,
        userFollowers,
        userSavedPosts,
        userNotifications,
        followedUsers,
        
        // Loading states
        likesLoading,
        sharesLoading,
        followsLoading,
        notificationsLoading,
        
        // Action methods
        fetchUserLikes,
        fetchUserShares,
        fetchUserFollows,
        addLike,
        removeLike,
        sharePost,
        deleteShare,
        followUser,
        unfollowUser,
        
        // Helper methods
        isPostLiked,
        isPostShared,
        isUserFollowed,
        getFollowId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
