import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Button,
  Box,
  Typography,
  CircularProgress,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FollowModal = ({ open, handleClose, userId, initialTab = 'followers' }) => {
  const [tabValue, setTabValue] = useState(initialTab === 'following' ? 1 : 0);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && userId) {
      setPage(0);
      setFollowerUsers([]);
      setFollowingUsers([]);
      setHasMore(true);
      fetchFollowData(0);
    }
  }, [open, userId, tabValue]);

  const fetchFollowData = async (pageNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const currentUserId = localStorage.getItem('user_id');
      
      if (tabValue === 0) {
        // Fetch followers
        const followsResponse = await axios.get(
          `http://localhost:8080/api/v1/follows?page=${pageNumber}&size=20`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        if (followsResponse.data && followsResponse.data.Status === 200) {
          const followsData = followsResponse.data.Data?.follows || [];
          
          // Filter follows where the followeeId is the profile user (these are the followers)
          const followerIds = followsData
            .filter(follow => follow.followeeId === userId)
            .map(follow => follow.followerId);
          
          if (followerIds.length > 0) {
            // Fetch details of each follower user
            const userDetailsPromises = followerIds.map(id => 
              axios.get(`http://localhost:8080/api/v1/users/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              })
            );
            
            const userResponses = await Promise.all(userDetailsPromises);
            const followerUserDetails = userResponses.map(response => {
              const userData = response.data.Data1;
              
              // Check if this user is being followed by the current user
              const isFollowing = followsData.some(
                follow => follow.followerId === currentUserId && follow.followeeId === userData.id
              );
              
              // Find the follow ID if needed for unfollow
              const followId = isFollowing ? 
                followsData.find(
                  follow => follow.followerId === currentUserId && follow.followeeId === userData.id
                )?.id : null;
                
              return {
                ...userData,
                isFollowing,
                followId
              };
            });
            
            setFollowerUsers(prevUsers => [...prevUsers, ...followerUserDetails]);
            
            // Check if we have more pages
            const totalPages = followsResponse.data.Data.totalPages || 0;
            setHasMore(pageNumber < totalPages - 1);
          } else {
            setHasMore(false);
          }
        }
      } else {
        // Fetch following
        const followsResponse = await axios.get(
          `http://localhost:8080/api/v1/follows?page=${pageNumber}&size=20`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        if (followsResponse.data && followsResponse.data.Status === 200) {
          const followsData = followsResponse.data.Data?.follows || [];
          
          // Filter follows where the followerId is the profile user (these are the following)
          const followingIds = followsData
            .filter(follow => follow.followerId === userId)
            .map(follow => follow.followeeId);
          
          if (followingIds.length > 0) {
            // Fetch details of each following user
            const userDetailsPromises = followingIds.map(id => 
              axios.get(`http://localhost:8080/api/v1/users/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              })
            );
            
            const userResponses = await Promise.all(userDetailsPromises);
            const followingUserDetails = userResponses.map(response => {
              const userData = response.data.Data1;
              
              // For the following list, the current user is already following them
              // But we need to check if the current user is viewing their own profile
              const isCurrentUserProfile = userId === currentUserId;
              const isFollowing = isCurrentUserProfile || followsData.some(
                follow => follow.followerId === currentUserId && follow.followeeId === userData.id
              );
              
              // Find the follow ID if needed for unfollow
              const followId = isFollowing ? 
                followsData.find(
                  follow => (isCurrentUserProfile ? follow.followerId === userId : follow.followerId === currentUserId) && 
                  follow.followeeId === userData.id
                )?.id : null;
                
              return {
                ...userData,
                isFollowing,
                followId
              };
            });
            
            setFollowingUsers(prevUsers => [...prevUsers, ...followingUserDetails]);
            
            // Check if we have more pages
            const totalPages = followsResponse.data.Data.totalPages || 0;
            setHasMore(pageNumber < totalPages - 1);
          } else {
            setHasMore(false);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching follow data:", err);
      setError(err.message || "Failed to load follow data");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setFollowerUsers([]);
    setFollowingUsers([]);
    setHasMore(true);
  };

  const handleUserClick = (userId) => {
    handleClose();
    navigate(`/homepage/profile/${userId}`);
  };

  const handleFollow = async (targetUserId, isCurrentlyFollowing, followId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const currentUserId = localStorage.getItem('user_id');
      
      if (!accessToken || targetUserId === currentUserId) return;
      
      if (!isCurrentlyFollowing) {
        // Follow the user
        await axios.post(
          'http://localhost:8080/api/v1/follows',
          { followeeId: targetUserId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else if (followId) {
        // Unfollow the user
        await axios.delete(
          `http://localhost:8080/api/v1/follows/${followId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }
      
      // Refresh the follow data
      setPage(0);
      setFollowerUsers([]);
      setFollowingUsers([]);
      setHasMore(true);
      fetchFollowData(0);
    } catch (err) {
      console.error("Error updating follow status:", err);
    }
  };

  const loadMoreUsers = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFollowData(nextPage);
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreUsers();
    }
  };

  const currentUserId = localStorage.getItem('user_id');
  const displayData = tabValue === 0 ? followerUsers : followingUsers;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            People
          </Typography>
          <Box width={24} /> {/* Spacer to center the title */}
        </Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            marginTop: 1,
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
          <Tab label="Followers" />
          <Tab label="Following" />
        </Tabs>
      </DialogTitle>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <DialogContent 
        sx={{ padding: 0, maxHeight: '70vh', overflow: 'auto' }}
        onScroll={handleScroll}
      >
        {loading && displayData.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress sx={{ color: '#1d9bf0' }} />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : displayData.length === 0 && !loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="text.secondary">
              {tabValue === 0 ? 'No followers yet' : 'Not following anyone'}
            </Typography>
          </Box>
        ) : (
          <Box>
            {displayData.map((user) => (
              <Box 
                key={user.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
                  cursor: 'pointer'
                }}
              >
                <Box 
                  sx={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar 
                    src={user.avatarUrl || 'https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg'} 
                    alt={user.username}
                    sx={{ width: 40, height: 40, marginRight: 2 }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                  </Box>
                </Box>
                
                {user.id !== currentUserId && (
                  <Button
                    variant={user.isFollowing ? "outlined" : "contained"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user.id, user.isFollowing, user.followId);
                    }}
                    sx={{
                      borderRadius: "9999px",
                      backgroundColor: user.isFollowing ? "black" : "#1d9bf0",
                      color: user.isFollowing ? "white" : "white",
                      textTransform: "none",
                      fontWeight: "bold",
                      borderColor: user.isFollowing ? "#1d9bf0" : undefined,
                      "&:hover": {
                        backgroundColor: user.isFollowing ? "#222" : "#1a8cd8",
                      },
                      minWidth: '80px',
                    }}
                  >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </Box>
            ))}
            
            {loading && displayData.length > 0 && (
              <Box display="flex" justifyContent="center" padding={2}>
                <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
              </Box>
            )}
            
            {!hasMore && displayData.length > 0 && (
              <Box textAlign="center" padding={2} color="text.secondary">
                No more users to show
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;