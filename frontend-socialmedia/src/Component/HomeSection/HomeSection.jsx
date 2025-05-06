import React, { useContext, useRef, useCallback } from "react";
import { Avatar, Button, CircularProgress, Tabs, Tab, Box, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import { useState, useEffect } from "react";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import TripleTCard from "./TripleTCard";
import axios from "axios";
import { formatAvatarUrl } from "../../utils/formatUrl";
import { UserContext } from "../Context/UserContext";

const validationSchema = Yup.object({
  content: Yup.string().required("TripleT text is Required"),
});

const HomeSection = () => {
  const { isPostLiked, getPostLikeId, fetchUserLikes } = useContext(UserContext);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [posting, setPosting] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [userAvatar, setUserAvatar] = useState("");
  const [userData, setUserData] = useState(null);

  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    fetchCurrentUser();
    fetchAllPosts();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const storedUserId = localStorage.getItem("user_id");

      const localAvatar = localStorage.getItem("user_avatar");
      if (localAvatar) {
        setUserAvatar(localAvatar);
      }

      if (!accessToken) return;

      if (storedUserId) {
        setCurrentUserId(storedUserId);

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
          if (!localAvatar && response.data.Data1?.avatarUrl) {
            setUserAvatar(response.data.Data1.avatarUrl);
          }
        }
      } else {
        const jwtPayload = accessToken.split(".")[1];
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

  const processPostData = (posts) => {
    if (!Array.isArray(posts)) return [];

    console.log("Processing post data, raw posts:", posts);

    return posts.map((post) => {
      // Use consistent post ID, don't mix IDs
      const postId = post.id || post.postId;
      const isLiked = postId ? isPostLiked(postId) : false;
      const likeId = postId ? getPostLikeId(postId) : null;
      
      // Keep user data consistent within the same post
      const userId = post.userId || (post.user && post.user.id);
      
      // Don't mix user data between posts
      const user = {
        ...(post.user || {}),
        id: userId,
        username: post.user?.username || post.userName || "user",
        firstName: post.user?.firstName || post.firstName || "",
        lastName: post.user?.lastName || post.lastName || "",
        avatarUrl: post.user?.avatarUrl || post.avatarUrl || 
                  "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg",
      };

      // Ensure we're not mixing content between posts
      return {
        ...post,
        id: postId,
        content: post.content || post.caption || "",
        user: user,
        userId: userId,
        mediaUrls: post.mediaUrls || [], // Don't create fake media URLs
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        shareCount: post.shareCount || 0,
        createdAt: post.createdAt || new Date().toISOString(),
        isLiked: isLiked,
        likeId: likeId,
      };
    });
  };

  const fetchAllPosts = async (pageNum = 0) => {
    if (pageNum === 0) {
      setLoading(true);
      setAllPosts([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      await fetchUserLikes();

      const homepageResponse = await axios.get(
        "http://localhost:8080/api/v1/homepage",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const allPostsResponse = await axios.get(
        `http://localhost:8080/api/v1/posts?page=${pageNum}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Homepage API Response:", homepageResponse.data);
      console.log("All Posts API Response:", allPostsResponse.data);

      if (
        homepageResponse.data &&
        homepageResponse.data.Status === 200 &&
        Array.isArray(homepageResponse.data.Data)
      ) {
        const rawHomepagePosts = processPostData(homepageResponse.data.Data);

        const userId = localStorage.getItem("user_id");
        if (userId) {
          const userPosts = rawHomepagePosts.filter(
            (post) => post.userId === userId
          );
          const followedUserPosts = rawHomepagePosts.filter(
            (post) => post.userId !== userId
          );
          setMyPosts(userPosts);
          setFollowingPosts(followedUserPosts);
        } else {
          setFollowingPosts(rawHomepagePosts);
        }
      }

      if (allPostsResponse.data && allPostsResponse.data.Status === 200) {
        let allPostsData = [];

        if (Array.isArray(allPostsResponse.data.Data)) {
          allPostsData = allPostsResponse.data.Data;
        } else if (
          allPostsResponse.data.Data &&
          Array.isArray(allPostsResponse.data.Data.posts)
        ) {
          allPostsData = allPostsResponse.data.Data.posts;
        } else if (
          allPostsResponse.data.Data &&
          allPostsResponse.data.Data.content &&
          Array.isArray(allPostsResponse.data.Data.content)
        ) {
          allPostsData = allPostsResponse.data.Data.content;
        }

        const rawAllPosts = processPostData(allPostsData);

        const uniquePostIds = new Set();
        const processedAllPosts = rawAllPosts.filter((post) => {
          const postId = post.id || post.postId;
          if (!postId || uniquePostIds.has(postId)) {
            return false;
          }
          uniquePostIds.add(postId);
          return true;
        });

        if (pageNum === 0) {
          setAllPosts(processedAllPosts);
        } else {
          setAllPosts(prevPosts => [...prevPosts, ...processedAllPosts]);
        }

        setHasMore(processedAllPosts.length > 0);

        console.log("Processed all unique posts:", processedAllPosts);
      } else {
        if (pageNum === 0) {
          setAllPosts([]);
        }
        setHasMore(false);
        if (pageNum === 0) {
          setError("Failed to fetch posts");
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (pageNum === 0) {
        setError("Error fetching posts. Please try again later.");
        setAllPosts([]);
      }
    } finally {
      if (pageNum === 0) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const refreshPosts = async () => {
    await fetchUserLikes();
    fetchAllPosts();
  };

  const loadMorePosts = () => {
    if (!hasMore || loading || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAllPosts(nextPage);
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
      formData.append("privacy", true);
      if (selectedImage) {
        formData.append("media", selectedImage);
      }
      const response = await axios.post(
        "http://localhost:8080/api/v1/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("API response:", response.data);
      if (response.data && response.data.Status === 200) {
        alert("Đăng bài thành công!");
        resetForm();
        setSelectedImage(null);
        setPreviewUrl("");
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
      case 0:
        return allPosts;
      case 1:
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
            src={formatAvatarUrl(userAvatar || userData?.avatarUrl)}
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
                  <span className="text-red-500">{formik.errors.content}</span>
                )}
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="max-h-60 rounded-lg"
                    />
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

      <Box sx={{ width: "100%", borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              color: "#9e9e9e",
            },
            "& .Mui-selected": {
              color: "#1d9bf0",
            },
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
          <>
            {getDisplayPosts().map((post, index) => {
              if (getDisplayPosts().length === index + 1) {
                return (
                  <div ref={lastPostElementRef} key={post.id || index}>
                    <TripleTCard post={post} />
                  </div>
                );
              } else {
                return <TripleTCard key={post.id || index} post={post} />;
              }
            })}
            {loadingMore && (
              <div className="flex justify-center my-5">
                <CircularProgress size={30} />
              </div>
            )}
          </>
        ) : (
          <Typography
            variant="body1"
            className="text-center my-5 text-gray-500"
          >
            {activeTab === 0
              ? "Chưa có bài viết nào."
              : "Không có bài viết nào từ người bạn theo dõi."}
          </Typography>
        )}
      </section>
    </div>
  );
};

export default HomeSection;
