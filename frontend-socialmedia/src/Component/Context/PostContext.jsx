// import { createContext, useState, useEffect } from "react";
// import axios from "axios";

// export const PostContext = createContext();

// export const PostProvider = ({ children }) => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [pageInfo, setPageInfo] = useState({
//     pageNumber: 0,
//     pageSize: 5,
//     totalPages: 0,
//     totalElements: 0,
//   });

//   useEffect(() => {
//     fetchPosts();
//   }, []);

//   const fetchPosts = async (page = 0, size = 5) => {
//     try {
//       const accessToken = localStorage.getItem("access_token");

//       if (!accessToken) {
//         throw new Error("Access token not found");
//       }

//       const response = await axios.get(
//         `http://localhost:8080/api/v1/posts?page=${page}&size=${size}`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       console.log("Posts API Response:", response.data); // Log để debug

//       if (response.data.Status === 200) {
//         const { posts, pageNumber, pageSize, totalPages, totalElements } =
//           response.data.Data;
//         setPosts(posts);
//         setPageInfo({
//           pageNumber,
//           pageSize,
//           totalPages,
//           totalElements,
//         });
//       } else {
//         throw new Error(response.data.Message || "Failed to fetch posts");
//       }
//     } catch (err) {
//       console.error("Error fetching posts:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm để tải thêm posts (pagination)
//   const loadMorePosts = async () => {
//     if (pageInfo.pageNumber < pageInfo.totalPages - 1) {
//       await fetchPosts(pageInfo.pageNumber + 1, pageInfo.pageSize);
//     }
//   };

//   // Hàm để refresh posts
//   const refreshPosts = async () => {
//     setLoading(true);
//     await fetchPosts(0, pageInfo.pageSize);
//   };

//   return (
//     <PostContext.Provider
//       value={{
//         posts,
//         loading,
//         error,
//         pageInfo,
//         loadMorePosts,
//         refreshPosts,
//       }}
//     >
//       {children}
//     </PostContext.Provider>
//   );
// };
