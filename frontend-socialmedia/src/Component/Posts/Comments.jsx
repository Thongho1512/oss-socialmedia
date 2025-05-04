import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Comments = ({ postId, inFeed = false, maxComments = 3 }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const currentUserId = localStorage.getItem("user_id");

  // Menu handling
  const handleMenuOpen = (e, commentId) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    setDeleting(true);
    setSelectedCommentId(commentId);
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
        setError("Không thể xóa bình luận");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Lỗi khi xóa bình luận");
    } finally {
      setDeleting(false);
      setSelectedCommentId(null);
    }
  };

  // Fetch comments for the post
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8080/api/v1/comments?keyword=${postId}&size=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        const postComments = response.data.Data.comments ? 
          response.data.Data.comments.filter(comment => comment.postId === postId) : 
          [];
        setComments(postComments);
      } else {
        setError("Không thể tải bình luận");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Lỗi khi tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.post(
        `http://localhost:8080/api/v1/comments`,
        {
          postId: postId,
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        setNewComment("");
        fetchComments();
      } else {
        setError("Không thể đăng bình luận");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Lỗi khi đăng bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate to user profile
  const handleNavigateToProfile = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/homepage/profile/${userId}`);
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    try {
      const now = new Date();
      const commentDate = new Date(timestamp);
      const diffInSeconds = Math.floor((now - commentDate) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m`;
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}h`;
      } else if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)}d`;
      } else {
        return commentDate.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      }
    } catch (e) {
      return "recently";
    }
  };

  // View full comment thread
  const handleViewFullThread = (e) => {
    e.stopPropagation();
    navigate(`/homepage/triplet/${postId}?comment=true`);
  };

  // Toggle showing all comments
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Decide which comments to show
  const visibleComments = showAll || !inFeed 
    ? comments 
    : comments.slice(0, Math.min(maxComments, comments.length));

  return (
    <Box className={`comments-container ${inFeed ? 'px-2 pt-1' : 'px-4 py-3'}`}>
      {/* Comments list */}
      {loading ? (
        <Box className="flex justify-center py-2">
          <CircularProgress size={20} sx={{ color: "#1d9bf0" }} />
        </Box>
      ) : error ? (
        <Typography className="text-red-500 text-sm text-center py-2">
          {error}
        </Typography>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {visibleComments.map((comment) => {
            const isOwnComment = String(comment.userId) === String(currentUserId) || 
                                String(comment.user?.id) === String(currentUserId);
            const isDeleting = selectedCommentId === comment.id && deleting;
            
            return (
              <Box 
                key={comment.id} 
                className={`comment ${inFeed ? 'py-2' : 'py-3'} ${!inFeed && 'border-b border-gray-800'}`}
              >
                <Box className="flex space-x-2">
                  <Avatar
                    src={comment.user?.avatarUrl}
                    alt={comment.user?.username || "user"}
                    sx={{ width: inFeed ? 24 : 32, height: inFeed ? 24 : 32 }}
                    className="cursor-pointer"
                    onClick={(e) => handleNavigateToProfile(e, comment.userId || comment.user?.id)}
                  />
                  <Box className="flex-1">
                    <Box className="flex items-center justify-between" sx={{ width: '100%' }}>
                      <Box className="flex items-baseline space-x-1">
                        <Typography 
                          variant={inFeed ? "body2" : "subtitle2"}
                          className="font-bold text-white hover:underline cursor-pointer"
                          onClick={(e) => handleNavigateToProfile(e, comment.userId || comment.user?.id)}
                        >
                          {comment.user?.firstName || ""} {comment.user?.lastName || ""}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          @{comment.user?.username || "user"}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          · {formatTimeAgo(comment.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Typography 
                        variant={inFeed ? "body2" : "body1"} 
                        sx={{ whiteSpace: 'pre-line', color: 'white', mt: 0.5, flex: 1 }}
                      >
                        {comment.content}
                      </Typography>
                      
                      {isOwnComment && (
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
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(comment.id);
                          }}
                        >
                          {isDeleting ? (
                            <CircularProgress size={16} sx={{ color: "#f43f5e" }} />
                          ) : (
                            <DeleteOutlineIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* "View more comments" button for in-feed view */}
          {inFeed && comments.length > maxComments && !showAll && (
            <Button
              variant="text"
              size="small"
              onClick={toggleShowAll}
              sx={{ 
                color: 'rgb(29, 155, 240)', 
                textTransform: 'none',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(29, 155, 240, 0.1)'
                }
              }}
            >
              Show {comments.length - maxComments} more {comments.length - maxComments === 1 ? 'comment' : 'comments'}
            </Button>
          )}
          
          {/* "View full thread" button for in-feed view */}
          {inFeed && comments.length > 0 && (
            <Button
              variant="text"
              size="small"
              onClick={handleViewFullThread}
              sx={{ 
                color: 'rgb(29, 155, 240)', 
                textTransform: 'none',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(29, 155, 240, 0.1)'
                }
              }}
            >
              View full thread
            </Button>
          )}
        </div>
      ) : !inFeed ? (
        <Typography className="text-gray-500 text-center py-4">
          No comments yet. Be the first to comment!
        </Typography>
      ) : null}

      {/* Comment input */}
      {(!inFeed || comments.length === 0) && (
        <Box className={`comment-input mt-2 ${inFeed ? 'mb-1' : 'mt-4'}`}>
          <Box className="flex items-start space-x-2">
            <Avatar
              src={localStorage.getItem("user_avatar")}
              sx={{ width: inFeed ? 28 : 36, height: inFeed ? 28 : 36 }}
            />
            <Box className="flex-1">
              <TextField
                placeholder="Write a comment..."
                multiline={!inFeed}
                rows={inFeed ? 1 : 2}
                fullWidth
                variant="outlined"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& fieldset': {
                      borderColor: inFeed ? 'transparent' : 'rgb(47, 51, 54)',
                      borderRadius: '16px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(29, 155, 240) !important',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(29, 155, 240) !important',
                    },
                    padding: inFeed ? '8px 0' : '',
                  }
                }}
              />
              {(newComment.trim() || !inFeed) && (
                <Box className={`flex ${inFeed ? 'justify-start mt-1' : 'justify-end mt-2'}`}>
                  <Button
                    variant="contained"
                    size={inFeed ? "small" : "medium"}
                    disabled={!newComment.trim() || submitting}
                    onClick={handleSubmitComment}
                    sx={{
                      borderRadius: '9999px',
                      backgroundColor: 'rgb(29, 155, 240)',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgb(26, 140, 216)'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(29, 155, 240, 0.5)',
                        color: 'white'
                      },
                      px: inFeed ? 2 : 3
                    }}
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Comments;