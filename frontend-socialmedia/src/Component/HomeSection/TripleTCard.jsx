import React, { useState } from "react";
import { Avatar, Box, Typography, IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import IosShareIcon from "@mui/icons-material/IosShare";
import BarChartIcon from "@mui/icons-material/BarChart";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TripleTCard = ({ post, profileUserId }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likeCount || post?.likesCount || 0);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!post) return null;

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
      
      setLiked(newLikedState);
      setLikesCount(newLikesCount);
      
      const response = await axios({
        method: newLikedState ? 'post' : 'delete',
        url: `http://localhost:8080/api/v1/posts/${post.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.data && response.data.Status !== 200) {
        setLiked(liked);
        setLikesCount(likesCount);
        console.error("API like/unlike thất bại:", response.data.Message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API like/unlike:", error);
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
    navigate(`/homepage/triplet/${post.id}`);
  };
  
  const handleRepost = async (e) => {
    e.stopPropagation();
    
    try {
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("Không tìm thấy access token");
        return;
      }
      
      const response = await axios.post(
        `http://localhost:8080/api/v1/posts/${post.id}/shares`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (response.data && response.data.Status === 200) {
        console.log("Repost thành công:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API repost:", error);
    }
  };
  
  const handleComment = (e) => {
    e.stopPropagation();
    navigate(`/homepage/triplet/${post.id}?comment=true`);
  };
  
  const handleShare = (e) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/homepage/triplet/${post.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.content ? post.content.substring(0, 50) + '...' : 'Chia sẻ bài viết',
        text: post.content ? post.content.substring(0, 100) + '...' : 'Xem bài viết này',
        url: shareUrl,
      })
      .catch((error) => console.log('Lỗi khi chia sẻ:', error));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('Đã sao chép link vào clipboard!');
        })
        .catch((err) => {
          console.error('Không thể sao chép: ', err);
        });
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

  const hasMedia = post?.mediaUrl || (post?.media && post.media.length > 0) || (post?.mediaUrls && post.mediaUrls.length > 0) || (post?.images && post.images.length > 0);
  
  const getMediaArray = () => {
    if (post?.mediaUrl) return [post.mediaUrl];
    if (post?.media && Array.isArray(post.media)) {
      return post.media.map(m => m.url ? `http://localhost:8080/${m.url}` : m);
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

  return (
    <div 
      className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors cursor-pointer px-4 py-3"
      onClick={handlePostClick}
    >
      <div className="flex space-x-3">
        <div onClick={(e) => handleNavigateToProfile(e, post.userId || post.user?.id)}>
          <Avatar 
            src={post.user?.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
            alt={post.user?.username || "user"}
            sx={{ width: 40, height: 40 }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1 mb-0.5">
              <span 
                className="font-bold text-white hover:underline"
                onClick={(e) => handleNavigateToProfile(e, post.userId || post.user?.id)}
              >
                {post.user?.firstName || ""} {post.user?.lastName || ""}
              </span>
              <span className="text-gray-500 text-sm">
                @{post.user?.username || "user"}
              </span>
              <span className="text-gray-500 mx-1">·</span>
              <span className="text-gray-500 text-sm hover:underline">
                {renderTimeAgo(post.createdAt)}
              </span>
            </div>
            <IconButton size="small" sx={{ color: 'gray' }}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </div>
          
          {(post?.content || post?.caption) && (
            <Typography sx={{ whiteSpace: 'pre-line', mb: 2, color: 'white' }}>
              {showFullContent || !contentIsTruncated 
                ? (post.content || post.caption) 
                : `${(post.content || post.caption).slice(0, MAX_CONTENT_LENGTH)}...`}
                
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
          
          {mediaArray.length > 0 && (
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
                  color: 'rgb(113, 118, 123)',
                  '&:hover': { color: 'rgb(29, 155, 240)', bgcolor: 'rgba(29, 155, 240, 0.1)' }
                }}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              <span className="text-gray-500 text-xs group-hover:text-blue-400 ml-1">
                {post.commentsCount || post.commentCount || 0}
              </span>
            </div>
            
            <div className="flex items-center group">
              <IconButton 
                size="small" 
                onClick={handleRepost}
                sx={{ 
                  color: 'rgb(113, 118, 123)',
                  '&:hover': { color: 'rgb(0, 186, 124)', bgcolor: 'rgba(0, 186, 124, 0.1)' }
                }}
                disabled={isLoading}
              >
                <RepeatIcon fontSize="small" />
              </IconButton>
              <span className="text-gray-500 text-xs group-hover:text-green-400 ml-1">
                {post.repostsCount || post.shareCount || 0}
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
              <span className={`text-xs ml-1 ${liked ? 'text-pink-500' : 'text-gray-500'} group-hover:text-pink-500`}>
                {likesCount}
              </span>
            </div>
            
            <div className="flex items-center group">
              <IconButton 
                size="small"
                sx={{ 
                  color: 'rgb(113, 118, 123)',
                  '&:hover': { color: 'rgb(29, 155, 240)', bgcolor: 'rgba(29, 155, 240, 0.1)' }
                }}
              >
                <BarChartIcon fontSize="small" />
              </IconButton>
              <span className="text-gray-500 text-xs group-hover:text-blue-400 ml-1">
                {post.viewsCount || 0}
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
        </div>
      </div>
    </div>
  );
};

export default TripleTCard;
