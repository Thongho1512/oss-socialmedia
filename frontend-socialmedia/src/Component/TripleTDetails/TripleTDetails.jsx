import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Avatar,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"; 
import RepeatIcon from "@mui/icons-material/Repeat";
import IosShareIcon from "@mui/icons-material/IosShare";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const TripleTDetails = () => {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeId, setLikeId] = useState(null); // Added state to store the like ID
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  // State variables for comments pagination
  const [commentPage, setCommentPage] = useState(0);
  const [commentSize, setCommentSize] = useState(5);
  const [totalCommentPages, setTotalCommentPages] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  // State variables for comment users
  const [commentUsers, setCommentUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State variable for post user data
  const [postUserData, setPostUserData] = useState(null);

  // State variables for menu and delete dialog
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // New state variables for likes dialog
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [likesUsers, setLikesUsers] = useState({});
  const [loadingLikes, setLoadingLikes] = useState(false);

  // New state variable for deleting comments
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const currentUserId = localStorage.getItem("user_id");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeletePost = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("Access token not found");
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
        alert("Post deleted successfully!");
        navigate(-1);
      } else {
        alert("Failed to delete post. Please try again later.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again later.");
    } finally {
      handleDeleteDialogClose();
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    
    setDeletingCommentId(commentId);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.delete(
        `http://localhost:8080/api/v1/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        // Remove deleted comment from state
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        console.error("Could not delete comment:", response.data);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Check if comment belongs to current user
  const isOwnComment = (userId) => {
    return String(userId) === String(currentUserId);
  };

  // Check if we should show the comment input right away (from URL params)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("comment") === "true") {
      setShowCommentInput(true);
    }
  }, [location]);

  // Fetch post details
  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          throw new Error("Access token not found");
        }

        // Thử truy cập trực tiếp bài viết theo ID trước
        console.log("Fetching post with ID:", postId);

        // Thay đổi cách gọi API để lấy chính xác bài viết theo ID
        const response = await axios
          .get(`http://localhost:8080/api/v1/posts/${postId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .catch(async (err) => {
            // Nếu API trực tiếp không tồn tại, sử dụng phương pháp tìm kiếm
            console.log("Falling back to search API for post ID:", postId);
            return await axios.get(
              `http://localhost:8080/api/v1/posts?keyword=${postId}&size=20`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          });

        if (response.data && response.data.Status === 200) {
          // Handle the different response structure
          let postData = null;

          // Kiểm tra cấu trúc response để tìm bài viết phù hợp
          if (
            response.data.Data &&
            !Array.isArray(response.data.Data) &&
            response.data.Data.id === postId
          ) {
            // Trường hợp API trả về trực tiếp bài viết
            postData = response.data.Data;
          } else if (
            response.data.Data &&
            Array.isArray(response.data.Data.posts)
          ) {
            // Trường hợp API trả về danh sách bài viết
            postData = response.data.Data.posts.find((p) => p.id === postId);
          } else if (response.data.Data && Array.isArray(response.data.Data)) {
            // Trường hợp API trả về mảng trực tiếp
            postData = response.data.Data.find((p) => p.id === postId);
          }

          if (postData) {
            console.log("Found post data:", postData);
            const formattedPost = formatPostData(postData);
            setPost(formattedPost);
            setLiked(postData.isLiked || false);
            setLikesCount(postData.likeCount || 0);
            setLikeId(postData.likeId || null); // Set likeId if available

            // Fetch user info for the post author
            if (postData.userId) {
              fetchPostUser(postData.userId);
            }

            // Fetch comments after getting post details
            fetchComments();
          } else {
            console.error("Không tìm thấy bài viết với ID:", postId);
            setError("Không tìm thấy bài viết");
          }
        } else {
          setError("Không thể tải thông tin bài viết");
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin bài viết:", err);
        setError(`Đã xảy ra lỗi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  // Fetch post author's user info
  const fetchPostUser = async (userId) => {
    try {
      const accessToken = localStorage.getItem("access_token");

      const response = await axios.get(
        `http://localhost:8080/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        console.log("Fetched post user data:", response.data.Data1);
        setPostUserData(response.data.Data1);
      }
    } catch (error) {
      console.error("Error fetching post user data:", error);
    }
  };

  // Format post data to standardize it
  const formatPostData = (postData) => {
    // Thêm log để debug dữ liệu bài viết
    console.log("Formatting post data:", postData);

    return {
      ...postData,
      content: postData.caption || postData.content,
      mediaUrls: postData.media
        ? postData.media
            .map((m) =>
              m.url && m.url.startsWith("http")
                ? m.url
                : `http://localhost:8080/${m.url || ""}`
            )
            .filter((url) => url)
        : postData.mediaUrls || [],
      createdAt: postData.createdAt || new Date().toISOString(),
    };
  };

  // Fetch comments for the post with pagination
  const fetchComments = async (page = 0) => {
    setCommentsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      
      console.log("Fetching comments for post ID:", postId);
      
      // Use the general comments endpoint with a larger size to ensure we get all possible comments
      const response = await axios.get(
        `http://localhost:8080/api/v1/comments?page=${page}&size=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        console.log("Comments API response:", response.data);
        
        // Make sure we have comments and they're in the expected format
        if (!response.data.Data || !response.data.Data.comments || !Array.isArray(response.data.Data.comments)) {
          console.error("Unexpected comments data format:", response.data.Data);
          setComments([]);
          return;
        }
        
        // Filter comments for this specific post by exact string comparison
        const postComments = response.data.Data.comments.filter(comment => {
          const commentPostId = comment.postId || "";
          const currentPostId = postId || "";
          const isMatch = commentPostId === currentPostId;
          
          if (isMatch) {
            console.log("Found matching comment:", comment);
          }
          
          return isMatch;
        });

        console.log(`Found ${postComments.length} comments matching postId ${postId}`);

        // If loading more comments, append to existing list
        if (page > 0) {
          setComments((prevComments) => {
            // Create a Map of existing comments by ID to avoid duplicates
            const existingCommentIds = new Map(prevComments.map(c => [c.id, true]));
            // Filter out any duplicates before adding to the list
            const newComments = postComments.filter(c => !existingCommentIds.has(c.id));
            return [...prevComments, ...newComments];
          });
        } else {
          setComments(postComments);
        }

        // Update pagination info
        const totalPages = response.data.Data.totalPages || 1;
        setTotalCommentPages(totalPages);
        // Only show "load more" if we have more pages and comments were found for this post
        setHasMoreComments(page < totalPages - 1 && postComments.length > 0);
        setCommentPage(page);

        // Fetch user info for each comment
        if (postComments.length > 0) {
          fetchCommentUsers(postComments);
        }
      } else {
        console.error("Failed to fetch comments:", response.data);
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setCommentsLoading(false);
      setLoadingMoreComments(false);
    }
  };

  // Fetch user info for comments
  const fetchCommentUsers = async (comments) => {
    if (!comments || comments.length === 0) return;

    setLoadingUsers(true);
    const accessToken = localStorage.getItem("access_token");
    const userIds = Array.from(new Set(comments.map((comment) => comment.userId)));

    try {
      // Use a local object to accumulate users data
      const usersData = { ...commentUsers };

      // Fetch user data for each comment's userId
      for (const userId of userIds) {
        // Skip if we already have this user's data
        if (usersData[userId]) continue;

        try {
          const response = await axios.get(
            `http://localhost:8080/api/v1/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.data && response.data.Status === 200) {
            usersData[userId] = response.data.Data1;
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      }

      setCommentUsers(usersData);
    } catch (error) {
      console.error("Error fetching comment users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (hasMoreComments && !loadingMoreComments) {
      setLoadingMoreComments(true);
      fetchComments(commentPage + 1);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    try {
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
            postId: postId
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
          setLikeId(response.data.Data.likeId || null); // Set likeId from response
        } else {
          console.error("API like failed:", response.data);
          // Revert UI changes if API call fails
          setLiked(liked);
          setLikesCount(likesCount);
        }
      } else {
        // Unlike post using the specific like ID
        if (!likeId) {
          console.error("Cannot unlike post without likeId");
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
          setLikeId(null); // Clear likeId after successful unlike
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
  
  // Helper function to get like user display name
  const getLikeUserDisplayName = (userId) => {
    const user = likesUsers[userId];
    if (user) {
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || `User ${userId.substring(0, 5)}`;
    }
    return `User ${userId.substring(0, 5)}`;
  };
  
  // Helper function to get like user username
  const getLikeUserUsername = (userId) => {
    const user = likesUsers[userId];
    return user?.username || `user${userId.substring(0, 5)}`;
  };
  
  // Helper function to get like user avatar
  const getLikeUserAvatar = (userId) => {
    const user = likesUsers[userId];
    if (user && user.avatarUrl) {
      return user.avatarUrl.startsWith("http")
        ? user.avatarUrl
        : `http://localhost:8080/${user.avatarUrl}`;
    }
    return "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";
  };
  
  // Handle opening the likes dialog
  const handleShowLikes = () => {
    if (likesCount > 0) {
      fetchPostLikes();
      setLikesDialogOpen(true);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const accessToken = localStorage.getItem("access_token");

      const response = await axios.post(
        `http://localhost:8080/api/v1/comments`,
        {
          postId: postId,
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        setComment("");
        // Refresh comments list
        fetchComments();
      } else {
        console.error("Comment submission failed:", response.data);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle sharing the post
  const handleShare = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        console.error("Access token not found");
        return;
      }

      const response = await axios.post(
        `http://localhost:8080/api/v1/shares`,
        {
          content: "", // Empty content for simple share
          postId: postId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        alert("Đã chia sẻ bài viết thành công!");
      } else {
        alert("Không thể chia sẻ bài viết, vui lòng thử lại sau!");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Không thể chia sẻ bài viết, vui lòng thử lại sau!");
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
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
        return postDate.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      }
    } catch (e) {
      return "recently";
    }
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.error("Image loading error");

    try {
      e.target.onerror = null;
      e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
      e.target.classList.add("image-error");
    } catch (error) {
      console.error("Error handling image failure:", error.message);
    }
  };

  // Navigate to user profile
  const handleNavigateToProfile = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/homepage/profile/${userId}`);
    }
  };

  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  // Helper function to get user display name
  const getUserDisplayName = (userId) => {
    const user = commentUsers[userId];
    if (user) {
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || `User ${userId.substring(0, 5)}`;
    }
    return `User ${userId.substring(0, 5)}`;
  };

  // Helper function to get user username
  const getUserUsername = (userId) => {
    const user = commentUsers[userId];
    return user?.username || `user${userId.substring(0, 5)}`;
  };

  // Helper function to get user avatar
  const getUserAvatar = (userId) => {
    const user = commentUsers[userId];
    if (user && user.avatarUrl) {
      // Kiểm tra và xử lý đường dẫn avatar
      return user.avatarUrl.startsWith("http")
        ? user.avatarUrl
        : `http://localhost:8080/${user.avatarUrl}`;
    }
    return "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";
  };

  // Helper function to get post user display info
  const getPostUserDisplayName = () => {
    if (postUserData) {
      return postUserData.firstName && postUserData.lastName
        ? `${postUserData.firstName} ${postUserData.lastName}`
        : postUserData.username || "User";
    }
    return post?.user?.firstName && post?.user?.lastName
      ? `${post.user.firstName} ${post.user.lastName}`
      : post?.user?.username || post?.userName || "User";
  };

  const getPostUserUsername = () => {
    if (postUserData) {
      return postUserData.username || "user";
    }
    return post?.user?.username || post?.userName || "user";
  };

  const getPostUserAvatar = () => {
    if (postUserData && postUserData.avatarUrl) {
      // Kiểm tra và xử lý đường dẫn avatar
      return postUserData.avatarUrl.startsWith("http")
        ? postUserData.avatarUrl
        : `http://localhost:8080/${postUserData.avatarUrl}`;
    }

    // Nếu không có postUserData, thử lấy từ post.user
    if (post?.user?.avatarUrl) {
      return post.user.avatarUrl.startsWith("http")
        ? post.user.avatarUrl
        : `http://localhost:8080/${post.user.avatarUrl}`;
    }

    return "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";
  };

  if (loading) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[50vh]">
        <CircularProgress size={40} sx={{ color: "#1d9bf0" }} />
        <Typography className="mt-4 text-gray-400">Đang tải bài viết...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[50vh]">
        <Typography variant="h6" className="text-red-500">{error}</Typography>
        <Button
          variant="outlined"
          onClick={handleGoBack}
          className="mt-4"
          sx={{
            color: "#1d9bf0",
            borderColor: "#1d9bf0",
            "&:hover": {
              borderColor: "#1a8cd8",
              backgroundColor: "rgba(29, 155, 240, 0.1)",
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[50vh]">
        <Typography variant="h6" className="text-gray-400">Không tìm thấy bài viết</Typography>
        <Button
          variant="outlined"
          onClick={handleGoBack}
          className="mt-4"
          sx={{
            color: "#1d9bf0",
            borderColor: "#1d9bf0",
            "&:hover": {
              borderColor: "#1a8cd8",
              backgroundColor: "rgba(29, 155, 240, 0.1)",
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm px-4 py-2 border-b border-gray-800 flex items-center">
        <IconButton onClick={handleGoBack} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="ml-4 font-bold text-white">
          Bài viết
        </Typography>
      </div>

      {/* Post content */}
      <div className="flex flex-col px-4 py-4 border-b border-gray-800">
        {/* User info */}
        <div className="flex items-start space-x-3 mb-3">
          <div onClick={(e) => handleNavigateToProfile(e, post.userId || post.user?.id)}>
            <Avatar
              src={getPostUserAvatar()}
              alt={getPostUserUsername()}
              sx={{ width: 48, height: 48 }}
              className="cursor-pointer"
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex items-baseline space-x-1">
              <span
                className="font-bold text-white hover:underline cursor-pointer"
                onClick={(e) => handleNavigateToProfile(e, post.userId || post.user?.id)}
              >
                {getPostUserDisplayName()}
              </span>
              <span className="text-gray-500 text-sm">@{getPostUserUsername()}</span>
            </div>

            {/* Post content */}
            <Typography sx={{ whiteSpace: "pre-line", my: 2, color: "white" }}>
              {post.content}
            </Typography>

            {/* Post media */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <Box className="mt-2 mb-4">
                <div
                  className={`rounded-2xl overflow-hidden ${
                    post.mediaUrls.length > 1 ? "grid grid-cols-2 gap-1" : ""
                  }`}
                >
                  {post.mediaUrls.length === 1 ? (
                    <img
                      src={post.mediaUrls[0]}
                      alt="Post media"
                      className="w-full h-auto max-h-[500px] object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    post.mediaUrls.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`${
                          post.mediaUrls.length === 3 && index === 0 ? "col-span-2" : ""
                        } ${post.mediaUrls.length > 4 && index === 3 ? "relative" : ""}`}
                      >
                        <img
                          src={mediaUrl || ""}
                          alt={`Media ${index + 1}`}
                          className="w-full h-64 object-cover"
                          onError={handleImageError}
                        />
                        {post.mediaUrls.length > 4 && index === 3 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              +{post.mediaUrls.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Box>
            )}

            {/* Post time */}
            <Typography variant="body2" className="text-gray-500 mt-2">
              {new Date(post.createdAt).toLocaleTimeString()} ·{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>

            {/* Post stats */}
            <Box className="flex items-center space-x-5 py-3 mt-2 border-t border-b border-gray-800">
              <Box className="flex items-center">
                <Typography variant="body2" className="text-gray-400">
                  <span className="font-bold text-white">
                    {post.likeCount || likesCount || 0}
                  </span>{" "}
                  Likes
                </Typography>
              </Box>
              <Box className="flex items-center">
                <Typography variant="body2" className="text-gray-400">
                  <span className="font-bold text-white">
                    {post.commentCount || comments.length || 0}
                  </span>{" "}
                  Comments
                </Typography>
              </Box>
              <Box className="flex items-center">
                <Typography variant="body2" className="text-gray-400">
                  <span className="font-bold text-white">{post.shareCount || 0}</span> Shares
                </Typography>
              </Box>
            </Box>

            {/* Action buttons */}
            <div className="flex justify-between mt-3 max-w-md">
              <div className="flex items-center group">
                <IconButton 
                  size="small" 
                  onClick={() => setShowCommentInput(!showCommentInput)}
                  sx={{ 
                    color: showCommentInput ? 'rgb(29, 155, 240)' : 'rgb(113, 118, 123)',
                    '&:hover': { color: 'rgb(29, 155, 240)', bgcolor: 'rgba(29, 155, 240, 0.1)' }
                  }}
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                </IconButton>
                <span className={`text-xs ml-1 ${showCommentInput ? 'text-blue-400' : 'text-gray-500'} group-hover:text-blue-400`}>
                  {post.commentCount || comments.length || 0}
                </span>
              </div>
              
              <div className="flex items-center group">
                <IconButton 
                  size="small" 
                  onClick={handleShare}
                  sx={{ 
                    color: 'rgb(113, 118, 123)',
                    '&:hover': { color: 'rgb(29, 155, 240)', bgcolor: 'rgba(29, 155, 240, 0.1)' }
                  }}
                >
                  <RepeatIcon fontSize="small" />
                </IconButton>
                <span className="text-gray-500 text-xs group-hover:text-blue-400 ml-1">
                  {post.shareCount || 0}
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
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        PaperProps={{
          style: {
            backgroundColor: "rgb(24, 24, 24)",
            color: "white",
          },
        }}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteDialogClose}
            sx={{
              color: "#1d9bf0",
              "&:hover": {
                backgroundColor: "rgba(29, 155, 240, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeletePost}
            sx={{
              color: "red",
              "&:hover": {
                backgroundColor: "rgba(255, 0, 0, 0.1)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Likes dialog */}
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
              <Box 
                key={like.id} 
                className="flex items-center mb-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => navigate(`/homepage/profile/${like.userId}`)}
              >
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

      {/* Comment input */}
      {showCommentInput && (
        <div className="px-4 py-3 border-b border-gray-800">
          <TextField
            fullWidth
            placeholder="Write a comment..."
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: {
                color: "white",
                "& fieldset": {
                  borderColor: "rgb(47, 51, 54)",
                },
                "&:hover fieldset": {
                  borderColor: "rgb(29, 155, 240) !important",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgb(29, 155, 240) !important",
                },
              },
            }}
            sx={{ mb: 2 }}
          />
          <Box className="flex justify-end">
            <Button
              variant="contained"
              disabled={!comment.trim() || submittingComment}
              onClick={handleCommentSubmit}
              sx={{
                borderRadius: "9999px",
                backgroundColor: "rgb(29, 155, 240)",
                "&:hover": {
                  backgroundColor: "rgb(26, 140, 216)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(29, 155, 240, 0.5)",
                  color: "white",
                },
              }}
            >
              {submittingComment ? "Posting..." : "Comment"}
            </Button>
          </Box>
        </div>
      )}

      {/* Comments section */}
      <div className="flex-1">
        <Typography variant="h6" className="px-4 py-3 font-bold text-white">
          Comments ({post.commentCount || comments.length || 0})
        </Typography>

        {commentsLoading && comments.length === 0 ? (
          <Box className="flex justify-center p-4">
            <CircularProgress size={20} sx={{ color: "#1d9bf0" }} />
          </Box>
        ) : comments.length > 0 ? (
          <div>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="px-4 py-3 border-b border-gray-800 hover:bg-gray-900/30"
              >
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={getUserAvatar(comment.userId)}
                    alt={getUserUsername(comment.userId)}
                    sx={{ width: 36, height: 36 }}
                    className="cursor-pointer"
                    onClick={(e) => handleNavigateToProfile(e, comment.userId)}
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline space-x-1">
                      <span
                        className="font-bold text-white hover:underline cursor-pointer"
                        onClick={(e) => handleNavigateToProfile(e, comment.userId)}
                      >
                        {getUserDisplayName(comment.userId)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        @{getUserUsername(comment.userId)}
                      </span>
                      <span className="text-gray-500 text-sm">·</span>
                      <span className="text-gray-500 text-sm">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Typography
                        sx={{ whiteSpace: "pre-line", color: "white", mt: 1, flex: 1 }}
                      >
                        {comment.content}
                      </Typography>
                      
                      {isOwnComment(comment.userId) && (
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: 'rgb(244, 33, 46)',
                            padding: '4px',
                            marginLeft: '4px',
                            marginTop: '2px',
                            '&:hover': { 
                              backgroundColor: 'rgba(244, 33, 46, 0.1)' 
                            },
                          }}
                          disabled={deletingCommentId === comment.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(comment.id);
                          }}
                        >
                          {deletingCommentId === comment.id ? (
                            <CircularProgress size={16} sx={{ color: "#f43f5e" }} />
                          ) : (
                            <DeleteOutlineIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </div>
                </div>
              </div>
            ))}
            {loadingMoreComments && (
              <Box className="flex justify-center p-3">
                <CircularProgress size={20} sx={{ color: "#1d9bf0" }} />
              </Box>
            )}
            {hasMoreComments && !loadingMoreComments && (
              <Box className="flex justify-center p-4">
                <Button
                  variant="outlined"
                  onClick={loadMoreComments}
                  sx={{
                    color: "#1d9bf0",
                    borderColor: "#1d9bf0",
                    "&:hover": {
                      borderColor: "#1a8cd8",
                      backgroundColor: "rgba(29, 155, 240, 0.1)",
                    },
                  }}
                >
                  Load More Comments
                </Button>
              </Box>
            )}
          </div>
        ) : (
          <Box className="flex flex-col items-center justify-center py-10">
            <Typography className="text-gray-500">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
};

export default TripleTDetails;