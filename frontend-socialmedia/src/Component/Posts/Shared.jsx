import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import TripleTCard from "../HomeSection/TripleTCard";

const Shared = ({ userId }) => {
  const [userShares, setUserShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreShares, setHasMoreShares] = useState(true);
  const [page, setPage] = useState(0);
  const [userData, setUserData] = useState(null);
  
  // Fetch user data for proper display in shared posts
  useEffect(() => {
    const fetchUserData = async () => {
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
          setUserData(response.data.Data1 || response.data.Data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserShares = useCallback(async () => {
    console.log("Đang tải bài viết đã chia sẻ, userId:", userId, "page:", page);
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8080/api/v1/shares?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Kết quả API shares:", response.data);
      
      if (response.data && response.data.Status === 200) {
        if (response.data.Data && response.data.Data.shares) {
          const sharesWithPostDetails = [];
          
          // Lọc những shares của user hiện tại nếu userId được cung cấp
          const shareItems = userId 
            ? response.data.Data.shares.filter(share => share.userId === userId)
            : response.data.Data.shares;
          
          console.log("Số bài share sẽ hiển thị:", shareItems.length);
          
          // Lấy danh sách các postId duy nhất để lấy thông tin chi tiết
          const uniquePostIds = [...new Set(shareItems.map(share => share.postId))];
          const postsDetails = {};
          const userDetails = {};
          
          // Lấy thông tin chi tiết của các bài viết gốc
          for (const postId of uniquePostIds) {
            try {
              // Thử sử dụng API post/feed để lấy thông tin chi tiết bài viết
              const postResponse = await axios.get(
                `http://localhost:8080/api/v1/posts/feed/${postId}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              );
              
              if (postResponse.data && postResponse.data.Status === 200) {
                postsDetails[postId] = postResponse.data.Data;
                console.log(`Lấy thành công thông tin bài viết ${postId}:`, postResponse.data.Data);
                
                // Lấy thông tin người đăng bài viết gốc
                const originalUserId = postResponse.data.Data.userId;
                if (originalUserId && !userDetails[originalUserId]) {
                  try {
                    const userResponse = await axios.get(
                      `http://localhost:8080/api/v1/users/${originalUserId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`
                        }
                      }
                    );
                    
                    if (userResponse.data && userResponse.data.Status === 200) {
                      const originalUserData = userResponse.data.Data1 || userResponse.data.Data;
                      userDetails[originalUserId] = originalUserData;
                      console.log(`Lấy thành công thông tin người dùng ${originalUserId}:`, originalUserData);
                    }
                  } catch (error) {
                    console.error(`Không thể lấy thông tin người dùng ${originalUserId}:`, error);
                  }
                }
              }
            } catch (feedError) {
              console.error(`Không thể lấy chi tiết bài viết ${postId} từ feed API:`, feedError);
              
              try {
                // Thử sử dụng endpoint API thay thế nếu feed API không hoạt động
                const altPostResponse = await axios.get(
                  `http://localhost:8080/api/v1/posts?postId=${postId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`
                    }
                  }
                );
                
                if (altPostResponse.data && altPostResponse.data.Status === 200) {
                  // Tìm bài viết trong danh sách trả về
                  const foundPost = altPostResponse.data.Data.content?.find(p => p.id === postId) || 
                                    altPostResponse.data.Data.posts?.find(p => p.id === postId) ||
                                    altPostResponse.data.Data.find(p => p.id === postId);
                  
                  if (foundPost) {
                    postsDetails[postId] = foundPost;
                    console.log(`Lấy thành công thông tin bài viết ${postId} từ endpoint thay thế`);
                    
                    // Lấy thông tin người đăng bài viết gốc từ endpoint thay thế
                    const originalUserId = foundPost.userId;
                    if (originalUserId && !userDetails[originalUserId]) {
                      try {
                        const userResponse = await axios.get(
                          `http://localhost:8080/api/v1/users/${originalUserId}`,
                          {
                            headers: {
                              Authorization: `Bearer ${accessToken}`
                            }
                          }
                        );
                        
                        if (userResponse.data && userResponse.data.Status === 200) {
                          const originalUserData = userResponse.data.Data1 || userResponse.data.Data;
                          userDetails[originalUserId] = originalUserData;
                          console.log(`Lấy thành công thông tin người dùng ${originalUserId}:`, originalUserData);
                        }
                      } catch (error) {
                        console.error(`Không thể lấy thông tin người dùng ${originalUserId}:`, error);
                      }
                    }
                  }
                }
              } catch (altError) {
                console.error(`Không thể lấy chi tiết bài viết ${postId} từ endpoint thay thế:`, altError);
              }
            }
          }
          
          // Xử lý từng bài share
          for (const share of shareItems) {
            try {
              // Lấy thông tin chi tiết của bài viết gốc nếu có
              const postDetail = postsDetails[share.postId];
              
              // Xử lý media từ bài viết gốc
              let mediaUrls = [];
              if (postDetail) {
                // Lấy media từ các nguồn khác nhau có thể có
                if (postDetail.media && Array.isArray(postDetail.media)) {
                  mediaUrls = postDetail.media.map(m => m.url ? 
                      (m.url.startsWith('http') ? m.url : `http://localhost:8080/${m.url}`) : null)
                      .filter(Boolean);
                } else if (postDetail.mediaUrls && Array.isArray(postDetail.mediaUrls)) {
                  mediaUrls = postDetail.mediaUrls;
                } else if (postDetail.images && Array.isArray(postDetail.images)) {
                  mediaUrls = postDetail.images;
                } else if (postDetail.mediaUrl) {
                  mediaUrls = [postDetail.mediaUrl];
                }
              }
              
              // Thông tin người đăng bài viết gốc
              const originalUserId = postDetail?.userId;
              const originalUserInfo = userDetails[originalUserId] || null;
              
              // Đảm bảo rằng originalUserInfo có dữ liệu đầy đủ
              const processedOriginalUserInfo = originalUserInfo ? {
                id: originalUserId,
                username: originalUserInfo.username || `user_${originalUserId?.substring(0, 5) || "unknown"}`,
                firstName: originalUserInfo.firstName || "Người",
                lastName: originalUserInfo.lastName || "Dùng",
                avatarUrl: originalUserInfo.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"
              } : {
                id: originalUserId || "unknown",
                username: `user_${originalUserId?.substring(0, 5) || "unknown"}`,
                firstName: "Người",
                lastName: "Dùng",
                avatarUrl: "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"
              };
              
              // Đảm bảo rằng URL avatar bắt đầu bằng http
              if (processedOriginalUserInfo.avatarUrl && !processedOriginalUserInfo.avatarUrl.startsWith('http')) {
                processedOriginalUserInfo.avatarUrl = `http://localhost:8080/${processedOriginalUserInfo.avatarUrl}`;
              }
              
              console.log("Original user info for post", share.postId, ":", processedOriginalUserInfo);
              
              // Tạo đối tượng share với các thông tin đầy đủ
              sharesWithPostDetails.push({
                id: share.id,
                postId: share.postId,
                shareId: share.id,
                shareContent: share.content,
                content: share.content,
                originalContent: postDetail?.caption || postDetail?.content || "Nội dung không khả dụng", 
                isShared: true,
                isSharedContent: true,
                userId: share.userId,
                user: {
                  id: userData?.id || share.userId,
                  username: userData?.username || "user",
                  firstName: userData?.firstName || "",
                  lastName: userData?.lastName || "",
                  avatarUrl: userData?.avatarUrl || ""
                },
                originalUser: processedOriginalUserInfo,
                createdAt: share.createdAt,
                likeCount: postDetail?.likeCount || 0,
                commentCount: postDetail?.commentCount || 0,
                shareCount: postDetail?.shareCount || 0,
                mediaUrls: mediaUrls
              });
            } catch (error) {
              console.error(`Lỗi khi xử lý share ${share.id}:`, error);
            }
          }
          
          // Lưu vào userShares
          setUserShares(prevShares => 
            page === 0 ? sharesWithPostDetails : [...prevShares, ...sharesWithPostDetails]
          );
          setHasMoreShares(shareItems.length === 5);
        } else {
          if (page === 0) {
            setUserShares([]);
          }
          setHasMoreShares(false);
        }
      } else {
        if (page === 0) {
          setUserShares([]);
        }
        setHasMoreShares(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải shares:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, page, userData]);

  useEffect(() => {
    fetchUserShares();
  }, [fetchUserShares]);

  const loadMoreShares = () => {
    if (hasMoreShares && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Khi người dùng scroll xuống cuối trang, tải thêm bài viết
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight - 100;
      if (bottom && !loading && hasMoreShares) {
        loadMoreShares();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMoreShares]);

  // Prepare post data for TripleTCard component
  const preparePostForTripleTCard = (post) => {
    // Đảm bảo đầy đủ thông tin và định dạng cho TripleTCard
    return {
      ...post,
      // Hiển thị rõ ràng nội dung chia sẻ và nội dung bài viết gốc
      content: post.shareContent || "", // Nội dung chia sẻ
      originalContent: post.originalContent || "", // Nội dung bài viết gốc
      isSharedContent: true, // Đánh dấu đây là bài viết được chia sẻ
      
      // Đảm bảo originalUser có đầy đủ thông tin
      originalUser: post.originalUser || null,
      
      // Thông tin tương tác
      likesCount: post.likeCount || post.likesCount || 0,
      commentsCount: post.commentCount || post.commentsCount || 0,
      repostsCount: post.shareCount || post.repostsCount || 0,
      
      // Đảm bảo hiển thị hình ảnh đúng
      mediaUrls: post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : 
                (post.media && post.media.length > 0 ? 
                  post.media.map(m => typeof m === 'string' ? m : (m.url || null)).filter(Boolean) : 
                  [])
    };
  };

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error loading shares: {error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      {userShares.length > 0 ? (
        <div>
          {userShares.map((post, index) => (
            <React.Fragment key={`share-${post.id}-${index}`}>
              <TripleTCard post={preparePostForTripleTCard(post)} profileUserId={userId} />
            </React.Fragment>
          ))}

          {loading && (
            <Box className="flex justify-center p-4">
              <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
            </Box>
          )}
        </div>
      ) : loading ? (
        <Box className="flex justify-center p-8">
          <CircularProgress size={24} sx={{ color: "#1d9bf0" }} />
        </Box>
      ) : (
        <div className="px-4 py-8 text-center">
          <h3 className="font-bold text-xl">No shares yet</h3>
          <p className="text-gray-500 mt-1">
            Posts you share will show up here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Shared;