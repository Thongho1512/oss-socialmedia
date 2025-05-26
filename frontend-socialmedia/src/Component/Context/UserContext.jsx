import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// Create Axios instance with basic configuration
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
  
  // New state for tracking post likes with their like IDs for persistence
  const [postLikeMap, setPostLikeMap] = useState({}); // { postId: {liked: boolean, likeId: string} }

  // Ref to track if initial likes have been loaded
  const initialLikesLoaded = useRef(false);
  
  // Track last likes refresh time to avoid too frequent refreshes
  const [lastLikesRefreshTime, setLastLikesRefreshTime] = useState(0);

  // Load saved like state from localStorage on initial render
  useEffect(() => {
    const savedLikes = localStorage.getItem('user_liked_posts');
    if (savedLikes) {
      try {
        const parsedLikes = JSON.parse(savedLikes);
        setPostLikeMap(parsedLikes);
      } catch (error) {
        console.error("Error parsing saved likes from localStorage:", error);
      }
    }
    
    // Initial load of likes data when component mounts
    if (!initialLikesLoaded.current) {
      fetchUserLikes();
      initialLikesLoaded.current = true;
    }
  }, []);

  // Save like state to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(postLikeMap).length > 0) {
      localStorage.setItem('user_liked_posts', JSON.stringify(postLikeMap));
    }
  }, [postLikeMap]);

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

  // Periodically refresh likes data (every 2 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchUserLikes();
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(refreshInterval);
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

  // Enhanced fetchUserLikes to get all likes with proper pagination
  const fetchUserLikes = useCallback(async (refreshForce = false) => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    
    if (!userId || !accessToken) return;
    
    // Check if we need to refresh based on time (prevent too frequent refreshes)
    const currentTime = Date.now();
    if (!refreshForce && currentTime - lastLikesRefreshTime < 10000) { // 10 seconds minimum between refreshes
      console.log("Skipping likes refresh, too soon since last refresh");
      return;
    }
    
    try {
      setLikesLoading(true);
      
      // Use a larger size to get more likes at once, and implement pagination
      let page = 0;
      const size = 100; // Get more likes at once
      let allLikes = [];
      let hasMorePages = true;
      
      while (hasMorePages) {
        console.log(`Fetching likes page ${page}`);
        const response = await api.get(`/likes?page=${page}&size=${size}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.Status === 200) {
          // Make sure we have likes data in the expected format
          if (!response.data.Data || !response.data.Data.likes || !Array.isArray(response.data.Data.likes)) {
            console.error("Unexpected likes data format:", response.data.Data);
            break;
          }
          
          // Get likes for this page
          const pageLikes = response.data.Data.likes;
          if (pageLikes.length === 0) {
            hasMorePages = false;
            break;
          }
          
          // Add to our collection
          allLikes = [...allLikes, ...pageLikes];
          
          // Check if we have more pages
          const totalPages = response.data.Data.totalPages || 1;
          if (page >= totalPages - 1) {
            hasMorePages = false;
          } else {
            page++;
          }
        } else {
          console.error("Failed to fetch likes:", response.data);
          break;
        }
      }
      
      console.log(`Fetched a total of ${allLikes.length} likes`);
      
      // Filter likes for the current user
      const userLikesData = allLikes.filter(like => String(like.userId) === String(userId));
      
      // Update userLikes state
      setUserLikes(userLikesData);
      
      // Build a comprehensive mapping of ALL likes for better performance
      const newLikeMap = {};
      userLikesData.forEach(like => {
        if (like.postId) { // Make sure we have a valid postId
          newLikeMap[like.postId] = {
            liked: true,
            likeId: like.id
          };
        }
      });
      
      // Update the postLikeMap for persistence
      setPostLikeMap(prevMap => ({
        ...prevMap,
        ...newLikeMap
      }));
      
      // Update last refresh time
      setLastLikesRefreshTime(Date.now());
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lượt thích:", err);
    } finally {
      setLikesLoading(false);
    }
  }, [lastLikesRefreshTime]);

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
    const userId = localStorage.getItem("user_id");
    
    try {
      console.log(`Adding like for post: ${postId}`);
      const response = await api.post(
        "/likes",
        { postId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Add like API response:", response.data);
      
      if (response.data && response.data.Status === 200) {
        // Create a like object even if API doesn't return complete data
        const newLike = response.data.Data || {
          id: `temp-${Date.now()}`, // Generate a temporary ID if none provided
          postId: postId,
          userId: userId,
          createdAt: new Date().toISOString()
        };
        
        // Ensure we have a valid like ID
        if (!newLike.id && response.data.Message) {
          // Some APIs return the ID in a different format or in the message
          const idMatch = response.data.Message?.match(/ID: ([a-zA-Z0-9-]+)/);
          if (idMatch && idMatch[1]) {
            newLike.id = idMatch[1];
          }
        }
        
        // Add the new like to the userLikes state
        setUserLikes(prevLikes => [newLike, ...prevLikes]);
        
        // Update the postLikeMap for persistence
        setPostLikeMap(prev => ({
          ...prev,
          [postId]: {
            liked: true,
            likeId: newLike.id
          }
        }));
        
        console.log(`Successfully liked post ${postId}, like ID: ${newLike.id}`);
        return newLike;
      } else {
        console.error("Like API returned error:", response.data);
        return null;
      }
    } catch (err) {
      console.error("Lỗi khi thích bài viết:", err);
      
      // If there's a specific error message from the server, log it
      if (err.response && err.response.data) {
        console.error("Server error message:", err.response.data);
      }
      
      throw err;
    }
  }, []);

  // Handle removing a like
  const removeLike = useCallback(async (likeId, postId) => {
    const accessToken = localStorage.getItem("access_token");
    
    try {
      // First check if we have a valid likeId
      if (!likeId) {
        console.error("Cannot remove like: No likeId provided");
        return false;
      }
      
      const response = await api.delete(`/likes/${likeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        // Remove the like from userLikes state
        setUserLikes(prevLikes => 
          prevLikes.filter(like => like.id !== likeId)
        );
        
        // Update the postLikeMap for persistence
        setPostLikeMap(prev => {
          const newMap = {...prev};
          if (postId && newMap[postId]) {
            delete newMap[postId];
          }
          return newMap;
        });
        
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

  // Enhanced check if the current user likes a specific post
  const isPostLiked = useCallback((postId) => {
    if (!postId) return false;
    
    // First check our persistent mapping
    if (postLikeMap[postId] && postLikeMap[postId].liked) {
      return true;
    }
    
    // Fall back to the userLikes array
    return userLikes.some(like => like.postId === postId);
  }, [userLikes, postLikeMap]);

  // Get the like ID for a specific post
  const getPostLikeId = useCallback((postId) => {
    // First check our persistent mapping
    if (postLikeMap[postId] && postLikeMap[postId].likeId) {
      return postLikeMap[postId].likeId;
    }
    // Fall back to the userLikes array
    const like = userLikes.find(like => like.postId === postId);
    return like ? like.id : null;
  }, [userLikes, postLikeMap]);

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
        postLikeMap,
        
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
        getPostLikeId,
        isPostShared,
        isUserFollowed,
        getFollowId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
