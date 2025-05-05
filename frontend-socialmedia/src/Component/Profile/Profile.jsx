import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Avatar, Button, Box, CircularProgress, Tabs, Tab, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import ProfileModal from "./ProfileModal";
import FollowModal from "./FollowModal";
import { UserContext } from "../Context/UserContext";
import TripleTCard from "../HomeSection/TripleTCard";
import Shared from "../Posts/Shared";

const Profile = ({ userData: propUserData, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    userData: currentUserData, 
    userPosts: currentUserPosts, 
    loading: userContextLoading, 
    error: userContextError, 
    fetchUserById, 
    isUserFollowed, 
    getFollowId,
    followUser: contextFollowUser,
    unfollowUser: contextUnfollowUser,
    fetchUserFollows
  } = useContext(UserContext);

  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userShares, setUserShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openFollowModal, setOpenFollowModal] = useState(false);
  const [followModalTab, setFollowModalTab] = useState('followers');
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followsData, setFollowsData] = useState([]);
  const [actualFollowCounts, setActualFollowCounts] = useState({
    followingCount: 0,
    followerCount: 0
  });
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [newBio, setNewBio] = useState("");

  const getUserId = () => {
    if (propUserData) {
      return propUserData.id;
    } else if (location.state?.from === "rightpart") {
      return location.state.userId;
    } else if (id) {
      return id;
    } else {
      return localStorage.getItem("user_id");
    }
  };

  const userId = getUserId();
  const isCurrentUser = userId === localStorage.getItem("user_id");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    setUserPosts([]);
    setUserShares([]);

    // Fetch follows data to ensure we have the latest follow state
    fetchUserFollows();
    fetchFollowsData();

    // Check localStorage for avatar and cover images
    const localAvatar = localStorage.getItem('user_avatar');
    const localCover = localStorage.getItem('user_cover');

    if (isCurrentUser && currentUserData && !userContextLoading) {
      setUserData(prevData => {
        // If this is the current user, use locally stored images when available
        return {
          ...currentUserData,
          avatarUrl: localAvatar || currentUserData.avatarUrl,
          coverUrl: localCover || currentUserData.coverUrl
        };
      });
      setUserPosts(currentUserPosts || []);
      setHasMorePosts((currentUserPosts || []).length >= 10);
      setLoading(false);
      return;
    }

    if (propUserData) {
      // For other users displayed in components, only apply avatar if it's the current user
      const isCurrentUserProfile = propUserData.id === localStorage.getItem("user_id");
      setUserData({
        ...propUserData,
        avatarUrl: isCurrentUserProfile && localAvatar ? localAvatar : propUserData.avatarUrl,
        coverUrl: isCurrentUserProfile && localCover ? localCover : propUserData.coverUrl
      });
      fetchUserData(propUserData.id);
      return;
    }

    fetchUserData(userId);
  }, [userId, propUserData, isCurrentUser, currentUserData, currentUserPosts, userContextLoading, fetchUserFollows]);

  useEffect(() => {
    if (!loading && userData) {
      if (tabValue === 0) {
        fetchUserPosts();
      }
    }
  }, [tabValue, loading, userData, userId]);

  const fetchUserData = async (uid) => {
    try {
      const accessToken = localStorage.getItem("access_token");

      if (uid === localStorage.getItem("user_id") && !userData) {
        await fetchUserById(uid);
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/v1/users/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        const userDataFromApi = response.data.Data1;
        
        // Check if the user is followed using the UserContext's isUserFollowed method
        const isFollowedFlag = isUserFollowed(String(uid));
        
        // Ensure follower and following counts are non-negative
        const sanitizedFollowerCount = Math.max(0, userDataFromApi.followerCount || 0);
        const sanitizedFollowingCount = Math.max(0, userDataFromApi.followingCount || 0);
        
        // Update the userData to include the current follow state with corrected counts
        setUserData({
          ...userDataFromApi,
          followerCount: sanitizedFollowerCount,
          followingCount: sanitizedFollowingCount,
          isFollowing: isFollowedFlag,
          // If we're following, get the followId for future unfollow operations
          followId: isFollowedFlag ? getFollowId(String(uid)) : null
        });
        
        // Chỉ cập nhật userPosts nếu đang ở tab Posts
        if (tabValue === 0) {
          setUserPosts(response.data.Data2 || []);
          setHasMorePosts(response.data.Data2?.length >= 10);
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    setPostsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      console.log("Fetching posts for user ID:", userId);
      
      const endpoint = `http://localhost:8080/api/v1/posts?creatorId=${userId}&page=${page-1}&size=10`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Posts API response:", response.data);

      if (response.data && response.data.Status === 200) {
        if (response.data.Data && Array.isArray(response.data.Data)) {
          const filteredPosts = response.data.Data.filter(post => post.userId === userId);
          setUserPosts(filteredPosts);
          setHasMorePosts(response.data.Data.length >= 10);
        } else if (response.data.Data && Array.isArray(response.data.Data.posts)) {
          const filteredPosts = response.data.Data.posts.filter(post => post.userId === userId);
          setUserPosts(filteredPosts);
          setHasMorePosts(response.data.Data.posts.length >= 10);
        } else if (response.data.Data && response.data.Data.content && Array.isArray(response.data.Data.content)) {
          const filteredPosts = response.data.Data.content.filter(post => post.userId === userId);
          setUserPosts(filteredPosts);
          setHasMorePosts(response.data.Data.content.length >= 10);
        } else {
          setUserPosts([]);
          setHasMorePosts(false);
        }
      } else {
        setUserPosts([]);
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchUserShares = async () => {
    setPostsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8080/api/v1/shares?page=0&size=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("User shares response:", response.data);
      
      if (response.data && response.data.Status === 200) {
        if (response.data.Data && response.data.Data.shares) {
          const sharesWithPostDetails = [];
          
          const userShareItems = response.data.Data.shares.filter(share => share.userId === userId);
          
          for (const share of userShareItems) {
            try {
              const postResponse = await axios.get(
                `http://localhost:8080/api/v1/posts/${share.postId}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              );
              
              if (postResponse.data && postResponse.data.Status === 200) {
                sharesWithPostDetails.push({
                  ...postResponse.data.Data,
                  shareId: share.id,
                  shareContent: share.content,
                  sharedBy: userId,
                  sharedAt: share.createdAt,
                  isShared: true
                });
              }
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin bài đăng ${share.postId}:`, error);
            }
          }
          
          setUserShares(sharesWithPostDetails);
          setHasMorePosts(userShareItems.length >= 5);
        } else {
          setUserShares([]);
          setHasMorePosts(false);
        }
      } else {
        setUserShares([]);
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải shares:", error);
      setUserShares([]);
      setHasMorePosts(false);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchFollowsData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const response = await axios.get(
        "http://localhost:8080/api/v1/follows?page=0&size=50",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        console.log("Follows API Response:", response.data);
        
        let followsList = [];
        
        if (Array.isArray(response.data.Data)) {
          followsList = response.data.Data;
        } else if (response.data.Data && Array.isArray(response.data.Data.follows)) {
          followsList = response.data.Data.follows;
        } else if (response.data.Data && response.data.Data.content && Array.isArray(response.data.Data.content)) {
          followsList = response.data.Data.content;
        } else {
          console.error("Could not find follows array in response:", response.data);
          setFollowsData([]);
          return;
        }
        
        // Remove any duplicate follow relationships by checking unique follower-followee pairs
        const uniqueFollowMap = {};
        const uniqueFollows = followsList.filter(follow => {
          const key = `${follow.followerId}-${follow.followeeId}`;
          if (uniqueFollowMap[key]) return false;
          uniqueFollowMap[key] = true;
          return true;
        });
        
        setFollowsData(uniqueFollows);
        
        // Calculate actual following and follower counts for the current profile user
        const followingCount = uniqueFollows.filter(follow => 
          String(follow.followerId) === String(userId)
        ).length;
        
        const followerCount = uniqueFollows.filter(follow => 
          String(follow.followeeId) === String(userId)
        ).length;
        
        // Store actual counts
        setActualFollowCounts({
          followingCount,
          followerCount
        });
        
        // Update userData with accurate counts if it exists
        if (userData) {
          setUserData(prevData => ({
            ...prevData,
            followingCount,
            followerCount
          }));
        }
        
        console.log(`Actual counts for user ${userId}: Following=${followingCount}, Followers=${followerCount}`);
      }
    } catch (error) {
      console.error("Error fetching follows data:", error);
      setFollowsData([]);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || postsLoading) return;

    setPostsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const nextPage = page + 1;
      let endpoint;
      
      if (tabValue === 0) {
        endpoint = `http://localhost:8080/api/v1/posts?creatorId=${userId}&page=${nextPage-1}&size=10`;
        
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.Status === 200) {
          let newPosts = [];
          if (response.data.Data && Array.isArray(response.data.Data)) {
            newPosts = response.data.Data;
          } else if (response.data.Data && Array.isArray(response.data.Data.posts)) {
            newPosts = response.data.Data.posts;
          } else if (response.data.Data && response.data.Data.content && Array.isArray(response.data.Data.content)) {
            newPosts = response.data.Data.content;
          }
          
          if (newPosts.length > 0) {
            setUserPosts((prevPosts) => [...prevPosts, ...newPosts]);
            setPage(nextPage);
            setHasMorePosts(newPosts.length >= 10);
          } else {
            setHasMorePosts(false);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm bài viết:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    console.log("Tab changed to:", newValue);
    setTabValue(newValue);
    setPage(1);
    setUserPosts([]);
    setHasMorePosts(true);
    
    if (newValue === 0) {
      console.log("Fetching posts for tab 0");
      fetchUserPosts();
    } else if (newValue === 1) {
      console.log("Should display Shared component (tab 1)");
    }
  };

  const handleScroll = (e) => {
    const bottom =
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight - 100;
    if (bottom && !postsLoading && hasMorePosts) {
      loadMorePosts();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [postsLoading, hasMorePosts]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleOpenProfileModel = () => setOpenProfileModal(true);
  const handleClose = () => setOpenProfileModal(false);

  // Handle profile update after successful API call
  const handleProfileUpdate = (updatedData) => {
    console.log("Profile updated:", updatedData);
    
    // Update local userData state
    setUserData(prevData => ({
      ...prevData,
      ...updatedData,
      // Make sure to preserve these values which might not be returned by the API
      avatarUrl: prevData.avatarUrl,
      coverUrl: prevData.coverUrl,
      isFollowing: prevData.isFollowing,
      followId: prevData.followId,
      followerCount: prevData.followerCount,
      followingCount: prevData.followingCount
    }));
    
    // If the updated profile is the current user's profile, update the UserContext
    if (isCurrentUser) {
      // This will trigger a re-render with updated data from context
      fetchUserById(userId);
    }
  };

  const handleOpenFollowModal = (tab) => {
    setFollowModalTab(tab);
    setOpenFollowModal(true);
  };

  const handleCloseFollowModal = () => setOpenFollowModal(false);

  const handleFollowUser = async () => {
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const myUserId = localStorage.getItem("user_id");
      
      // Don't allow following yourself or if not logged in
      if (!accessToken || !userId || userId === myUserId) {
        setFollowLoading(false);
        return;
      }

      // Ensure follower count is a valid non-negative number
      const currentFollowerCount = Math.max(0, parseInt(userData?.followerCount) || 0);

      if (!userData?.isFollowing) {
        console.log("Attempting to follow user:", userId);
        
        // Check if we're already following this user
        // This prevents multiple follow requests for the same user
        if (isUserFollowed(String(userId))) {
          console.log("Already following this user, refreshing state");
          // If we're already following, just update the UI state accordingly
          setUserData(prevData => ({
            ...prevData,
            isFollowing: true,
            followId: getFollowId(String(userId))
          }));
          setFollowLoading(false);
          return;
        }
        
        // Update UI optimistically with proper count
        setUserData(prevData => ({
          ...prevData,
          isFollowing: true,
          followerCount: currentFollowerCount + 1
        }));
        
        // Then make API call
        try {
          const newFollow = await contextFollowUser(userId);
          
          if (newFollow) {
            console.log("Follow success:", newFollow);
            
            // Update with accurate data including the followId
            setUserData(prevData => ({
              ...prevData,
              isFollowing: true,
              followId: newFollow.id
            }));
            
            console.log(`Successfully followed user with ID ${userId}`);
            
            // Refresh follows data to update local state
            fetchUserFollows();
          } else {
            // Revert UI if API call fails
            setUserData(prevData => ({
              ...prevData,
              isFollowing: false,
              followerCount: currentFollowerCount
            }));
            console.warn("Không thể theo dõi người dùng này, vui lòng thử lại sau");
          }
        } catch (followError) {
          // Handle duplicate follow error silently (already following)
          if (followError.response && followError.response.status === 409) {
            console.log("Already following this user (server response)");
            
            // We're already following, so just update the UI accordingly
            // but keep the increased follower count
            setUserData(prevData => ({
              ...prevData,
              isFollowing: true
            }));
            
            // Refresh follows data to get the correct followId
            fetchUserFollows();
            return;
          }
          
          // For other errors, revert UI changes
          setUserData(prevData => ({
            ...prevData,
            isFollowing: false,
            followerCount: currentFollowerCount
          }));
          
          // Check for specific error messages from API
          if (followError.response && followError.response.data && followError.response.data.Message) {
            console.error(`API Error: ${followError.response.data.Message}`);
          } else {
            console.error(`Không thể theo dõi: ${followError.message}`);
          }
        }
      } else {
        console.log("Attempting to unfollow user:", userId);
        
        const targetFollowId = userData?.followId || getFollowId(String(userId));
        
        if (!targetFollowId) {
          console.error("Could not find follow ID for unfollow action");
          fetchUserData(userId);
          setFollowLoading(false);
          return;
        }
        
        // Update UI optimistically with proper count
        setUserData(prevData => ({
          ...prevData,
          isFollowing: false,
          followerCount: Math.max(0, currentFollowerCount - 1)
        }));
        
        try {
          const success = await contextUnfollowUser(targetFollowId);
          
          if (success) {
            console.log("Unfollow success");
            
            // Ensure follower count doesn't go negative
            setUserData(prevData => ({
              ...prevData,
              isFollowing: false,
              followId: null
            }));
            
            // Refresh follows data to update local state
            fetchUserFollows();
          } else {
            // Revert UI changes if API call fails
            setUserData(prevData => ({
              ...prevData,
              isFollowing: true,
              followerCount: currentFollowerCount,
              followId: targetFollowId
            }));
            
            console.error("Failed to unfollow user");
          }
        } catch (unfollowError) {
          // Handle 404 error (already unfollowed) gracefully
          if (unfollowError.response && unfollowError.response.status === 404) {
            // If it's a 404, the follow relationship is already gone, so we should keep the UI updated
            setUserData(prevData => ({
              ...prevData,
              isFollowing: false,
              followId: null
            }));
            
            // Refresh data to get the correct state 
            fetchUserFollows();
          } else {
            // For other errors, revert UI changes
            setUserData(prevData => ({
              ...prevData,
              isFollowing: true,
              followerCount: currentFollowerCount,
              followId: targetFollowId
            }));
            
            console.error("Error unfollowing:", unfollowError);
          }
        }
      }
    } catch (error) {
      console.error("Error performing follow/unfollow action:", error);
      // Refresh the data to get accurate state
      fetchUserData(userId);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const preparePostForTripleTCard = (post) => {
    if (post.user) {
      return {
        ...post,
        content: post.caption || post.content,
        likesCount: post.likeCount || post.likesCount || 0,
        commentsCount: post.commentCount || post.commentsCount || 0,
        repostsCount: post.shareCount || post.repostsCount || 0,
        mediaUrls: post.media 
          ? post.media.map(m => m.url.startsWith('http') ? m.url : `http://localhost:8080/${m.url}`) 
          : post.mediaUrls || []
      };
    }
    
    return {
      ...post,
      content: post.caption || post.content,
      likesCount: post.likeCount || post.likesCount || 0,
      commentsCount: post.commentCount || post.commentsCount || 0,
      repostsCount: post.shareCount || post.repostsCount || 0,
      userId: post.userId || userData?.id,
      user: {
        id: post.userId || userData?.id,
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        username: userData?.username || "",
        avatarUrl: userData?.avatarUrl || null
      },
      mediaUrls: post.media 
        ? post.media.map(m => m.url.startsWith('http') ? m.url : `http://localhost:8080/${m.url}`) 
        : post.mediaUrls || []
    };
  };

  const handleOpenBioDialog = () => {
    setNewBio(userData?.bio || "");
    setBioDialogOpen(true);
  };

  const handleCloseBioDialog = () => {
    setBioDialogOpen(false);
  };

  const handleSaveBio = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      
      // Use PATCH method with JSON body as shown in the swagger documentation
      const response = await axios({
        method: 'patch',
        url: 'http://localhost:8080/api/v1/users/bio',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        data: {
          bio: newBio
        }
      });

      console.log("Bio update response:", response.data);

      if (response.data && response.data.Status === 200) {
        // Update user data with new bio
        setUserData((prevData) => ({ ...prevData, bio: newBio }));
        handleCloseBioDialog();
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  if (loading || userContextLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error || userContextError) 
    return (
      <div className="text-red-500 p-4">
        Error: {error || userContextError}
      </div>
    );

  return (
    <div className="min-h-screen">
      {console.log(
        "Profile component rendering with userId type:",
        typeof userId,
        "value:",
        userId
      )}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 px-4 py-2 flex items-center">
        <KeyboardBackspaceIcon
          className="cursor-pointer mr-6"
          onClick={handleBack}
        />
        <div>
          <h1 className="font-bold text-lg text-white">
            {userData?.firstName} {userData?.lastName}
          </h1>
          <span className="text-gray-500 text-sm">
            {userPosts.length} posts
          </span>
        </div>
      </div>

      <div className="h-48 bg-gray-800 relative">
        {userData?.coverUrl && (
          <img
            src={userData.coverUrl}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        )}
      </div>

      <div className="px-4 relative">
        <Avatar
          alt={userData?.username || "user"}
          src={
            userData?.avatarUrl ||
            "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"
          }
          sx={{
            width: 120,
            height: 120,
            border: "4px solid black",
            position: "absolute",
            top: -60,
            left: 16,
          }}
        />

        <div className="flex justify-end pt-3 pb-5">
          {isCurrentUser ? (
            <Button
              onClick={handleOpenProfileModel}
              variant="outlined"
              sx={{
                borderRadius: "9999px",
                borderColor: "rgb(83, 100, 113)",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  borderColor: "rgb(83, 100, 113)",
                  backgroundColor: "rgba(239, 243, 244, 0.1)",
                },
              }}
            >
              Edit profile
            </Button>
          ) : (
            <Button
              onClick={handleFollowUser}
              disabled={followLoading}
              variant={userData?.isFollowing ? "outlined" : "contained"}
              sx={{
                borderRadius: "9999px",
                backgroundColor: userData?.isFollowing ? "black" : "white",
                color: userData?.isFollowing ? "white" : "black",
                textTransform: "none",
                fontWeight: "bold",
                borderColor: userData?.isFollowing ? "#1d9bf0" : undefined,
                "&:hover": {
                  backgroundColor: userData?.isFollowing
                    ? "#222"
                    : "rgb(215, 219, 220)",
                },
              }}
            >
              {userData?.isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>

        <div className="mt-10">
          <h1 className="font-bold text-xl">
            {userData?.firstName} {userData?.lastName}
          </h1>
          <h2 className="text-gray-500">@{userData?.username}</h2>

          {/* Bio section with edit icon, always visible even when bio is empty */}
          <div className="mt-2 mb-3 flex items-center">
            <p className="flex-grow">{userData?.bio || ""}</p>
            {isCurrentUser && (
              <IconButton
                onClick={handleOpenBioDialog}
                size="small"
                sx={{ color: "white" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </div>

          <div className="flex flex-col text-gray-500 mt-3 gap-y-1">
            {userData?.gender && (
              <div className="flex items-center">
                <span>Gender: {userData.gender}</span>
              </div>
            )}

            {userData?.phoneNumber && (
              <div className="flex items-center">
                <span>Phone: {userData.phoneNumber}</span>
              </div>
            )}
            
            {userData?.email && (
              <div className="flex items-center">
                <span>Email: {userData.email}</span>
              </div>
            )}
          </div>

          <div className="flex items-center mt-3 space-x-5">
            <div
              className="flex items-center hover:underline cursor-pointer"
              onClick={() => handleOpenFollowModal("following")}
            >
              <span className="font-bold">{actualFollowCounts.followingCount}</span>
              <span className="ml-1 text-gray-500">Following</span>
            </div>

            <div
              className="flex items-center hover:underline cursor-pointer"
              onClick={() => handleOpenFollowModal("followers")}
            >
              <span className="font-bold">{actualFollowCounts.followerCount}</span>
              <span className="ml-1 text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-b border-gray-800 sticky top-14 z-10 bg-black">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#1d9bf0",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              color: "rgb(113, 118, 123)",
              fontWeight: "bold",
              "&.Mui-selected": {
                color: "white",
              },
            },
          }}
        >
          <Tab label="Posts" />
          <Tab label="Shared" />
        </Tabs>
      </div>

      {tabValue === 0 && (
        <div>
          {userPosts.length > 0 ? (
            <div>
              {userPosts.map((post, index) => (
                <React.Fragment key={`post-${post.id}-${index}`}>
                  <TripleTCard
                    post={preparePostForTripleTCard(post)}
                    profileUserId={userId}
                  />
                </React.Fragment>
              ))}

              {postsLoading && (
                <Box className="flex justify-center p-4">
                  <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
                </Box>
              )}

              {!hasMorePosts && userPosts.length > 10 && (
                <div className="text-center p-4 text-gray-500 border-t border-gray-800">
                  You've reached the end
                </div>
              )}
            </div>
          ) : postsLoading ? (
            <Box className="flex justify-center p-8">
              <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
            </Box>
          ) : (
            <div className="px-4 py-8 text-center">
              <h3 className="font-bold text-xl">No posts yet</h3>
              <p className="text-gray-500 mt-1">
                When they post, their posts will show up here.
              </p>
              {isCurrentUser && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/homepage/home')}
                  sx={{
                    mt: 3,
                    borderRadius: "9999px",
                    backgroundColor: "#1d9bf0",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#1a8cd8",
                    },
                  }}
                >
                  Create your first post
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {tabValue === 1 && (
        <div className="shared-tab-container">
          {console.log("Rendering Shared component with userId:", userId)}
          <Shared userId={String(userId)} />
        </div>
      )}

      <ProfileModal handleClose={handleClose} open={openProfileModal} onProfileUpdate={handleProfileUpdate} userData={userData} />
      <FollowModal
        open={openFollowModal}
        handleClose={handleCloseFollowModal}
        userId={userId}
        initialTab={followModalTab}
      />

      <Dialog 
        open={bioDialogOpen} 
        onClose={handleCloseBioDialog}
        PaperProps={{
          style: {
            backgroundColor: '#000000',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            border: '1px solid #333'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 'medium', padding: '16px 24px' }}>
          Edit Bio
        </DialogTitle>
        <DialogContent sx={{ padding: '0 24px 20px' }}>
          <TextField
            autoFocus
            margin="dense"
            id="bio"
            label="Bio"
            type="text"
            fullWidth
            variant="outlined"
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: '#333',
                },
                '&:hover fieldset': {
                  borderColor: '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1d9bf0',
                }
              },
              '& .MuiInputLabel-root': {
                color: 'gray'
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1d9bf0'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '8px 24px 16px' }}>
          <Button 
            onClick={handleCloseBioDialog} 
            sx={{ 
              color: '#1d9bf0',
              '&:hover': {
                backgroundColor: 'rgba(29, 155, 240, 0.1)'
              }
            }}
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleSaveBio}
            sx={{ 
              color: '#1d9bf0',
              '&:hover': {
                backgroundColor: 'rgba(29, 155, 240, 0.1)'
              }
            }}
          >
            SAVE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
