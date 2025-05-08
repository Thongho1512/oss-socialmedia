import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
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
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const TripleTDetails = () => {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use UserContext
  const { isPostLiked, getPostLikeId, addLike, removeLike, fetchUserLikes } = useContext(UserContext);
  
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

  // Add new state for share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [selectedEditImage, setSelectedEditImage] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMedia, setRemovedMedia] = useState([]);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleEditDialogOpen = () => {
    setEditedCaption(post.content || "");
    setExistingMedia(post.mediaUrls || []);
    setRemovedMedia([]);
    setEditDialogOpen(true);
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

  // Update like state from UserContext when postId changes or on initial load
  useEffect(() => {
    if (postId) {
      const isLiked = isPostLiked(postId);
      const currentLikeId = getPostLikeId(postId);
      
      setLiked(isLiked);
      setLikeId(currentLikeId);
      
      console.log(`Post ${postId} like status from UserContext:`, { isLiked, currentLikeId });
    }
  }, [postId, isPostLiked, getPostLikeId]);

  // Fetch post details
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("access_token");
        
        if (!accessToken) {
          console.error("Không tìm thấy access token");
          setError("Không tìm thấy access token, vui lòng đăng nhập lại");
          return;
        }

        // Sử dụng endpoint chính của API để lấy tất cả bài viết
        const response = await axios.get(
          `http://localhost:8080/api/v1/posts?page=0&size=50`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data && response.data.Status === 200) {
          // Lấy dữ liệu bài viết từ các vị trí khác nhau tùy theo cấu trúc API trả về
          let allPosts = [];
          
          if (response.data.Data && response.data.Data.posts) {
            allPosts = response.data.Data.posts;
          } else if (Array.isArray(response.data.Data)) {
            allPosts = response.data.Data;
          } else if (response.data.Data && response.data.Data.content) {
            allPosts = response.data.Data.content;
          }
          
          // Tìm bài viết phù hợp với ID
          const targetPost = allPosts.find(p => p.id === postId);
          
          if (targetPost) {
            const postData = formatPostData(targetPost);
            setPost(postData);
            setLikesCount(postData.likeCount || postData.likesCount || 0);
            
            // Set initial values for edit form
            setEditedCaption(postData.content || "");
            setExistingMedia(postData.mediaUrls || []);
            
            // Check like status from UserContext instead of making a separate API call
            const isLiked = isPostLiked(postId);
            const currentLikeId = getPostLikeId(postId);
            
            setLiked(isLiked);
            setLikeId(currentLikeId);
            
            // Fetch post author's data
            if (postData.userId) {
              fetchPostUser(postData.userId);
            }
            
            // Fetch comments for this post
            fetchComments();
          } else {
            // Thử dùng API homepage để tìm bài viết nếu không tìm thấy từ API posts
            try {
              const homepageResponse = await axios.get(
                `http://localhost:8080/api/v1/homepage`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              
              if (homepageResponse.data && homepageResponse.data.Status === 200) {
                const homepagePosts = Array.isArray(homepageResponse.data.Data) ? 
                  homepageResponse.data.Data : [];
                  
                const targetHomepagePost = homepagePosts.find(p => p.id === postId);
                
                if (targetHomepagePost) {
                  const postData = formatPostData(targetHomepagePost);
                  setPost(postData);
                  setLikesCount(postData.likeCount || postData.likesCount || 0);
                  
                  // Kiểm tra lại trạng thái like từ UserContext
                  const isLiked = isPostLiked(postId);
                  const currentLikeId = getPostLikeId(postId);
                  
                  setLiked(isLiked);
                  setLikeId(currentLikeId);
                  
                  // Fetch post author's data
                  if (postData.userId) {
                    fetchPostUser(postData.userId);
                  }
                  
                  // Fetch comments for this post
                  fetchComments();
                } else {
                  console.error("Không tìm thấy bài viết với ID:", postId);
                  setError("Không tìm thấy bài viết");
                }
              }
            } catch (homepageError) {
              console.error("Lỗi khi tải từ API homepage:", homepageError);
              setError("Không tìm thấy bài viết");
            }
          }
        } else {
          console.error("Error fetching post details:", response.data);
          setError("Could not load post details");
        }
      } catch (err) {
        console.error("Error loading post:", err);
        setError("An error occurred while loading the post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId, isPostLiked, getPostLikeId]);

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

  // Handle like/unlike with UserContext
  const handleLike = async () => {
    try {
      const newLikedState = !liked;
      const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;

      // Optimistically update UI
      setLiked(newLikedState);
      setLikesCount(newLikesCount);
      
      if (newLikedState) {
        // Use addLike from UserContext
        const newLike = await addLike(postId);
        if (newLike) {
          console.log("Like added successfully using UserContext:", newLike);
          // Make sure we store the proper ID format
          setLikeId(newLike.likeId || newLike.id);
        } else {
          // Revert UI changes if API call fails
          console.error("Failed to add like");
          setLiked(liked);
          setLikesCount(likesCount);
        }
      } else {
        try {
          // First check if we have a valid likeId, if not try to get it again
          let currentLikeId = likeId || getPostLikeId(postId);
          
          if (!currentLikeId) {
            console.error("Cannot remove like: No valid like ID available for post", postId);
            setLiked(liked);
            setLikesCount(likesCount);
            return;
          }
          
          // Check if it's a temporary ID and handle appropriately
          if (currentLikeId.startsWith('temp-')) {
            console.warn("Detected temporary like ID. Will refresh likes and try again.");
            // Refresh likes to get the actual like ID from the server
            await fetchUserLikes(true);
            // Try to get the real like ID again after refresh
            currentLikeId = getPostLikeId(postId);
            
            if (!currentLikeId || currentLikeId.startsWith('temp-')) {
              console.error("Still have invalid like ID after refresh:", currentLikeId);
              setLiked(liked);
              setLikesCount(likesCount);
              return;
            }
          }
          
          // Now use removeLike with the confirmed likeId and the postId
          const success = await removeLike(currentLikeId, postId);
          if (success) {
            console.log("Like removed successfully using UserContext");
            setLikeId(null);
          } else {
            // Revert UI changes if API call fails
            console.error("Failed to remove like");
            setLiked(liked);
            setLikesCount(likesCount);
          }
        } catch (error) {
          // Handle specific 404 errors gracefully - the like may already be deleted
          if (error.response && error.response.status === 404) {
            console.warn("Like was already removed from server (404 error). Updating local state.");
            setLikeId(null);
            // Keep the optimistic UI update since the end result is correct
          } else {
            console.error("Error removing like:", error);
            // Revert UI changes on other errors
            setLiked(liked);
            setLikesCount(likesCount);
          }
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
  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    setShareDialogOpen(true);
  };
  
  // Handle dialog click
  const handleDialogClick = (e) => {
    if (e) e.stopPropagation();
  };
  
  // Handle share submit
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

  // Add function to handle image selection for editing
  const handleSelectEditImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedEditImage(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Add function to handle existing media removal
  const handleRemoveExistingMedia = (urlToRemove) => {
    setExistingMedia(prev => prev.filter(url => url !== urlToRemove));
    setRemovedMedia(prev => [...prev, urlToRemove]);
  };

  // Add function to clear selected new image
  const handleClearNewImage = () => {
    setSelectedEditImage(null);
    setEditPreviewUrl("");
  };

  // Add function to submit edited post
  const handleSubmitEdit = async () => {
    try {
      setSubmittingEdit(true);
      const accessToken = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      
      if (!accessToken || !userId) {
        console.error("Không tìm thấy accessToken hoặc userId");
        return;
      }

      const formData = new FormData();
      formData.append("id", postId);
      formData.append("userId", post.userId);
      formData.append("caption", editedCaption);
      formData.append("likeCount", post.likeCount || 0);
      formData.append("commentCount", post.commentCount || 0);
      formData.append("shareCount", post.shareCount || 0);
      formData.append("privacy", true);
      formData.append("createdAt", post.createdAt);

      if (selectedEditImage) {
        formData.append("media", selectedEditImage);
      }

      // Keep any existing media that wasn't removed
      existingMedia.forEach((mediaUrl) => {
        // Extract only the filename part if it's a URL
        const mediaPath = mediaUrl.startsWith('http://localhost:8080/') 
          ? mediaUrl.substring('http://localhost:8080/'.length) 
          : mediaUrl;
        
        formData.append("media", mediaPath);
      });
      
      const response = await axios.put(
        "http://localhost:8080/api/v1/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        // Update the post content locally
        setPost({
          ...post,
          content: editedCaption,
          mediaUrls: [...existingMedia, editPreviewUrl].filter(url => url),
        });
        
        // Close the dialog
        setEditDialogOpen(false);
        
        // Reset the form
        setSelectedEditImage(null);
        setEditPreviewUrl("");
        
        // Show success message
        alert("Bài viết đã được cập nhật thành công!");
        
        // Refresh the post data
        window.location.reload();
      } else {
        console.error("API cập nhật bài viết thất bại:", response.data);
        alert("Không thể cập nhật bài viết, vui lòng thử lại sau!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      alert("Không thể cập nhật bài viết, vui lòng thử lại sau!");
    } finally {
      setSubmittingEdit(false);
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
      // Use a local image from the public folder instead of external placeholder
      const fallbackImageUrl = `${process.env.PUBLIC_URL || ""}/logo192.png`;
      e.target.src = fallbackImageUrl;
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

  // Hàm kiểm tra xem URL có phải là video hay không
  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
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
            <div className="flex items-baseline space-x-1 justify-between">
              <div className="flex items-baseline space-x-1">
                <span
                  className="font-bold text-white hover:underline cursor-pointer"
                  onClick={(e) => handleNavigateToProfile(e, post.userId || post.user?.id)}
                >
                  {getPostUserDisplayName()}
                </span>
                <span className="text-gray-500 text-sm">@{getPostUserUsername()}</span>
              </div>
              
              {/* Add the three-dots menu icon */}
              <IconButton
                aria-label="more"
                id="post-menu-button"
                aria-controls="post-menu"
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                onClick={handleMenuOpen}
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
              
              {/* Menu for the three dots icon */}
              <Menu
                id="post-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
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
                {String(post?.userId) === String(currentUserId) && (
                  <>
                    <MenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDialogOpen();
                      }}
                      sx={{
                        color: 'rgb(29, 155, 240)',
                        '&:hover': { backgroundColor: 'rgba(29, 155, 240, 0.1)' }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'rgb(29, 155, 240)' }}>
                        <EditIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sửa bài viết</ListItemText>
                    </MenuItem>
                    <MenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClose(e);
                        handleDeleteDialogOpen();
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
                  </>
                )}
              </Menu>
            </div>

            {/* Post content */}
            <Typography sx={{ whiteSpace: "pre-line", my: 2, color: "white" }}>
              {post.content}
            </Typography>

            {/* Post media */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <Box className="mt-2 mb-4">
                {post.mediaUrls.length === 1 ? (
                  // Single media display (full width)
                  <div className="relative w-full rounded-md overflow-hidden">
                    {isVideoUrl(post.mediaUrls[0]) ? (
                      <video
                        src={post.mediaUrls[0]}
                        controls
                        controlsList="nodownload"
                        className="w-full h-auto max-h-[600px] object-contain rounded-md"
                        poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                      />
                    ) : (
                      <img
                        src={post.mediaUrls[0]}
                        alt="Post media"
                        className="w-full h-auto max-h-[600px] object-contain rounded-md"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                ) : (
                  // Multiple media gallery - Show all media in details view
                  <div className="flex flex-col space-y-2">
                    {post.mediaUrls.map((mediaUrl, index) => (
                      <div
                        key={index}
                        className="relative w-full rounded-md overflow-hidden"
                      >
                        {isVideoUrl(mediaUrl) ? (
                          <video
                            src={mediaUrl}
                            controls
                            controlsList="nodownload"
                            className="w-full h-auto max-h-[500px] object-contain rounded-md"
                            poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                          />
                        ) : (
                          <img
                            src={mediaUrl || ""}
                            alt={`Media ${index + 1}`}
                            className="w-full h-auto max-h-[500px] object-contain rounded-md"
                            onError={handleImageError}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Box>
            )}

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
                  <IosShareIcon fontSize="small" />
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

      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: '12px',
            backgroundColor: '#15202b',
            color: 'white'
          }
        }}
      >
        <DialogTitle onClick={handleDialogClick} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Chia sẻ bài viết
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setShareDialogOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent onClick={handleDialogClick} sx={{ pt: 3 }}>
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
            InputProps={{
              style: { color: 'white' }
            }}
            InputLabelProps={{
              style: { color: 'rgba(255,255,255,0.7)' }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(29, 155, 240)',
                }
              }
            }}
          />
          
          <Paper 
            variant="outlined" 
            className="mt-4 overflow-hidden" 
            sx={{ 
              backgroundColor: 'rgba(39, 51, 64, 0.7)', 
              borderColor: 'rgba(66, 83, 100, 0.7)',
              borderRadius: '12px'
            }}
          >
            <Box className="p-4">
              <Box className="flex items-center mb-3">
                <Avatar 
                  src={getPostUserAvatar()} 
                  alt={getPostUserUsername()}
                  sx={{ width: 42, height: 42, marginRight: 1.5 }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: '500' }}>
                    {getPostUserDisplayName()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    @{getPostUserUsername()}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, whiteSpace: 'pre-line' }}>
                {(post.content || "").length > 150 
                  ? `${(post.content || "").substring(0, 150)}...`
                  : (post.content || "")}
              </Typography>
              
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <Box 
                  className="overflow-hidden rounded-lg" 
                  sx={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxHeight: 200,
                    mb: 1 
                  }}
                >
                  {isVideoUrl(post.mediaUrls[0]) ? (
                    <div className="relative">
                      <video 
                        src={post.mediaUrls[0]}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: '8px' }}
                        poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircleOutlineIcon className="text-white text-4xl opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      style={{ borderRadius: '8px' }}
                    />
                  )}
                </Box>
              )}
              
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 1 }}>
                {formatTimeAgo(post.createdAt)}
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions onClick={handleDialogClick} sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button 
            onClick={() => setShareDialogOpen(false)} 
            sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } 
            }}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleShareSubmit} 
            variant="contained" 
            disabled={isLoading}
            sx={{ 
              bgcolor: 'rgb(29, 155, 240)', 
              '&:hover': { bgcolor: 'rgb(26, 140, 216)' },
              fontWeight: 'bold',
              px: 3
            }}
          >
            {isLoading ? 'Đang chia sẻ...' : 'Chia sẻ'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Edit Post Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: '12px',
            backgroundColor: '#15202b',
            color: 'white'
          }
        }}
      >
        <DialogTitle onClick={handleDialogClick} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Sửa bài viết
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setEditDialogOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent onClick={handleDialogClick} sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            id="editCaption"
            label="Nội dung bài viết"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            InputProps={{
              style: { color: 'white' }
            }}
            InputLabelProps={{
              style: { color: 'rgba(255,255,255,0.7)' }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(29, 155, 240)',
                }
              }
            }}
          />
          
          {/* Existing Media Section */}
          {existingMedia.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Ảnh hiện tại:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {existingMedia.map((mediaUrl, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      position: 'relative', 
                      width: 100, 
                      height: 100, 
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={mediaUrl} 
                      alt={`Existing media ${index}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        padding: '4px',
                        '&:hover': { backgroundColor: 'rgba(255,0,0,0.5)' }
                      }}
                      onClick={() => handleRemoveExistingMedia(mediaUrl)}
                    >
                      <HighlightOffIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          
          {/* New Image Preview */}
          {editPreviewUrl && (
            <Box sx={{ mt: 2, position: 'relative', maxWidth: 300 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Ảnh mới:
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <img 
                  src={editPreviewUrl} 
                  alt="New media preview" 
                  style={{ width: '100%', borderRadius: '8px' }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '4px',
                    '&:hover': { backgroundColor: 'rgba(255,0,0,0.5)' }
                  }}
                  onClick={handleClearNewImage}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
          
          {/* Upload New Image Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <label className="flex items-center space-x-2 rounded-md cursor-pointer">
              <Button
                startIcon={<ImageIcon />}
                sx={{
                  color: '#1d9bf0',
                  borderColor: '#1d9bf0',
                  borderRadius: '20px',
                  '&:hover': { backgroundColor: 'rgba(29, 155, 240, 0.1)' },
                  textTransform: 'none'
                }}
                variant="outlined"
                component="span"
              >
                {editPreviewUrl ? 'Chọn ảnh khác' : 'Thêm ảnh mới'}
              </Button>
              <input
                type="file"
                name="editImageFile"
                className="hidden"
                accept="image/*"
                onChange={handleSelectEditImage}
              />
            </label>
          </Box>
        </DialogContent>
        <DialogActions onClick={handleDialogClick} sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } 
            }}
            disabled={submittingEdit}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmitEdit} 
            variant="contained" 
            disabled={submittingEdit}
            sx={{ 
              bgcolor: 'rgb(29, 155, 240)', 
              '&:hover': { bgcolor: 'rgb(26, 140, 216)' },
              fontWeight: 'bold',
              px: 3
            }}
          >
            {submittingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
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