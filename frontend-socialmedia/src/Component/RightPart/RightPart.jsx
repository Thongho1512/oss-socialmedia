import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Messages from "../Messages/Messages";

const RightPart = ({ onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [trends, setTrends] = useState([
    { id: 1, category: "Trending in Technology", tag: "#JavaScript", postsCount: 25400 },
    { id: 2, category: "Trending in Sports", tag: "#WorldCup", postsCount: 122000 },
    { id: 3, category: "Politics · Trending", tag: "#Election2024", postsCount: 85200 },
    { id: 4, category: "Entertainment · Trending", tag: "#StarWars", postsCount: 45800 },
    { id: 5, category: "Trending in Music", tag: "#NewAlbum", postsCount: 32100 },
  ]);
  const navigate = useNavigate();

  // Listen for message toggle event
  useEffect(() => {
    const handleToggleMessages = (event) => {
      if (event.detail.show) {
        setShowMessages(true);
      }
    };

    window.addEventListener('toggleMessages', handleToggleMessages);
    
    return () => {
      window.removeEventListener('toggleMessages', handleToggleMessages);
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8080/api/v1/users?keyword=${searchQuery}&page=1&size=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        setSearchResults(response.data.Data.users);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    } else {
      navigate(`/homepage/profile/${user.id}`, {
        state: {
          from: "rightpart",
          username: user.username,
          userId: user.id,
        },
      });
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleCloseMessages = () => {
    setShowMessages(false);
  };

  // Function to handle trend click and redirect to Google search
  const handleTrendClick = (trendTag) => {
    const searchQuery = encodeURIComponent(trendTag);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  return (
    <div className="h-full">
      {/* Search Bar */}
      <div className="sticky top-0 bg-black z-10 pt-1 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon sx={{ color: 'rgb(113, 118, 123)' }} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#202327] border-none text-white w-full py-3 pl-12 pr-4 rounded-full focus:bg-black focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Search"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-2 bg-black rounded-2xl border border-gray-800">
          <h2 className="font-bold text-xl px-4 py-3">Search Results</h2>
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex items-center px-4 py-3 hover:bg-gray-800 cursor-pointer"
            >
              <Avatar
                alt={user.username}
                src={user.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"}
                sx={{ width: 48, height: 48, mr: 2 }}
              />
              <div>
                <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography sx={{ color: 'rgb(113, 118, 123)' }}>
                  @{user.username}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={30} sx={{ color: '#1d9bf0' }} />
        </Box>
      )}

      {/* Trending Section */}
      {!isSearching && searchResults.length === 0 && (
        <div className="mt-4 bg-[#16181c] rounded-2xl overflow-hidden">
          <h2 className="font-bold text-xl px-4 py-3 border-b border-gray-800">Trends for you</h2>
          
          {trends.map(trend => (
            <div 
              key={trend.id}
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex items-start justify-between"
              onClick={() => handleTrendClick(trend.tag)}
            >
              <div>
                <p className="text-gray-500 text-xs">{trend.category}</p>
                <p className="font-bold my-0.5">{trend.tag}</p>
                <p className="text-gray-500 text-xs">{trend.postsCount.toLocaleString()} posts</p>
              </div>
              <button 
                className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 p-1.5 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent's onClick
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </button>
            </div>
          ))}
          
          <div className="px-4 py-3 text-blue-400 hover:bg-gray-800">
            <span>Show more</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 px-4 text-xs text-gray-500">
        <span className="mr-3 hover:underline cursor-pointer">Terms of Service</span>
        <span className="mr-3 hover:underline cursor-pointer">Privacy Policy</span>
        <span className="mr-3 hover:underline cursor-pointer">Cookie Policy</span>
        <span className="mr-3 hover:underline cursor-pointer">Accessibility</span>
        <span className="mr-3 hover:underline cursor-pointer">Ads info</span>
        <span className="mr-3 hover:underline cursor-pointer">More...</span>
        <div className="mt-1">© 2023 X Corp.</div>
      </div>

      {/* Messages Modal */}
      {showMessages && (
        <Box className="fixed inset-0 lg:absolute z-50 bg-black" sx={{ 
          top: { xs: 0, lg: 0 }, 
          right: { xs: 0, lg: 0 }, 
          left: { xs: 0, lg: 0 }, 
          bottom: { xs: 0, lg: 'auto' },
          height: { xs: '100vh', lg: '80vh' }, 
          width: { xs: '100%', lg: '100%' },
          transform: { xs: 'none', lg: 'translateY(60px)' },
          boxShadow: 3,
          borderRadius: { xs: 0, lg: 2 },
          overflow: 'hidden'
        }}>
          <Messages onClose={handleCloseMessages} />
        </Box>
      )}
    </div>
  );
};

export default RightPart;
