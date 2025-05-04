import React, { useState, useEffect } from "react";
import { 
  Avatar, 
  Box, 
  Typography, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import IosShareIcon from "@mui/icons-material/IosShare";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Comments from "../Posts/Comments";

const TripleTCard = ({ post, profileUserId }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likeCount || post?.likesCount || 0);
  const [likeId, setLikeId] = useState(post?.likeId || null);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showFullOriginalContent, setShowFullOriginalContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userData, setUserData] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // New state variables for likes dialog
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [likesUsers, setLikesUsers] = useState({});
  const [loadingLikes, setLoadingLikes] = useState(false);
  
  const isMenuOpen = Boolean(menuAnchorEl);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");
        
        if (!accessToken || !userId) return;
        
        // Use the normal user endpoint with the stored user ID instead of /me
        const response = await axios.get(
          `http://localhost:8080/api/v1/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.data && response.data.Status === 200) {
          setCurrentUserId(response.data.Data1?.id || response.data.Data?.id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleDeleteShare = async () => {
    try {
      setDeleteLoading(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const response = await axios.delete(
        `http://localhost:8080/api/v1/shares/${post.shareId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data && response.data.Status === 200) {
        console.log("Xóa chia sẻ thành công:", response.data);
        alert('Đã xóa chia sẻ thành công!');
        setDeleteDialogOpen(false);
        navigate(0); // Refresh the page
      } else {
        console.error("API xóa chia sẻ thất bại:", response.data);
        alert('Không thể xóa chia sẻ, vui lòng thử lại sau!');
      }
    } catch (error) {
      console.error("Lỗi khi gọi API xóa chia sẻ:", error);
      alert('Không thể xóa chia sẻ, vui lòng thử lại sau!');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDeletePost = async () => {
    try {
      setDeleteLoading(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const postId = post.postId || post.id;
      if (!postId) {
        console.error("Không tìm thấy ID bài viết");
        alert('Không thể xóa bài viết, ID không hợp lệ');
        return;
      }
      
      // Kiểm tra xem bài viết có thuộc về người dùng hiện tại không
      const postUserId = post.userId || post.user?.id;
      if (currentUserId && postUserId !== currentUserId) {
        console.error("Bài viết này không thuộc về người dùng hiện tại");
        alert('Bạn không có quyền xóa bài viết này');
        return;
      }
      
      const response = await axios.delete(
        `http://localhost:8080/api/v1/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data && response.data.Status === 200) {
        console.log("Xóa bài viết thành công:", response.data);
        alert('Đã xóa bài viết thành công!');
        setDeletePostDialogOpen(false);
        navigate(0); // Refresh the page
      } else {
        console.error("API xóa bài viết thất bại:", response.data);
        alert('Không thể xóa bài viết, vui lòng thử lại sau!');
      }
    } catch (error) {
      console.error("Lỗi khi gọi API xóa bài viết:", error);
      alert('Không thể xóa bài viết, vui lòng thử lại sau!');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (post?.userId && (!post.user || !post.user.firstName)) {
        try {
          const accessToken = localStorage.getItem("access_token");
          const response = await axios.get(
            `http://localhost:8080/api/v1/users/${post.userId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          
          if (response.data && response.data.Status === 200) {
            console.log(`Fetched user data for post ${post.id}:`, response.data.Data1);
            setUserData(response.data.Data1);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [post]);

  if (!post) return null;

  const userInfo = userData || post.user || {};
  const displayName = (userInfo.firstName && userInfo.lastName) 
    ? `${userInfo.firstName} ${userInfo.lastName}` 
    : userInfo.username || post.userName || "Người dùng";
  
  const username = userInfo.username || post.userName || "user";
  const userId = post.userId || userInfo.id;
  
  // Check if this post is from the current user to use the locally stored avatar
  const isCurrentUserPost = userId === currentUserId;
  const localAvatar = isCurrentUserPost ? localStorage.getItem('user_avatar') : null;
  const avatarUrl = localAvatar || userInfo.avatarUrl || post.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";

  console.log("Post data in TripleTCard:", post);
  console.log("Combined user info:", { userInfo, displayName, username, userId, avatarUrl });

  const handleLike = async (e) => {
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const newLikedState = !liked;
      const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;
      
      // Optimistically update UI
      setLiked(newLikedState);
      setLikesCount(newLikesCount);
      
      if (newLikedState) {
        // Like post using the new API endpoint
        const response = await axios.post(
          'http://localhost:8080/api/v1/likes',
          {
            postId: post.postId || post.id
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.Status === 200) {
          console.log("Like post successful:", response.data);
          setLikeId(response.data.Data?.id || null);
        } else {
          console.error("API like failed:", response.data);
          // Revert UI changes if API call fails
          setLiked(liked);
          setLikesCount(likesCount);
        }
      } else {
        // Unlike post using the like ID
        if (!likeId) {
          console.error("Không tìm thấy ID của lượt thích");
          return;
        }
        
        const response = await axios.delete(
          `http://localhost:8080/api/v1/likes/${likeId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        if (response.data && response.data.Status === 200) {
          console.log("Unlike post successful:", response.data);
          setLikeId(null);
        } else {
          console.error("API unlike failed:", response.data.Message);
          // Revert UI changes if API call fails
          setLiked(liked);
          setLikesCount(likesCount);
        }
      }
    } catch (error) {
      console.error("Error calling like/unlike API:", error);
      // Revert UI changes on error
      setLiked(liked);
      setLikesCount(likesCount);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNavigateToProfile = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/homepage/profile/${userId}`);
    }
  };

  const handlePostClick = () => {
    navigate(`/homepage/triplet/${post.postId || post.id}`);
  };
  
  const handleComment = (e) => {
    e.stopPropagation();
    
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    if (e.altKey || e.metaKey || e.ctrlKey) {
      navigate(`/homepage/triplet/${post.postId || post.id}?comment=true`);
    } else {
      setShowComments(true);
    }
  };
  
  const handleShare = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShareDialogOpen(true);
  };

  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  const handleShareSubmit = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const response = await axios.post(
        `http://localhost:8080/api/v1/shares`,
        {
          content: shareContent,
          postId: post.postId || post.id
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.Status === 200) {
        console.log("Share thành công:", response.data);
        alert('Đã chia sẻ bài viết thành công!');
      } else {
        console.error("API share thất bại:", response.data);
        alert('Không thể chia sẻ bài viết, vui lòng thử lại sau!');
      }
    } catch (error) {
      console.error("Lỗi khi gọi API share:", error);
      alert('Không thể chia sẻ bài viết, vui lòng thử lại sau!');
    } finally {
      setShareDialogOpen(false);
      setShareContent("");
      setIsLoading(false);
    }
  };

  // Function to fetch likes for a post
  const fetchPostLikes = async () => {
    try {
      setLoadingLikes(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const postId = post.postId || post.id;
      
      // Fetch likes using the API
      const response = await axios.get(
        `http://localhost:8080/api/v1/likes?page=0&size=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (response.data && response.data.Status === 200) {
        console.log("Likes list fetched:", response.data);
        // Filter likes for this specific post
        const postLikes = response.data.Data.likes.filter(like => like.postId === postId);
        setLikesList(postLikes);
        
        // Fetch user details for each like
        fetchLikesUsers(postLikes);
      } else {
        console.error("Failed to fetch likes:", response.data);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    } finally {
      setLoadingLikes(false);
    }
  };
  
  // Fetch user details for each like
  const fetchLikesUsers = async (likes) => {
    if (!likes || likes.length === 0) return;
    
    try {
      const accessToken = localStorage.getItem("access_token");
      const userIds = Array.from(new Set(likes.map(like => like.userId)));
      
      // Use a local object to accumulate user data
      const usersData = { ...likesUsers };
      
      // Fetch user data for each like's userId
      for (const userId of userIds) {
        // Skip if we already have this user's data
        if (usersData[userId]) continue;
        
        try {
          const response = await axios.get(
            `http://localhost:8080/api/v1/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          
          if (response.data && response.data.Status === 200) {
            usersData[userId] = response.data.Data1;
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      }
      
      setLikesUsers(usersData);
    } catch (error) {
      console.error("Error fetching like users:", error);
    }
  };
  
  // Helper function to get user display name
  const getLikeUserDisplayName = (userId) => {
    const user = likesUsers[userId];
    if (user) {
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || `User ${userId.substring(0, 5)}`;
    }
    return `User ${userId.substring(0, 5)}`;
  };
  
  // Helper function to get user username
  const getLikeUserUsername = (userId) => {
    const user = likesUsers[userId];
    return user?.username || `user${userId.substring(0, 5)}`;
  };
  
  // Helper function to get user avatar
  const getLikeUserAvatar = (userId) => {
    // Check if this is the current user to use locally stored avatar
    const myUserId = localStorage.getItem("user_id");
    const isCurrentUser = userId === myUserId;
    const localAvatar = isCurrentUser ? localStorage.getItem('user_avatar') : null;
    
    if (localAvatar) {
      return localAvatar;
    }
    
    const user = likesUsers[userId];
    if (user && user.avatarUrl) {
      return user.avatarUrl.startsWith("http")
        ? user.avatarUrl
        : `http://localhost:8080/${user.avatarUrl}`;
    }
    return "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";
  };
  
  // Handle opening the likes dialog
  const handleShowLikes = (e) => {
    e.stopPropagation();
    
    if (likesCount > 0) {
      fetchPostLikes();
      setLikesDialogOpen(true);
    }
  };

  const renderTimeAgo = (timestamp) => {
    try {
      const now = new Date();
      const postDate = new Date(timestamp);
      const diffInSeconds = Math.floor((now - postDate) / 1000);
      
      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m`;
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}h`;
      } else if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)}d`;
      } else {
        return postDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    } catch (e) {
      return "recently";
    }
  };
  
  const MAX_CONTENT_LENGTH = 250;
  const contentIsTruncated = post?.content?.length > MAX_CONTENT_LENGTH;
  const originalContentIsTruncated = post?.originalContent?.length > MAX_CONTENT_LENGTH;

  const hasMedia = post?.mediaUrl || (post?.media && post.media.length > 0) || (post?.mediaUrls && post.mediaUrls.length > 0) || (post?.images && post.images.length > 0);
  
  const getMediaArray = () => {
    if (post?.mediaUrl) return [post.mediaUrl];
    if (post?.media && Array.isArray(post.media)) {
      return post.media.map(m => m.url ? (m.url.startsWith('http') ? m.url : `http://localhost:8080/${m.url}`) : m).filter(Boolean);
    }
    if (post?.mediaUrls && Array.isArray(post.mediaUrls)) return post.mediaUrls;
    if (post?.images && Array.isArray(post.images)) return post.images;
    return [];
  };

  const mediaArray = getMediaArray();
  
  const handleImageError = (e) => {
    console.error("Lỗi tải hình ảnh: Không thể hiển thị hình ảnh");
    
    try {
      e.target.onerror = null; 
      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
      e.target.classList.add('image-error');
    } catch (error) {
      console.error("Lỗi khi xử lý ảnh bị lỗi:", error.message);
    }
  };

  const isSharedPost = post.isShared || post.isSharedContent || post.shareId;

  return (
    <div 
      className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors cursor-pointer px-4 py-3"
      onClick={handlePostClick}
    >
      <div className="flex space-x-3">
        <div onClick={(e) => handleNavigateToProfile(e, userId)}>
          <Avatar 
            src={avatarUrl} 
            alt={username}
            sx={{ width: 40, height: 40 }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1 mb-0.5">
              <span 
                className="font-bold text-white hover:underline"
                onClick={(e) => handleNavigateToProfile(e, userId)}
              >
                {displayName}
              </span>
              <span className="text-gray-500 text-sm">
                @{username}
              </span>
              <span className="text-gray-500 mx-1">·</span>
              <span className="text-gray-500 text-sm hover:underline">
                {renderTimeAgo(post.createdAt)}
              </span>
            </div>
            
            {/* Add the three-dots menu icon here */}
            {(isCurrentUserPost || isSharedPost) && (
              <IconButton
                aria-label="more"
                id={`post-menu-button-${post.id}`}
                aria-controls={isMenuOpen ? 'post-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
                onClick={handleMenuClick}
                sx={{ 
                  padding: '4px',
                  color: 'rgb(113, 118, 123)',
                  '&:hover': { 
                    backgroundColor: 'rgba(29, 155, 240, 0.1)',
                    color: 'rgb(29, 155, 240)'
                  }
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            )}
            
            <Menu
              id="post-menu"
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              PaperProps={{
                sx: {
                  backgroundColor: '#15202b',
                  color: 'white',
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
                  '& .MuiMenuItem-root': {
                    fontSize: '14px',
                    padding: '8px 16px'
                  }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {isSharedPost && (
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose(e);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{
                    color: '#ff4081',
                    '&:hover': { backgroundColor: 'rgba(255, 64, 129, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: '#ff4081' }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Xóa chia sẻ</ListItemText>
                </MenuItem>
              )}
              
              {isCurrentUserPost && !isSharedPost && (
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose(e);
                    setDeletePostDialogOpen(true);
                  }}
                  sx={{
                    color: '#ff4081',
                    '&:hover': { backgroundColor: 'rgba(255, 64, 129, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: '#ff4081' }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Xóa bài viết</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </div>
          
          {post?.content && (
            <Typography sx={{ whiteSpace: 'pre-line', mb: 2, color: 'white' }}>
              {showFullContent || !contentIsTruncated 
                ? post.content
                : `${post.content.slice(0, MAX_CONTENT_LENGTH)}...`}
                
              {contentIsTruncated && (
                <span 
                  className="text-blue-400 hover:text-blue-300 ml-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullContent(!showFullContent);
                  }}
                >
                  {showFullContent ? "Show less" : "Show more"}
                </span>
              )}
            </Typography>
          )}
          
          {isSharedPost && (
            <Paper 
              variant="outlined" 
              className="my-2 overflow-hidden" 
              sx={{ 
                backgroundColor: 'rgba(39, 51, 64, 0.5)', 
                borderColor: 'rgba(66, 83, 100, 0.5)',
                borderRadius: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/homepage/triplet/${post.postId}`);
              }}
            >
              <Box className="p-3">
                {post.originalUser && (
                  <Box className="flex items-center mb-2">
                    <Avatar 
                      src={post.originalUser?.avatarUrl} 
                      alt={post.originalUser?.username || "user"}
                      sx={{ width: 28, height: 28, marginRight: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" className="text-gray-300 font-medium">
                        {post.originalUser?.firstName || ""} {post.originalUser?.lastName || ""}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        @{post.originalUser?.username || "user"}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {post.originalContent && (
                  <Typography sx={{ whiteSpace: 'pre-line', color: 'white', fontSize: '0.95rem', mb: 2 }}>
                    {showFullOriginalContent || !originalContentIsTruncated 
                      ? post.originalContent
                      : `${post.originalContent.slice(0, MAX_CONTENT_LENGTH)}...`}
                      
                    {originalContentIsTruncated && (
                      <span 
                        className="text-blue-400 hover:text-blue-300 ml-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullOriginalContent(!showFullOriginalContent);
                        }}
                      >
                        {showFullOriginalContent ? "Show less" : "Show more"}
                      </span>
                    )}
                  </Typography>
                )}
                
                {mediaArray.length > 0 && (
                  <div className={`rounded-xl overflow-hidden ${mediaArray.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                    {mediaArray.length === 1 ? (
                      <img 
                        src={mediaArray[0]} 
                        alt="Post media" 
                        className="w-full h-auto max-h-[300px] object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      mediaArray.slice(0, 4).map((mediaUrl, index) => (
                        <div 
                          key={index} 
                          className={`${mediaArray.length === 3 && index === 0 ? 'col-span-2' : ''} 
                                    ${mediaArray.length > 4 && index === 3 ? 'relative' : ''}`}
                        >
                          <img 
                            src={mediaUrl || ''} 
                            alt={`Media ${index + 1}`} 
                            className="w-full h-48 object-cover"
                            onError={handleImageError}
                          />
                          {mediaArray.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">+{mediaArray.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Box>
            </Paper>
          )}
          
          {!isSharedPost && mediaArray.length > 0 && (
            <div className={`mt-2 mb-3 rounded-2xl overflow-hidden ${mediaArray.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
              {mediaArray.length === 1 ? (
                <img 
                  src={mediaArray[0]} 
                  alt="Post media" 
                  className="w-full h-auto max-h-[500px] object-cover"
                  onError={handleImageError}
                />
              ) : (
                mediaArray.slice(0, 4).map((mediaUrl, index) => (
                  <div 
                    key={index} 
                    className={`${mediaArray.length === 3 && index === 0 ? 'col-span-2' : ''} 
                                ${mediaArray.length > 4 && index === 3 ? 'relative' : ''}`}
                  >
                    <img 
                      src={mediaUrl || ''} 
                      alt={`Media ${index + 1}`} 
                      className="w-full h-64 object-cover"
                      onError={handleImageError}
                    />
                    {mediaArray.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">+{mediaArray.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-3 max-w-md">
            <div className="flex items-center group">
              <IconButton 
                size="small" 
                onClick={handleComment}
                sx={{ 
                  color: showComments ? 'rgb(29, 155, 240)' : 'rgb(113, 118, 123)',
                  '&:hover': { color: 'rgb(29, 155, 240)', bgcolor: 'rgba(29, 155, 240, 0.1)' }
                }}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              <span className={`text-xs ml-1 ${showComments ? 'text-blue-400' : 'text-gray-500'} group-hover:text-blue-400`}>
                {post.commentsCount || post.commentCount || 0}
              </span>
            </div>
            
            <div className="flex items-center group">
              <IconButton 
                size="small" 
                onClick={handleLike}
                sx={{ 
                  color: liked ? 'rgb(249, 24, 128)' : 'rgb(113, 118, 123)',
                  '&:hover': { color: 'rgb(249, 24, 128)', bgcolor: 'rgba(249, 24, 128, 0.1)' }
                }}
                disabled={isLoading}
              >
                {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
              <span 
                className={`text-xs ml-1 ${liked ? 'text-pink-500' : 'text-gray-500'} group-hover:text-pink-500 cursor-pointer`}
                onClick={handleShowLikes}
              >
                {likesCount}
              </span>
            </div>
            
            <div>
              <IconButton 
                size="small" 
                onClick={handleShare}
                sx={{ 
                  color: 'rgb(113, 118, 123)',
                  '&:hover': { color: 'rgb(29, 155, 240)', bgcolor: 'rgba(29, 155, 240, 0.1)' }
                }}
              >
                <IosShareIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
          
          <Collapse in={showComments} timeout="auto" unmountOnExit>
            <Box 
              className="mt-3 pt-2 border-t border-gray-800" 
              onClick={(e) => e.stopPropagation()}
            >
              <Comments postId={post.postId || post.id} inFeed={true} maxComments={3} />
            </Box>
          </Collapse>
        </div>
      </div>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle onClick={handleDialogClick}>
          Chia sẻ bài viết
          <IconButton
            aria-label="close"
            onClick={() => setShareDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent onClick={handleDialogClick}>
          <TextField
            autoFocus
            margin="dense"
            id="shareContent"
            label="Viết suy nghĩ của bạn về bài viết này..."
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
          />
          
          <Paper variant="outlined" className="mt-3 px-3 py-2" sx={{ backgroundColor: 'rgba(39, 51, 64, 0.5)' }}>
            <Box className="flex items-center mb-2">
              <Avatar 
                src={post.user?.avatarUrl} 
                alt={post.user?.username || "user"}
                sx={{ width: 24, height: 24, marginRight: 1 }}
              />
              <Typography variant="body2" className="text-gray-300">
                {post.user?.firstName || ""} {post.user?.lastName || ""}
              </Typography>
            </Box>
            
            <Typography variant="body2" className="text-gray-400 line-clamp-2">
              {post.content || post.originalContent || ""}
            </Typography>
            
            {mediaArray.length > 0 && (
              <Box className="mt-2 h-16 w-16 overflow-hidden rounded">
                <img 
                  src={mediaArray[0]} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />
              </Box>
            )}
          </Paper>
        </DialogContent>
        <DialogActions onClick={handleDialogClick}>
          <Button onClick={() => setShareDialogOpen(false)} color="secondary" disabled={isLoading}>
            Hủy
          </Button>
          <Button 
            onClick={handleShareSubmit} 
            color="primary" 
            variant="contained" 
            disabled={isLoading}
            sx={{ bgcolor: 'rgb(29, 155, 240)' }}
          >
            {isLoading ? 'Đang chia sẻ...' : 'Chia sẻ'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: '8px',
            backgroundColor: 'white',
            color: 'black',
            width: '280px',
            maxWidth: '90vw'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
          Xóa chia sẻ
        </DialogTitle>
        <DialogContent sx={{ pb: 2, color: 'black' }}>
          <Typography sx={{ fontSize: '15px' }}>
            Bạn có chắc chắn muốn xóa chia sẻ này?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ color: 'black', fontWeight: 'bold', textTransform: 'none' }}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteShare} 
            sx={{ 
              bgcolor: '#FF1493', 
              color: 'white', 
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': { bgcolor: '#ff4081' }
            }}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deletePostDialogOpen} 
        onClose={() => setDeletePostDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: '8px',
            backgroundColor: 'white',
            color: 'black',
            width: '280px',
            maxWidth: '90vw'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
          Xóa bài viết
        </DialogTitle>
        <DialogContent sx={{ pb: 2, color: 'black' }}>
          <Typography sx={{ fontSize: '15px' }}>
            Bạn có chắc chắn muốn xóa bài viết này?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setDeletePostDialogOpen(false)} 
            sx={{ color: 'black', fontWeight: 'bold', textTransform: 'none' }}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePost} 
            sx={{ 
              bgcolor: '#FF1493', 
              color: 'white', 
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': { bgcolor: '#ff4081' }
            }}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={likesDialogOpen} 
        onClose={() => setLikesDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: '8px',
            backgroundColor: 'white',
            color: 'black',
            width: '320px',
            maxWidth: '90vw'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
          Danh sách lượt thích
        </DialogTitle>
        <DialogContent sx={{ pb: 2, color: 'black' }}>
          {loadingLikes ? (
            <Typography sx={{ fontSize: '15px', textAlign: 'center' }}>
              Đang tải...
            </Typography>
          ) : likesList.length > 0 ? (
            likesList.map((like) => (
              <Box key={like.id} className="flex items-center mb-2">
                <Avatar 
                  src={getLikeUserAvatar(like.userId)} 
                  alt={getLikeUserUsername(like.userId)}
                  sx={{ width: 32, height: 32, marginRight: 1 }}
                />
                <Box>
                  <Typography variant="subtitle2" className="text-gray-800 font-medium">
                    {getLikeUserDisplayName(like.userId)}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    @{getLikeUserUsername(like.userId)}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography sx={{ fontSize: '15px', textAlign: 'center' }}>
              Không có lượt thích nào.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'center', p: 1, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setLikesDialogOpen(false)} 
            sx={{ color: 'black', fontWeight: 'bold', textTransform: 'none' }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TripleTCard;
