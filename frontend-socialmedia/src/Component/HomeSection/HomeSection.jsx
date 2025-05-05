import React from "react";
import { Avatar, Button, CircularProgress, Tabs, Tab, Box, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import { useState, useEffect } from "react";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import TripleTCard from "./TripleTCard";
import axios from "axios";

const validationSchema = Yup.object({
  content: Yup.string().required("TripleT text is Required"),
});

const HomeSection = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [posting, setPosting] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [userAvatar, setUserAvatar] = useState("");
  const [userData, setUserData] = useState(null);

  // Lấy thông tin user hiện tại và các bài viết
  useEffect(() => {
    fetchCurrentUser();
    fetchAllPosts();
  }, []);

  // Fetch thông tin người dùng hiện tại
  const fetchCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      // First check if user_id is already stored in localStorage
      const storedUserId = localStorage.getItem("user_id");
      
      // Check for locally stored avatar
      const localAvatar = localStorage.getItem('user_avatar');
      if (localAvatar) {
        setUserAvatar(localAvatar);
      }
      
      if (!accessToken) return;
      
      if (storedUserId) {
        // If we already have the user_id, use it directly
        setCurrentUserId(storedUserId);
        
        // Fetch additional user details
        const response = await axios.get(
          `http://localhost:8080/api/v1/users/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.data && response.data.Status === 200) {
          setUserData(response.data.Data1);
          // Set avatar URL if not already set from localStorage
          if (!localAvatar && response.data.Data1?.avatarUrl) {
            setUserAvatar(response.data.Data1.avatarUrl);
          }
        }
      } else {
        // If we don't have userId, we need to extract it from JWT token or use another endpoint
        // This is a temporary solution - recommend implementing a proper /users/me endpoint
        const jwtPayload = accessToken.split('.')[1];
        try {
          const payload = JSON.parse(atob(jwtPayload));
          if (payload.sub || payload.userId) {
            const userId = payload.sub || payload.userId;
            setCurrentUserId(userId);
            localStorage.setItem("user_id", userId);
          }
        } catch (e) {
          console.error("Error parsing JWT token:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Xử lý dữ liệu bài viết để đảm bảo định dạng đúng
  const processPostData = (posts) => {
    if (!Array.isArray(posts)) return [];
    
    console.log("Processing post data, raw posts:", posts);
    
    return posts.map(post => {
      // Xử lý dữ liệu người dùng
      const user = {
        // Nếu đã có thông tin user, giữ nguyên, nếu không thì tạo từ các trường riêng lẻ
        ...(post.user || {}),
        id: post.userId || (post.user && post.user.id),
        username: post.userName || (post.user && post.user.username) || "user",
        firstName: post.firstName || (post.user && post.user.firstName) || "",
        lastName: post.lastName || (post.user && post.user.lastName) || "",
        avatarUrl: post.avatarUrl || (post.user && post.user.avatarUrl) || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"
      };
      
      // Chuyển đổi các trường để khớp với cấu trúc mong đợi
      return {
        ...post,
        id: post.id || post.postId,
        content: post.content || post.caption || "",
        user: user,
        userId: post.userId || (post.user && post.user.id),
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        shareCount: post.shareCount || 0,
        createdAt: post.createdAt || new Date().toISOString()
      };
    });
  };

  // Fetch tất cả bài viết từ mọi người dùng
  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      // Fetch bài viết từ trang chủ (bao gồm cả bài của mình và người mình follow)
      const homepageResponse = await axios.get(
        "http://localhost:8080/api/v1/homepage",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Fetch tất cả bài viết (không phân biệt follow hay không)
      const allPostsResponse = await axios.get(
        "http://localhost:8080/api/v1/posts?page=0&size=50",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Homepage API Response:", homepageResponse.data);
      console.log("All Posts API Response:", allPostsResponse.data);

      // Xử lý bài viết từ homepage (cho tab Following)
      if (homepageResponse.data && homepageResponse.data.Status === 200 && Array.isArray(homepageResponse.data.Data)) {
        const rawHomepagePosts = processPostData(homepageResponse.data.Data);
        
        // Lọc bài viết của mình và người theo dõi
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const userPosts = rawHomepagePosts.filter(post => post.userId === userId);
          const followedUserPosts = rawHomepagePosts.filter(post => post.userId !== userId);
          setMyPosts(userPosts);
          setFollowingPosts(followedUserPosts);
        } else {
          setFollowingPosts(rawHomepagePosts);
        }
      }

      // Xử lý tất cả bài viết (cho tab All Posts)
      if (allPostsResponse.data && allPostsResponse.data.Status === 200) {
        let allPostsData = [];
        
        // Handle different response formats
        if (Array.isArray(allPostsResponse.data.Data)) {
          allPostsData = allPostsResponse.data.Data;
        } else if (allPostsResponse.data.Data && Array.isArray(allPostsResponse.data.Data.posts)) {
          allPostsData = allPostsResponse.data.Data.posts;
        } else if (allPostsResponse.data.Data && allPostsResponse.data.Data.content && Array.isArray(allPostsResponse.data.Data.content)) {
          allPostsData = allPostsResponse.data.Data.content;
        }
        
        const rawAllPosts = processPostData(allPostsData);
        
        // Loại bỏ các bài viết trùng lặp dựa trên ID
        const uniquePostIds = new Set();
        const processedAllPosts = rawAllPosts.filter(post => {
          const postId = post.id || post.postId;
          if (!postId || uniquePostIds.has(postId)) {
            return false; // Loại bỏ bài viết không có ID hoặc ID đã tồn tại
          }
          uniquePostIds.add(postId);
          return true;
        });
        
        setAllPosts(processedAllPosts);
        console.log("Processed all unique posts:", processedAllPosts);
      } else {
        setAllPosts([]);
        setError("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Error fetching posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh lại bài viết khi đăng bài thành công
  const refreshPosts = () => {
    fetchAllPosts();
  };

  const handleSelectImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setPosting(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("caption", values.content);
      formData.append("privacy", true); // hoặc false nếu muốn public
      if (selectedImage) {
        formData.append("media", selectedImage);
      }
      const response = await axios.post(
        "http://localhost:8080/api/v1/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // "Content-Type": "multipart/form-data", // axios sẽ tự động set
          },
        }
      );
      console.log("API response:", response.data);
      if (response.data && response.data.Status === 200) {
        alert("Đăng bài thành công!");
        resetForm();
        setSelectedImage(null);
        setPreviewUrl("");
        // Refresh posts after successful post
        refreshPosts();
      } else {
        alert("Đăng bài thất bại!");
      }
    } catch (error) {
      alert("Đăng bài thất bại!");
      console.error(error);
    } finally {
      setPosting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      content: "",
    },
    onSubmit: handleSubmit,
    validationSchema,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getDisplayPosts = () => {
    switch (activeTab) {
      case 0: // Tất cả bài viết
        return allPosts;
      case 1: // Bài viết từ người tôi theo dõi
        return followingPosts;
      default:
        return allPosts;
    }
  };

  return (
    <div className="space-y-5">
      <section className="">
        <h1 className="py-5 text-xl font-bold opacity-9">
          Welcome to the Home Page
        </h1>
      </section>
      <section className={"pb-10"}>
        <div className="flex space-x-5 ">
          <Avatar
            alt={userData?.username || "username"}
            src={userAvatar || (userData?.avatarUrl) || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"}
          />
          <div className="w-full">
            <form onSubmit={formik.handleSubmit}>
              <div>
                <input
                  type="text"
                  name="content"
                  placeholder="What's happening?"
                  className={"border-none outline-non text-xl bg-transparent"}
                  {...formik.getFieldProps("content")}
                  disabled={posting}
                />
                {formik.errors.content && formik.touched.content && (
                  <span className="text-red-500">
                    {formik.errors.content}
                  </span>
                )}
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="preview" className="max-h-60 rounded-lg" />
                  </div>
                )}
                <div className="flex justify-between items-center mt-5">
                  <div className="flex space-x-5 items-center">
                    <label className="flex item-center space-x-2 rounded-md cursor-pointer">
                      <ImageIcon className="text-[#1d9bf0]" />
                      <input
                        type="file"
                        name="imageFile"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSelectImage}
                        disabled={posting}
                      />
                    </label>
                    <FmdGoodIcon className="text-[#1d9bf0]" />
                    <TagFacesIcon className="text-[#1d9bf0]" />
                    <div>
                      <Button
                        sx={{
                          width: "100%",
                          borderRadius: "20px",
                          paddingY: "8px",
                          paddingX: "20px",
                          bgcolor: "#1e88e5",
                        }}
                        variant="contained"
                        type="submit"
                        disabled={posting}
                      >
                        {posting ? "Posting..." : "TripleT"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              color: '#9e9e9e', // Gray color for unselected tabs
            },
            '& .Mui-selected': {
              color: '#1d9bf0', // Blue color for selected tab
            }
          }}
        >
          <Tab label="TẤT CẢ BÀI VIẾT" />
          <Tab label="NGƯỜI TÔI THEO DÕI" />
        </Tabs>
      </Box>
      
      <section>
        {loading ? (
          <div className="flex justify-center my-5">
            <CircularProgress />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center my-5">{error}</p>
        ) : getDisplayPosts().length > 0 ? (
          getDisplayPosts().map((post, index) => <TripleTCard key={post.id || index} post={post} />)
        ) : (
          <Typography variant="body1" className="text-center my-5 text-gray-500">
            {activeTab === 0 ? "Chưa có bài viết nào." : 
             "Không có bài viết nào từ người bạn theo dõi."}
          </Typography>
        )}
      </section>
    </div>
  );
};

export default HomeSection;
