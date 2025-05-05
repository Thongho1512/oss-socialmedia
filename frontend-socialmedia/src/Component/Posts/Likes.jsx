import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import axios from "axios";
import TripleTCard from "../HomeSection/TripleTCard";

const Likes = ({ userId }) => {
  const [userLikes, setUserLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreLikes, setHasMoreLikes] = useState(true);
  const [page, setPage] = useState(0);
  const [postsCache, setPostsCache] = useState({});
  const [usersCache, setUsersCache] = useState({});
  const [requestFailed, setRequestFailed] = useState(false);
  
  useEffect(() => {
    console.log("Likes component mounted with userId:", userId);
    setPage(0);
    setUserLikes([]);
    setHasMoreLikes(true);
    setRequestFailed(false);
    fetchUserLikes();
  }, [userId]);

  const fetchUserLikes = async () => {
    console.log("Fetching likes for user:", userId, "page:", page);
    setLoading(true);
    try {
      const currentUserId = localStorage.getItem("user_id");
      console.log("Current user ID from localStorage:", currentUserId);
      
      const targetUserId = userId || currentUserId;
      console.log("Target userId for filtering:", targetUserId);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        setLoading(false);
        setRequestFailed(true);
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/v1/likes?page=${page}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Likes API response:", response.data);
      
      if (response.data && response.data.Status === 200) {
        if (response.data.Data && response.data.Data.likes) {
          const userLikeItems = response.data.Data.likes.filter(like => 
            String(like.userId) === String(targetUserId)
          );
          
          console.log("Filtered likes for target user:", userLikeItems);
          
          if (userLikeItems.length > 0) {
            const likedPosts = await fetchPostDetailsSequentially(userLikeItems, accessToken);
            
            setUserLikes(prevLikes => 
              page === 0 ? likedPosts : [...prevLikes, ...likedPosts].filter(p => p !== null)
            );
            
            setHasMoreLikes(userLikeItems.length === 10);
          } else {
            if (page === 0) {
              setUserLikes([]);
            }
            setHasMoreLikes(false);
          }
        } else {
          if (page === 0) {
            setUserLikes([]);
          }
          setHasMoreLikes(false);
        }
      } else {
        console.error("API returned non-200 status:", response.data);
        if (page === 0) {
          setUserLikes([]);
          setRequestFailed(true);
        }
        setHasMoreLikes(false);
      }
    } catch (error) {
      console.error("Error loading likes:", error);
      setError(error.message);
      setRequestFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetailsSequentially = async (likes, accessToken) => {
    const likedPostsWithDetails = [];
    const newCache = { ...postsCache };
    const newUsersCache = { ...usersCache };
    
    for (const like of likes) {
      try {
        if (newCache[like.postId]) {
          const cachedPost = newCache[like.postId];
          const postWithLikeInfo = {
            ...cachedPost,
            likeId: like.id,
            likedAt: like.createdAt,
            isLiked: true
          };
          likedPostsWithDetails.push(postWithLikeInfo);
          continue;
        }
        
        console.log(`Fetching details for post: ${like.postId}`);
        
        try {
          const postResponse = await axios.get(
            `http://localhost:8080/api/v1/posts/${like.postId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          
          if (postResponse.data && postResponse.data.Status === 200) {
            let postData = postResponse.data.Data;
            
            if (Array.isArray(postResponse.data.Data)) {
              postData = postResponse.data.Data.find(p => p.id === like.postId) || postResponse.data.Data[0];
            }
            
            if (!postData) {
              console.error(`No post data found for ID: ${like.postId}`);
              continue;
            }
            
            newCache[like.postId] = postData;
            
            if (postData.userId && !newUsersCache[postData.userId]) {
              try {
                const userResponse = await axios.get(
                  `http://localhost:8080/api/v1/users/${postData.userId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`
                    }
                  }
                );
                
                if (userResponse.data && userResponse.data.Status === 200) {
                  newUsersCache[postData.userId] = userResponse.data.Data1;
                }
              } catch (userError) {
                console.error(`Error fetching user ${postData.userId}:`, userError);
              }
            }
            
            const userData = newUsersCache[postData.userId];
            const postWithUserData = {
              ...postData,
              likeId: like.id,
              likedAt: like.createdAt,
              isLiked: true,
              user: userData || {
                id: postData.userId,
                username: "user",
                firstName: postData.firstName || "Unknown",
                lastName: postData.lastName || "User"
              }
            };
            
            likedPostsWithDetails.push(postWithUserData);
          } else {
            console.error(`Failed to fetch post ${like.postId}:`, postResponse.data);
          }
        } catch (postError) {
          console.error(`Error fetching post ${like.postId}:`, postError);
        }
      } catch (error) {
        console.error(`Error processing like for post ${like.postId}:`, error);
      }
    }
    
    setPostsCache(newCache);
    setUsersCache(newUsersCache);
    
    return likedPostsWithDetails.sort((a, b) => 
      new Date(b.likedAt || b.createdAt) - new Date(a.likedAt || a.createdAt)
    );
  };

  const loadMoreLikes = () => {
    if (hasMoreLikes && !loading) {
      setPage(prevPage => prevPage + 1);
      fetchUserLikes();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight - 100;
      if (bottom && !loading && hasMoreLikes) {
        loadMoreLikes();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMoreLikes]);

  const preparePostForTripleTCard = (post) => {
    return {
      ...post,
      content: post.caption || post.content || "Liked post",
      likesCount: post.likeCount || post.likesCount || 1,
      commentsCount: post.commentCount || post.commentsCount || 0,
      repostsCount: post.shareCount || post.repostsCount || 0,
      mediaUrls: post.media 
        ? post.media.map(m => m.url?.startsWith('http') ? m.url : `http://localhost:8080/${m.url || ''}`)
        : post.mediaUrls || []
    };
  };

  const handleRetry = () => {
    setError(null);
    setRequestFailed(false);
    setPage(0);
    fetchUserLikes();
  };

  if (error) {
    return (
      <Box p={3} className="text-center">
        <Typography color="error">Error loading likes: {error}</Typography>
        <Button 
          onClick={handleRetry}
          variant="contained" 
          sx={{ mt: 2, bgcolor: '#1d9bf0' }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (requestFailed) {
    return (
      <Box p={3} className="text-center">
        <Typography>Failed to load liked posts. Please try again.</Typography>
        <Button 
          onClick={handleRetry}
          variant="contained" 
          sx={{ mt: 2, bgcolor: '#1d9bf0' }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <div>
      {userLikes.length > 0 ? (
        <div>
          {userLikes.map((post, index) => (
            <React.Fragment key={`like-${post.id}-${index}`}>
              <TripleTCard post={preparePostForTripleTCard(post)} profileUserId={userId} />
            </React.Fragment>
          ))}

          {loading && (
            <Box className="flex justify-center p-4">
              <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
            </Box>
          )}
          
          {!loading && hasMoreLikes && (
            <Box className="flex justify-center p-4">
              <Button 
                variant="outlined" 
                onClick={loadMoreLikes}
                sx={{ color: '#1d9bf0', borderColor: '#1d9bf0' }}
              >
                Load more
              </Button>
            </Box>
          )}
          
          {!hasMoreLikes && userLikes.length > 5 && (
            <Box className="flex justify-center p-4 text-gray-500">
              No more likes to show
            </Box>
          )}
        </div>
      ) : loading ? (
        <Box className="flex justify-center p-8">
          <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
        </Box>
      ) : (
        <div className="px-4 py-8 text-center">
          <h3 className="font-bold text-xl">No likes yet</h3>
          <p className="text-gray-500 mt-1">
            Posts you like will show up here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Likes;