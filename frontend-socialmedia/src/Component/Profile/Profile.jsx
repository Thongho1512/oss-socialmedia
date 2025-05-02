import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Avatar, Button, Box, CircularProgress, Tabs, Tab } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkIcon from "@mui/icons-material/Link";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ProfileModal from "./ProfileModal";
import { UserContext } from "../Context/UserContext";
import TripleTCard from "../HomeSection/TripleTCard";

const Profile = ({ userData: propUserData, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userData: currentUserData, userPosts: currentUserPosts, loading: userContextLoading, error: userContextError, fetchUserById } = useContext(UserContext);

  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followsData, setFollowsData] = useState([]);

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

    // Fetch follows data
    fetchFollowsData();

    if (isCurrentUser && currentUserData && !userContextLoading) {
      setUserData(currentUserData);
      setUserPosts(currentUserPosts || []);
      setHasMorePosts((currentUserPosts || []).length >= 10);
      setLoading(false);
      return;
    }

    if (propUserData) {
      setUserData(propUserData);
      fetchUserData(propUserData.id);
      return;
    }

    fetchUserData(userId);
  }, [userId, propUserData, isCurrentUser, currentUserData, currentUserPosts, userContextLoading]);

  useEffect(() => {
    if (!loading && userData) {
      if (tabValue === 0) {
        fetchUserPosts();
      } else if (tabValue === 1) {
        fetchUserLikes();
      }
    }
  }, [tabValue, loading, userData]);

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
        setUserData(response.data.Data1);
        setUserPosts(response.data.Data2 || []);
        setHasMorePosts(response.data.Data2?.length >= 10);
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
      const endpoint = `http://localhost:8080/api/v1/users/${userId}/posts?page=1`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        setUserPosts(response.data.Data || []);
        setHasMorePosts(response.data.Data?.length >= 10);
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    setPostsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8080/api/v1/users/${userId}/likes?page=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        setUserPosts(response.data.Data || []);
        setHasMorePosts(response.data.Data?.length >= 10);
      }
    } catch (error) {
      console.error("Lỗi khi tải likes:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchFollowsData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const response = await axios.get(
        "http://localhost:8080/api/v1/follows?page=0&size=10",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        // Log the actual structure of the response
        console.log("Follows API Response:", response.data);
        
        // Check if Data is the array or if it contains a 'follows' property
        if (Array.isArray(response.data.Data)) {
          setFollowsData(response.data.Data);
        } else if (response.data.Data && Array.isArray(response.data.Data.follows)) {
          // The response contains a FollowPageDTO with a 'follows' list
          setFollowsData(response.data.Data.follows);
        } else if (response.data.Data && response.data.Data.content && Array.isArray(response.data.Data.content)) {
          // Another possible structure with 'content' array
          setFollowsData(response.data.Data.content);
        } else {
          // If we can't find an array, set an empty array
          console.error("Could not find follows array in response:", response.data);
          setFollowsData([]);
        }
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
        endpoint = `http://localhost:8080/api/v1/users/${userId}/posts?page=${nextPage}`;
      } else if (tabValue === 1) {
        endpoint = `http://localhost:8080/api/v1/users/${userId}/likes?page=${nextPage}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.Status === 200) {
        const newPosts = response.data.Data || [];
        if (newPosts.length > 0) {
          setUserPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setPage(nextPage);
          setHasMorePosts(newPosts.length >= 10);
        } else {
          setHasMorePosts(false);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm bài viết:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    setUserPosts([]);
    setHasMorePosts(true);
    
    if (newValue === 0) {
      fetchUserPosts();
    } else if (newValue === 1) {
      fetchUserLikes();
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

  const handleFollowUser = async () => {
    if (followLoading) return; // Prevent double clicks
    try {
      setFollowLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const myUserId = localStorage.getItem("user_id");
      
      // Don't allow following yourself or if not logged in
      if (!accessToken || !userId || userId === myUserId) return;

      // Handle follow/unfollow based on current state
      if (!userData?.isFollowing) {
        // FOLLOW: Only follow if not already following
        console.log("Attempting to follow user:", userId);
        const response = await axios.post(
          "http://localhost:8080/api/v1/follows",
          { followeeId: userId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.data && response.data.Status === 200) {
          console.log("Follow success:", response.data);
          const newFollowId = response.data?.Data?.id;
          
          // Set persistent state update to reflect follow action
          setUserData(prevData => ({
            ...prevData,
            isFollowing: true,
            followerCount: (prevData.followerCount || 0) + 1,
            followId: newFollowId
          }));
          
          // Update follows data
          await fetchFollowsData();
          
          // Optional: Display success toast or message
          console.log(`Successfully followed user with ID ${userId}`);
        }
      } else {
        // UNFOLLOW: Handle unfollow action
        console.log("Attempting to unfollow user:", userId);
        
        // First attempt: Use the followId from userData if available
        let targetFollowId = userData?.followId;
        
        // Second attempt: If followId is not in userData, search in followsData
        if (!targetFollowId) {
          console.log("Finding follow ID from follows data");
          // Check follows data for a match where the current user is following the profile user
          const existingFollow = followsData.find(
            follow => follow.followeeId === userId
          );
          
          if (existingFollow) {
            targetFollowId = existingFollow.id;
            console.log("Found follow ID in follows data:", targetFollowId);
          }
        }
        
        // Third attempt: If still no followId, try to fetch fresh follow data
        if (!targetFollowId) {
          console.log("Fetching fresh follows data to find follow ID");
          await fetchFollowsData();
          
          const freshFollow = followsData.find(
            follow => follow.followeeId === userId
          );
          
          if (freshFollow) {
            targetFollowId = freshFollow.id;
            console.log("Found follow ID in fresh follows data:", targetFollowId);
          }
        }
        
        // Final check before unfollow
        if (!targetFollowId) {
          console.error("Could not find follow ID for unfollow action");
          // Refresh user data to get the correct follow state
          fetchUserData(userId);
          setFollowLoading(false);
          return;
        }
        
        // Perform unfollow action with the found followId
        console.log(`Unfollowing with ID: ${targetFollowId}`);
        const response = await axios.delete(
          `http://localhost:8080/api/v1/follows/${targetFollowId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.data && response.data.Status === 200) {
          console.log("Unfollow success:", response.data);
          
          // Set persistent state update to reflect unfollow action
          setUserData(prevData => ({
            ...prevData,
            isFollowing: false,
            followerCount: Math.max(0, (prevData.followerCount || 0) - 1),
            followId: null
          }));
          
          // Update follows data to ensure consistency
          await fetchFollowsData();
          
          // Optional: Display success toast or message
          console.log(`Successfully unfollowed user with ID ${userId}`);
        }
      }
    } catch (error) {
      console.error("Error performing follow/unfollow action:", error);
      alert(`Error: ${error.response?.data?.message || error.message || "Failed to perform action"}`);
      // Revert any optimistic UI updates by refreshing data
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
    // Trường hợp post đã có thông tin user
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
    
    // Nếu post không có thông tin user, thêm từ userData
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

  const joinedDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown date";

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 px-4 py-2 flex items-center">
        <KeyboardBackspaceIcon
          className="cursor-pointer mr-6"
          onClick={handleBack}
        />
        <div>
          <h1 className="font-bold text-lg text-white">
            {userData?.firstName} {userData?.lastName}
          </h1>
          <span className="text-gray-500 text-sm">{userPosts.length} posts</span>
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
                  backgroundColor: userData?.isFollowing ? "#222" : "rgb(215, 219, 220)",
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

          {userData?.bio && <p className="mt-3 mb-2">{userData.bio}</p>}

          <div className="flex flex-wrap items-center text-gray-500 mt-2 gap-x-3 gap-y-1">
            {userData?.location && (
              <div className="flex items-center">
                <LocationOnIcon fontSize="small" className="mr-1" />
                <span>{userData.location}</span>
              </div>
            )}

            {userData?.website && (
              <div className="flex items-center">
                <LinkIcon fontSize="small" className="mr-1" />
                <a
                  href={userData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {userData.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            <div className="flex items-center">
              <DateRangeIcon fontSize="small" className="mr-1" />
              <span>Joined {joinedDate}</span>
            </div>

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
          </div>

          <div className="flex items-center mt-3 space-x-5">
            <div className="flex items-center hover:underline cursor-pointer">
              <span className="font-bold">{userData?.followingCount || 0}</span>
              <span className="ml-1 text-gray-500">Following</span>
            </div>

            <div className="flex items-center hover:underline cursor-pointer">
              <span className="font-bold">{userData?.followerCount || 0}</span>
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
          <Tab label="Likes" />
        </Tabs>
      </div>

      <div>
        {loading ? (
          <Box className="flex justify-center items-center py-10">
            <CircularProgress size={30} sx={{ color: "#1d9bf0" }} />
          </Box>
        ) : (
          <div>
            {tabValue === 0 && (
              <>
                {userPosts.length > 0 ? (
                  <div>
                    {userPosts.map((post, index) => (
                      <React.Fragment key={post.id || index}>
                        <TripleTCard post={preparePostForTripleTCard(post)} profileUserId={userId} />
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
              </>
            )}

            {tabValue === 1 && (
              <>
                {userPosts.length > 0 ? (
                  <div>
                    {userPosts.map((post, index) => (
                      <React.Fragment key={post.id || index}>
                        <TripleTCard post={preparePostForTripleTCard(post)} profileUserId={userId} />
                      </React.Fragment>
                    ))}

                    {postsLoading && (
                      <Box className="flex justify-center p-4">
                        <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
                      </Box>
                    )}
                  </div>
                ) : postsLoading ? (
                  <Box className="flex justify-center p-8">
                    <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
                  </Box>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <h3 className="font-bold text-xl">No likes yet</h3>
                    <p className="text-gray-500 mt-1">
                      Posts they like will show up here.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <ProfileModal handleClose={handleClose} open={openProfileModal} />
    </div>
  );
};

export default Profile;
