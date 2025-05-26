import React, { useContext, useRef, useCallback } from "react";
import { Avatar, Button, CircularProgress, Tabs, Tab, Box, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import { useState, useEffect } from "react";
import TripleTCard from "./TripleTCard";
import axios from "axios";
import { formatAvatarUrl } from "../../utils/formatUrl";
import { UserContext } from "../Context/UserContext";

const validationSchema = Yup.object({
  content: Yup.string().required("TripleT text is Required"),
});

const HomeSection = () => {
  const { isPostLiked, getPostLikeId, fetchUserLikes } = useContext(UserContext);
  const postFormRef = useRef(null); // Add ref for the post form section

  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState([]);
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

  // Add event listener for scrolling to post form
  useEffect(() => {
    const scrollToPostForm = () => {
      if (postFormRef.current) {
        postFormRef.current.scrollIntoView({ behavior: 'smooth' });
        const contentInput = postFormRef.current.querySelector('input[name="content"]');
        if (contentInput) {
          contentInput.focus();
        }
      }
    };

    // Listen for custom event from Navigation component
    window.addEventListener('scrollToPostForm', scrollToPostForm);

    return () => {
      window.removeEventListener('scrollToPostForm', scrollToPostForm);
    };
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
      const postId = post.id || post.postId;
      const isLiked = postId ? isPostLiked(postId) : false;
      const likeId = postId ? getPostLikeId(postId) : null;
      
      const userId = post.userId || (post.user && post.user.id);
      
      const user = {
        ...(post.user || {}),
        id: userId,
        username: post.user?.username || post.userName || "user",
        firstName: post.user?.firstName || post.firstName || "",
        lastName: post.user?.lastName || post.lastName || "",
        avatarUrl: post.user?.avatarUrl || post.avatarUrl || 
                  "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg",
      };

      return {
        ...post,
        id: postId,
        content: post.content || post.caption || "",
        user: user,
        userId: userId,
        mediaUrls: post.mediaUrls || [],
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

      const allPostsResponse = await axios.get(
        `http://localhost:8080/api/v1/posts?page=${pageNum}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("All Posts API Response:", allPostsResponse.data);
      
      if (activeTab === 1 || pageNum === 0) {
        const homepageResponse = await axios.get(
          "http://localhost:8080/api/v1/homepage",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        console.log("Homepage API Response:", homepageResponse.data);
        
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

        const uniquePostsMap = new Map();
        rawAllPosts.forEach(post => {
          const postId = post.id || post.postId;
          if (postId) {
            uniquePostsMap.set(postId, post);
          }
        });
        
        const processedAllPosts = Array.from(uniquePostsMap.values());

        if (pageNum === 0) {
          setAllPosts(processedAllPosts);
        } else {
          setAllPosts(prevPosts => {
            const existingIds = new Set(prevPosts.map(p => p.id || p.postId));
            const newPosts = processedAllPosts.filter(p => !existingIds.has(p.id || p.postId));
            return [...prevPosts, ...newPosts];
          });
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

  const handleSelectMedia = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image"));
    const videoFiles = files.filter((file) => file.type.startsWith("video"));

    setSelectedImages((prev) => [...prev, ...imageFiles]);
    setPreviewUrls((prev) => [...prev, ...imageFiles.map((file) => URL.createObjectURL(file))]);

    setSelectedVideos((prev) => [...prev, ...videoFiles]);
    setVideoPreviewUrls((prev) => [...prev, ...videoFiles.map((file) => URL.createObjectURL(file))]);
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
      selectedImages.forEach((image) => formData.append("media", image));
      selectedVideos.forEach((video) => formData.append("media", video));

      const response = await axios.post(
        "http://localhost:8080/api/v1/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        refreshPosts();
        resetForm();
        setSelectedImages([]);
        setPreviewUrls([]);
        setSelectedVideos([]);
        setVideoPreviewUrls([]);
      }
    } catch (error) {
      console.error("Error creating post:", error);
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
      <section className={"pb-10"} ref={postFormRef}>        <div className="flex space-x-5 " ref={postFormRef}>
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
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <ImageIcon className="text-blue-500" />
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleSelectMedia}
                    />
                  </label>
                </div>
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24 mr-2 mb-2">
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          onClick={() => {
                            setSelectedImages((prev) => prev.filter((_, i) => i !== index));
                            setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {videoPreviewUrls.length > 0 && (
                  <div className="flex flex-wrap mt-4">
                    {videoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24 mr-2 mb-2">
                        <video
                          src={url}
                          controls
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          onClick={() => {
                            setSelectedVideos((prev) => prev.filter((_, i) => i !== index));
                            setVideoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}                <div className="flex justify-between items-center mt-5">
                  <div className="flex items-center">
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
          <Tab label="All POST" />
          <Tab label="FOLLOWING'S POST" />
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
                  <div ref={lastPostElementRef} key={`${post.id || post.postId}-${index}-lastRef`}>
                    <TripleTCard post={post} />
                  </div>
                );
              } else {
                return <TripleTCard key={`${post.id || post.postId}-${index}`} post={post} />;
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
