import React, { useState, useEffect, useContext } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ImageIcon from "@mui/icons-material/Image";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Comments from "../Posts/Comments";
import { formatAvatarUrl } from "../../utils/formatUrl";
import { UserContext } from "../Context/UserContext";
import ShareEditDialog from "../Posts/ShareEditDialog";

const TripleTCard = ({ post, profileUserId }) => {
  const navigate = useNavigate();
  
  const { isPostLiked, getPostLikeId, addLike, removeLike, fetchUserLikes } = useContext(UserContext);
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likeCount || post?.likesCount || 0);
  const [likeId, setLikeId] = useState(null);
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
  const [formattedTimeAgo, setFormattedTimeAgo] = useState("recently");
    const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [likesUsers, setLikesUsers] = useState({});
  const [loadingLikes, setLoadingLikes] = useState(false);
  
  const [postOwnerData, setPostOwnerData] = useState(null);
  
  const [shareEditDialogOpen, setShareEditDialogOpen] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [selectedEditImage, setSelectedEditImage] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMedia, setRemovedMedia] = useState([]);

  // Create video refs at the top level
  const videoRefs = React.useRef({});

  const isMenuOpen = Boolean(menuAnchorEl);
  
  useEffect(() => {
    const postId = post?.id || post?.postId;
    if (postId) {
      const isLiked = isPostLiked(postId);
      const currentLikeId = getPostLikeId(postId);
      
      setLiked(isLiked);
      setLikeId(currentLikeId);
      
      console.log(`Post ${postId} like status from UserContext:`, { isLiked, currentLikeId });
    }
  }, [post, isPostLiked, getPostLikeId]);
  
  useEffect(() => {
    if (post?.createdAt) {
      const formattedTime = renderTimeAgo(post.createdAt);
      setFormattedTimeAgo(formattedTime);
    }
  }, [post?.createdAt]);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");
        
        if (!accessToken || !userId) return;
        
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
  const handleShareUpdate = (updatedShare) => {
    console.log("Share updated:", updatedShare);
    // Update the post in the UI with the new share content
    if (updatedShare && updatedShare.id) {
      // Update share content in the current post
      post.shareContent = updatedShare.content;
      post.content = updatedShare.content;
      
      // Force re-render
      const newContent = updatedShare.content;
      setShareContent(newContent);
      
      // Show success notification
      alert("Đã cập nhật chia sẻ thành công!");
    }
  };
    const handleEditShare = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setShareEditDialogOpen(true);
    handleMenuClose(e);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleEditDialogOpen = (e) => {
    if (e) e.stopPropagation();
    setEditedCaption(post.content || post.caption || "");
    setExistingMedia(getMediaArray() || []);
    setRemovedMedia([]);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSubmitEdit = async () => {
    try {
      setSubmittingEdit(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }

      const postId = post.id || post.postId;
      
      if (!postId) {
        console.error("Không tìm thấy ID bài viết");
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
      
      // Keep original creation date
      if (post.createdAt) {
        formData.append("createdAt", post.createdAt);
      }

      // Add new media file if selected
      if (selectedEditImage) {
        formData.append("media", selectedEditImage);
      }

      // Handle existing media properly
      if (existingMedia && existingMedia.length > 0) {
        // Create a JSON array of existing media paths to keep
        const mediaUrls = existingMedia.map(url => {
          // Keep only the path part after the hostname if it's a full URL
          if (url.includes('localhost:8080')) {
            return url.split('localhost:8080/')[1];
          }
          return url;
        });
        
        // Append existing media URLs as a JSON string to preserve them
        formData.append("existingMedia", JSON.stringify(mediaUrls));
      }
      
      console.log("FormData being sent for update:", {
        id: postId,
        userId: post.userId,
        caption: editedCaption,
        newMediaAdded: !!selectedEditImage,
        existingMediaCount: existingMedia.length
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
      );      if (response.data && response.data.Status === 200) {
        alert("Post has been updated successfully!");
        setEditDialogOpen(false);
        
        setSelectedEditImage(null);
        setEditPreviewUrl("");
        
        window.location.reload();      } else {
        console.error("API post update failed:", response.data);
        alert("Could not update the post, please try again later!");
      }    } catch (error) {
      console.error("Error updating post:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      alert("Could not update the post, please try again later!");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleSelectEditImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedEditImage(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectEditMedia = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedEditImage(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveExistingMedia = (urlToRemove) => {
    setExistingMedia(prev => prev.filter(url => url !== urlToRemove));
    setRemovedMedia(prev => [...prev, urlToRemove]);
  };

  const handleClearNewImage = () => {
    setSelectedEditImage(null);
    setEditPreviewUrl("");
  };
  const handleDeleteShare = async () => {
    try {
      setDeleteLoading(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Access token not found");
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
        navigate(0);
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
        navigate(0);
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

  const fetchPostOwnerData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const userId = post.userId || post.user?.id;
        if (!userId || !accessToken) {
        console.error("Not enough information to load post owner data");
        return;
      }
      
      const response = await axios.get(
        `http://localhost:8080/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data && response.data.Status === 200) {
        console.log(`Fetched post owner data for share dialog:`, response.data.Data1);
        setPostOwnerData(response.data.Data1);
      }
    } catch (error) {
      console.error("Error fetching post owner data for share dialog:", error);
    }
  };

  if (!post) return null;

  const userInfo = userData || post.user || {};
  const displayName = (userInfo.firstName && userInfo.lastName)    ? `${userInfo.firstName} ${userInfo.lastName}` 
    : userInfo.username || post.userName || "User";
  
  const username = userInfo.username || post.userName || "user";
  const userId = post.userId || userInfo.id;
  
  const isCurrentUserPost = userId === currentUserId;
  const localAvatar = isCurrentUserPost ? localStorage.getItem('user_avatar') : null;
  const avatarUrl = formatAvatarUrl(localAvatar || userInfo.avatarUrl || post.avatarUrl);

  console.log("Post data in TripleTCard:", post);
  console.log("Combined user info:", { userInfo, displayName, username, userId, avatarUrl });

  const handleLike = async (e) => {
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      const postId = post.postId || post.id;
      
      if (!postId) {
        console.error("Cannot like: Invalid post ID");
        return;
      }
      
      const newLikedState = !liked;
      const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;
      
      setLiked(newLikedState);
      setLikesCount(newLikesCount);
      
      if (newLikedState) {
        try {
          const newLike = await addLike(postId);
          
          if (newLike) {
            console.log("Like added successfully:", newLike);
            const newLikeId = newLike.likeId || newLike.id;
            setLikeId(newLikeId);
            
            setTimeout(() => fetchUserLikes(true), 500);
          } else {
            console.error("Failed to add like - API returned no data");
          }
        } catch (likeError) {
          console.error("Error in addLike:", likeError);
          setLiked(liked);
          setLikesCount(likesCount);
        }
      } else {
        if (!likeId) {
          console.error("Cannot remove like: No like ID available");
          const currentLikeId = getPostLikeId(postId);
          if (!currentLikeId) {
            console.error("Still cannot find like ID, reverting UI");
            setLiked(liked);
            setLikesCount(likesCount);
            return;
          }
          setLikeId(currentLikeId);
        }
        
        try {
          const success = await removeLike(likeId || getPostLikeId(postId), postId);
          
          if (success) {
            console.log("Like removed successfully");
            setLikeId(null);
            
            setTimeout(() => fetchUserLikes(true), 500);
          } else {
            console.error("Failed to remove like - API returned failure");
            setLiked(liked);
            setLikesCount(likesCount);
          }
        } catch (unlikeError) {
          console.error("Error in removeLike:", unlikeError);
          setLiked(liked);
          setLikesCount(likesCount);
        }
      }
    } catch (error) {
      console.error("General error in like handling:", error);
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

    if (!postOwnerData) {
      fetchPostOwnerData();
    }
    
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

  const fetchPostLikes = async () => {
    try {
      setLoadingLikes(true);
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const postId = post.postId || post.id;
      
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
        const postLikes = response.data.Data.likes.filter(like => like.postId === postId);
        setLikesList(postLikes);
        
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
  
  const fetchLikesUsers = async (likes) => {
    if (!likes || likes.length === 0) return;
    
    try {
      const accessToken = localStorage.getItem("access_token");
      const userIds = Array.from(new Set(likes.map(like => like.userId)));
      
      const usersData = { ...likesUsers };
      
      for (const userId of userIds) {
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
  
  const getLikeUserDisplayName = (userId) => {
    const user = likesUsers[userId];
    if (user) {
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || `User ${userId.substring(0, 5)}`;
    }
    return `User ${userId.substring(0, 5)}`;
  };
  
  const getLikeUserUsername = (userId) => {
    const user = likesUsers[userId];
    return user?.username || `user${userId.substring(0, 5)}`;
  };
  
  const getLikeUserAvatar = (userId) => {
    const myUserId = localStorage.getItem("user_id");
    const isCurrentUser = userId === myUserId;
    const localAvatar = isCurrentUser ? localStorage.getItem('user_avatar') : null;
    
    if (localAvatar) {
      return localAvatar;
    }
    
    const user = likesUsers[userId];
    if (user && user.avatarUrl) {
      return formatAvatarUrl(user.avatarUrl);
    }
    return "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg";
  };
  
  const handleShowLikes = (e) => {
    e.stopPropagation();
    
    if (likesCount > 0) {
      fetchPostLikes();
      setLikesDialogOpen(true);
    }
  };

  const renderTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return "recently";
      
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
      console.error("Error formatting time:", e);
      if (timestamp) {
        try {
          return new Date(timestamp).toLocaleDateString();
        } catch {
          return "unknown time";
        }
      }
      return "recently";
    }
  };
  
  const MAX_CONTENT_LENGTH = 250;
  const contentIsTruncated = post?.content?.length > MAX_CONTENT_LENGTH;
  const originalContentIsTruncated = post?.originalContent?.length > MAX_CONTENT_LENGTH;

  const hasMedia = post?.mediaUrl || (post?.media && post.media.length > 0) || (post?.mediaUrls && post.mediaUrls.length > 0) || (post?.images && post.images.length > 0);
  
  const getMediaArray = () => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'];
    
    const isVideoUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };
    
    if (post?.mediaUrl) {
      return [{ 
        url: post.mediaUrl, 
        type: isVideoUrl(post.mediaUrl) ? "video" : "image" 
      }];
    }
    
    if (post?.media && Array.isArray(post.media)) {
      return post.media
        .map((m) => {
          if (!m) return null;
          
          // Xử lý nếu m là string
          if (typeof m === 'string') {
            const url = m.startsWith("http") ? m : `http://localhost:8080/${m}`;
            const type = isVideoUrl(m) ? "video" : "image";
            return { url, type };
          }
          
          // Xử lý nếu m là object
          const url = m.url 
            ? (m.url.startsWith("http") ? m.url : `http://localhost:8080/${m.url}`) 
            : null;
            
          if (!url) return null;
          
          // Xác định type từ thông tin có sẵn hoặc từ đuôi file
          const type = m.type 
            ? m.type.toLowerCase() 
            : (isVideoUrl(url) ? "video" : "image");
            
          console.log(`Media item processed: ${url}, type: ${type}`);
          
          return { url, type };
        })
        .filter(Boolean);
    }
    
    if (post?.mediaUrls && Array.isArray(post.mediaUrls)) {
      return post.mediaUrls.map((url) => ({ 
        url, 
        type: isVideoUrl(url) ? "video" : "image" 
      }));
    }
    
    if (post?.images && Array.isArray(post.images)) {
      return post.images.map((url) => ({ url, type: "image" }));
    }
    
    return [];
  };

  const mediaArray = getMediaArray();
  const handleImageError = (e) => {
    console.error("Image loading error: Unable to display image");

    try {
      e.target.onerror = null; 
      // Use process.env.PUBLIC_URL to get the correct path to public assets
      const fallbackImageUrl = `${process.env.PUBLIC_URL || ""}/logo192.png`;
      e.target.src = fallbackImageUrl;
      e.target.classList.add("image-error");
    } catch (error) {
      console.error("Error handling failed image:", error.message);
    }
  };

  const renderMedia = () => {
    // If there's no media, return nothing
    if (!mediaArray || mediaArray.length === 0) return null;
    
    // If there's only one media item, display it full width
    if (mediaArray.length === 1) {
      const media = mediaArray[0];
      if (media.type === "video") {
        return (
          <div className="relative w-full h-auto mb-3">
            <div className="relative group rounded-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <video
                ref={el => videoRefs.current[`video-0`] = el}
                src={media.url}
                controls
                controlsList="nodownload"
                className="w-full h-auto max-h-[500px] object-contain rounded-md"
                poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                <VideocamIcon className="text-white" fontSize="small" />
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="relative w-full h-auto mb-3">
            <img
              src={media.url}
              alt="Media"
              className="w-full h-auto max-h-[500px] object-contain rounded-md"
              onError={handleImageError}
            />
          </div>
        );
      }
    }
    
    // For multiple media items, use a grid layout
    return (
      <div className="grid gap-1 mb-3 rounded-md overflow-hidden" 
           style={{ 
             display: 'grid',
             gridTemplateColumns: mediaArray.length === 2 ? '1fr 1fr' : '1fr 0.8fr',
             gridTemplateRows: mediaArray.length <= 3 ? '1fr' : '1fr 1fr',
           }}>
        {/* First image (always larger) */}
        {mediaArray.length > 0 && (
          <div className={`rounded-md overflow-hidden ${mediaArray.length > 2 ? 'row-span-2' : ''}`} style={{ height: '100%' }}>
            {mediaArray[0].type === "video" ? (
              <div className="relative h-full" onClick={e => e.stopPropagation()}>
                <video
                  ref={el => videoRefs.current[`video-0`] = el}
                  src={mediaArray[0].url}
                  controls
                  controlsList="nodownload" 
                  className="w-full h-full object-cover"
                  poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                  <VideocamIcon className="text-white" fontSize="small" />
                </div>
              </div>
            ) : (
              <img
                src={mediaArray[0].url}
                alt="Media 1"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            )}
          </div>
        )}
        
        {/* Second image */}
        {mediaArray.length > 1 && (
          <div className="rounded-md overflow-hidden" style={{ height: mediaArray.length <= 2 ? '100%' : '200px' }}>
            {mediaArray[1].type === "video" ? (
              <div className="relative h-full" onClick={e => e.stopPropagation()}>
                <video
                  ref={el => videoRefs.current[`video-1`] = el}
                  src={mediaArray[1].url}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-cover"
                  poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                  <VideocamIcon className="text-white" fontSize="small" />
                </div>
              </div>
            ) : (
              <img
                src={mediaArray[1].url}
                alt="Media 2"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            )}
          </div>
        )}
        
        {/* Third image (if exists) */}
        {mediaArray.length > 2 && (
          <div className="rounded-md overflow-hidden relative" style={{ height: '200px' }}>
            {mediaArray[2].type === "video" ? (
              <div className="relative h-full" onClick={e => e.stopPropagation()}>
                <video
                  ref={el => videoRefs.current[`video-2`] = el}
                  src={mediaArray[2].url}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-cover"
                  poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                  <VideocamIcon className="text-white" fontSize="small" />
                </div>
              </div>
            ) : (
              <img
                src={mediaArray[2].url}
                alt="Media 3"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            )}
            
            {/* Overlay with count if more than 3 images */}
            {mediaArray.length > 3 && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/homepage/triplet/${post.postId || post.id}`);
                }}
              >
                <Typography variant="h4" className="text-white font-bold">
                  +{mediaArray.length - 3}
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const isSharedPost = post.isShared || post.isSharedContent || post.shareId;

  const getPostOwnerAvatar = () => {
    console.log("DEBUG getPostOwnerAvatar - Post data:", {
      postId: post.id || post.postId,
      isSharedPost,
      originalUser: post.originalUser,
      user: post.user,
      userData,
      postAvatarUrl: post.avatarUrl
    });
    
    if (isSharedPost && post.originalUser?.avatarUrl) {
      return formatAvatarUrl(post.originalUser.avatarUrl);
    }
    
    if (post.user?.avatarUrl) {
      return formatAvatarUrl(post.user.avatarUrl);
    }
    
    if (postOwnerData?.avatarUrl) {
      return formatAvatarUrl(postOwnerData.avatarUrl);
    }
    
    return formatAvatarUrl(post.avatarUrl);
  };
  
  const getPostOwnerName = () => {
    if (isSharedPost && post.originalUser?.firstName && post.originalUser?.lastName) {
      return `${post.originalUser.firstName} ${post.originalUser.lastName}`;
    }
    
    if (post.user?.firstName && post.user?.lastName) {
      return `${post.user.firstName} ${post.user.lastName}`;
    }
    
    return postOwnerData?.firstName && postOwnerData?.lastName
      ? `${postOwnerData.firstName} ${postOwnerData.lastName}`
      : displayName;
  };
  
  const getPostOwnerUsername = () => {
    if (isSharedPost && post.originalUser?.username) {
      return post.originalUser.username;
    }
    
    if (post.user?.username) {
      return post.user.username;
    }
    
    return postOwnerData?.username || username;
  };

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
              <span className="text-gray-500 text-sm">@{username}</span>
            </div>

            {(isCurrentUserPost || isSharedPost) && (
              <IconButton
                aria-label="more"
                id={`post-menu-button-${post.id}`}
                aria-controls={isMenuOpen ? "post-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? "true" : undefined}
                onClick={handleMenuClick}
                sx={{
                  padding: "4px",
                  color: "rgb(113, 118, 123)",
                  "&:hover": {
                    backgroundColor: "rgba(29, 155, 240, 0.1)",
                    color: "rgb(29, 155, 240)",
                  },
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
                  backgroundColor: "#15202b",
                  color: "white",
                  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.3)",
                  "& .MuiMenuItem-root": {
                    fontSize: "14px",
                    padding: "8px 16px",
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {isCurrentUserPost && !isSharedPost && (
                <MenuItem
                  onClick={handleEditDialogOpen}
                  sx={{
                    color: "rgb(29, 155, 240)",
                    "&:hover": { backgroundColor: "rgba(29, 155, 240, 0.1)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "rgb(29, 155, 240)" }}>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Post</ListItemText>
                </MenuItem>
              )}
              {isSharedPost && isCurrentUserPost && (
                <MenuItem
                  onClick={handleEditShare}
                  sx={{
                    color: "rgb(29, 155, 240)",
                    "&:hover": { backgroundColor: "rgba(29, 155, 240, 0.1)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "rgb(29, 155, 240)" }}>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Post</ListItemText>
                </MenuItem>
              )}

              {isSharedPost && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose(e);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{
                    color: "#ff4081",
                    "&:hover": { backgroundColor: "rgba(255, 64, 129, 0.1)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "#ff4081" }}>
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
                    color: "#ff4081",
                    "&:hover": { backgroundColor: "rgba(255, 64, 129, 0.1)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "#ff4081" }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Post</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </div>

          {post?.content && (
            <Typography sx={{ whiteSpace: "pre-line", mb: 2, color: "white" }}>
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
                backgroundColor: "rgba(39, 51, 64, 0.5)",
                borderColor: "rgba(66, 83, 100, 0.5)",
                borderRadius: "12px",
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
                      <Typography
                        variant="subtitle2"
                        className="text-gray-300 font-medium"
                      >
                        {post.originalUser?.firstName || ""}{" "}
                        {post.originalUser?.lastName || ""}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        @{post.originalUser?.username || "user"}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {post.originalContent && (
                  <Typography
                    sx={{
                      whiteSpace: "pre-line",
                      color: "white",
                      fontSize: "0.95rem",
                      mb: 2,
                    }}
                  >
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
                  <div
                    className={`rounded-xl overflow-hidden ${mediaArray.length > 1 ? "grid grid-cols-2 gap-1" : ""}`}
                  >
                    {mediaArray.length === 1 ? (
                      mediaArray[0].type === "video" ? (
                        <div className="relative group">
                          <video
                            src={mediaArray[0].url}
                            controls
                            controlsList="nodownload"
                            className="w-full h-auto max-h-[300px] object-contain"
                            poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                            <VideocamIcon
                              className="text-white"
                              fontSize="small"
                            />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={mediaArray[0].url}
                          alt="Post media"
                          className="w-full h-auto max-h-[300px] object-contain"
                          onError={handleImageError}
                        />
                      )
                    ) : (
                      mediaArray.slice(0, 4).map((media, index) => (
                        <div
                          key={index}
                          className={`${mediaArray.length === 3 && index === 0 ? "col-span-2" : ""} 
                                    ${mediaArray.length > 4 && index === 3 ? "relative" : ""}`}
                        >
                          {media.type === "video" ? (
                            <div className="relative h-48 group">
                              <video
                                src={media.url}
                                controls
                                controlsList="nodownload"
                                className="w-full h-48 object-cover"
                                poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                                <VideocamIcon
                                  className="text-white"
                                  fontSize="small"
                                />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={media.url || ""}
                              alt={`Media ${index + 1}`}
                              className="w-full h-48 object-cover"
                              onError={handleImageError}
                            />
                          )}
                          {mediaArray.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">
                                +{mediaArray.length - 4}
                              </span>
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

          {!isSharedPost && renderMedia()}

          <div className="flex justify-between mt-3 max-w-md">
            <div className="flex items-center group">
              <IconButton
                size="small"
                onClick={handleComment}
                sx={{
                  color: showComments
                    ? "rgb(29, 155, 240)"
                    : "rgb(113, 118, 123)",
                  "&:hover": {
                    color: "rgb(29, 155, 240)",
                    bgcolor: "rgba(29, 155, 240, 0.1)",
                  },
                }}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              <span
                className={`text-xs ml-1 ${showComments ? "text-blue-400" : "text-gray-500"} group-hover:text-blue-400`}
              >
                {post.commentsCount || post.commentCount || 0}
              </span>
            </div>

            <div className="flex items-center group">
              <IconButton
                size="small"
                onClick={handleLike}
                sx={{
                  color: liked ? "rgb(249, 24, 128)" : "rgb(113, 118, 123)",
                  "&:hover": {
                    color: "rgb(249, 24, 128)",
                    bgcolor: "rgba(249, 24, 128, 0.1)",
                  },
                }}
                disabled={isLoading}
              >
                {liked ? (
                  <FavoriteIcon fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
              <span
                className={`text-xs ml-1 ${liked ? "text-pink-500" : "text-gray-500"} group-hover:text-pink-500 cursor-pointer`}
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
                  color: "rgb(113, 118, 123)",
                  "&:hover": {
                    color: "rgb(29, 155, 240)",
                    bgcolor: "rgba(29, 155, 240, 0.1)",
                  },
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
              <Comments
                postId={post.postId || post.id}
                inFeed={true}
                maxComments={3}
              />
            </Box>
          </Collapse>
        </div>
      </div>
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: "12px",
            backgroundColor: "#15202b",
            color: "white",
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Edit Post
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setEditDialogOpen(false)}
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": {
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            id="editCaption"
            label="Post Caption"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            InputProps={{
              style: { color: "white" },
            }}
            InputLabelProps={{
              style: { color: "rgba(255,255,255,0.7)" },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgb(29, 155, 240)",
                },
              },
            }}
          />

          {existingMedia.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
              >
                Ảnh hiện tại:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {existingMedia.map((mediaUrl, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 100,
                      height: 100,
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={mediaUrl}
                      alt={`Existing media ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        padding: "4px",
                        "&:hover": { backgroundColor: "rgba(255,0,0,0.5)" },
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

          {editPreviewUrl && selectedEditImage && (
            <Box sx={{ mt: 2, position: "relative", maxWidth: 300 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}
              >
                {selectedEditImage.type.startsWith("video")
                  ? "Video mới:"
                  : "Ảnh mới:"}
              </Typography>
              <Box sx={{ position: "relative" }}>
                {selectedEditImage.type.startsWith("video") ? (
                  <video
                    src={editPreviewUrl}
                    controls
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={editPreviewUrl}
                    alt="New media preview"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    padding: "4px",
                    "&:hover": { backgroundColor: "rgba(255,0,0,0.5)" },
                  }}
                  onClick={handleClearNewImage}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <label className="flex items-center space-x-2 rounded-md cursor-pointer">
              <Button
                startIcon={<ImageIcon />}
                sx={{
                  color: "#1d9bf0",
                  borderColor: "#1d9bf0",
                  borderRadius: "20px",
                  "&:hover": { backgroundColor: "rgba(29, 155, 240, 0.1)" },
                  textTransform: "none",
                }}
                variant="outlined"
                component="span"
              >
                {editPreviewUrl ? "Chọn file khác" : "Thêm ảnh/video mới"}
              </Button>
              <input
                type="file"
                name="editMediaFile"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleSelectEditMedia}
              />
            </label>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
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
              bgcolor: "rgb(29, 155, 240)",
              "&:hover": { bgcolor: "rgb(26, 140, 216)" },
              fontWeight: "bold",
              px: 3,
            }}
          >
            {submittingEdit ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: "12px",
            backgroundColor: "#15202b",
            color: "white",
          },
        }}
      >
        <DialogTitle
          onClick={handleDialogClick}
          sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Share Post
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setShareDialogOpen(false)}
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": {
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
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
            label="Write your thoughts for this article..."
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            InputProps={{
              style: { color: "white" },
            }}
            InputLabelProps={{
              style: { color: "rgba(255,255,255,0.7)" },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgb(29, 155, 240)",
                },
              },
            }}
          />

          <Paper
            variant="outlined"
            className="mt-4 overflow-hidden"
            sx={{
              backgroundColor: "rgba(39, 51, 64, 0.7)",
              borderColor: "rgba(66, 83, 100, 0.7)",
              borderRadius: "12px",
            }}
          >
            <Box className="p-4">
              <Box className="mb-3">
                <Typography
                  variant="subtitle1"
                  sx={{ color: "white", fontWeight: "500" }}
                >
                  {getPostOwnerName()}
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  mb: 2,
                  whiteSpace: "pre-line",
                }}
              >
                {(post.content || post.originalContent || "").length > 150
                  ? `${(post.content || post.originalContent || "").substring(0, 150)}...`
                  : post.content || post.originalContent || ""}
              </Typography>

              {mediaArray.length > 0 && (
                <Box
                  className="overflow-hidden rounded-lg"
                  sx={{
                    width: "100%",
                    height: "auto",
                    maxHeight: 200,
                    mb: 1,
                  }}
                >
                  {mediaArray[0].type === "video" ? (
                    <div className="relative">
                      <video
                        src={mediaArray[0].url}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: "8px" }}
                        poster={`${process.env.PUBLIC_URL || ""}/logo.png`}
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircleOutlineIcon className="text-white text-4xl opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={mediaArray[0].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      style={{ borderRadius: "8px" }}
                    />
                  )}
                </Box>
              )}

              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.5)", display: "block", mt: 1 }}
              >
                {formattedTimeAgo}
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions
          onClick={handleDialogClick}
          sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Button
            onClick={() => setShareDialogOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
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
              bgcolor: "rgb(29, 155, 240)",
              "&:hover": { bgcolor: "rgb(26, 140, 216)" },
              fontWeight: "bold",
              px: 3,
            }}
          >
            {isLoading ? "Đang chia sẻ..." : "Chia sẻ"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: "8px",
            backgroundColor: "white",
            color: "black",
            width: "280px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle
          sx={{ pb: 1, color: "black", fontWeight: "bold", fontSize: "18px" }}
        >
          Xóa chia sẻ
        </DialogTitle>
        <DialogContent sx={{ pb: 2, color: "black" }}>
          <Typography sx={{ fontSize: "15px" }}>
            Bạn có chắc chắn muốn xóa chia sẻ này?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "black", fontWeight: "bold", textTransform: "none" }}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteShare}
            sx={{
              bgcolor: "#FF1493",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { bgcolor: "#ff4081" },
            }}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deletePostDialogOpen}
        onClose={() => setDeletePostDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: "8px",
            backgroundColor: "white",
            color: "black",
            width: "280px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle
          sx={{ pb: 1, color: "black", fontWeight: "bold", fontSize: "18px" }}
        >
          Delete Post
        </DialogTitle>
        <DialogContent sx={{ pb: 2, color: "black" }}>
          <Typography sx={{ fontSize: "15px" }}>
            Bạn có chắc chắn muốn xóa bài viết này?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            onClick={() => setDeletePostDialogOpen(false)}
            sx={{ color: "black", fontWeight: "bold", textTransform: "none" }}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeletePost}
            sx={{
              bgcolor: "#FF1493",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { bgcolor: "#ff4081" },
            }}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>{" "}
      <Dialog
        open={likesDialogOpen}
        onClose={() => setLikesDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: "8px",
            backgroundColor: "#15202b",
            color: "white",
            width: "320px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            borderBottom: "1px solid #2f3336",
          }}
        >
          List of Likes
        </DialogTitle>
        <DialogContent sx={{ pb: 2, color: "white" }}>
          {loadingLikes ? (
            <Typography
              sx={{ fontSize: "15px", textAlign: "center", color: "#d9d9d9" }}
            >
              Đang tải...
            </Typography>
          ) : likesList.length > 0 ? (
            likesList.map((like) => (
              <Box
                key={like.id}
                className="flex items-center mb-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <Avatar
                  src={getLikeUserAvatar(like.userId)}
                  alt={getLikeUserUsername(like.userId)}
                  sx={{ width: 32, height: 32, marginRight: 1 }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    className="text-white font-medium"
                  >
                    {getLikeUserDisplayName(like.userId)}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    @{getLikeUserUsername(like.userId)}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography
              sx={{ fontSize: "15px", textAlign: "center", color: "#d9d9d9" }}
            >
              Không có lượt thích nào.
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
            borderTop: "1px solid #2f3336",
          }}
        >
          <Button
            onClick={() => setLikesDialogOpen(false)}
            sx={{
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            Exit
          </Button>
        </DialogActions>{" "}
      </Dialog>
      <ShareEditDialog
        open={shareEditDialogOpen}
        onClose={() => setShareEditDialogOpen(false)}
        shareData={{
          id: post.shareId || post.id,
          content: post.shareContent || post.content,
          postId: post.postId,
          userId: post.userId,
          createdAt: post.createdAt,
        }}
        onShareUpdate={handleShareUpdate}
      />
    </div>
  );
};

export default TripleTCard;
