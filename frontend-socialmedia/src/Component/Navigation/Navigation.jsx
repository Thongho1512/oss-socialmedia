import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, Button, MenuItem, Menu } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { AuthContext } from "../Context/AuthContext";
import { UserContext } from "../Context/UserContext";
import HomeIcon from "@mui/icons-material/Home";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsIcon from "@mui/icons-material/Settings";

const Navigation = ({ collapsed = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { userData } = useContext(UserContext);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleViewProfile = () => {
    handleClose();
    navigate(`/homepage/profile/${localStorage.getItem("user_id")}`, {
      state: { from: "navigation" },
    });
  };
  
  const isActive = (path) => {
    if (path === "" || path === "home") {
      return location.pathname === "/homepage" || location.pathname === "/homepage/home";
    }
    return location.pathname.includes(`/homepage/${path}`);
  };

  const navigationItems = [
    { 
      id: "home", 
      title: "Home", 
      icon: <HomeIcon fontSize={collapsed ? "small" : "medium"} />, 
      path: "/homepage/home" 
    },
    { 
      id: "messages", 
      title: "Messages", 
      icon: <MailOutlineIcon fontSize={collapsed ? "small" : "medium"} />, 
      path: "/homepage/messages" 
    },
    { 
      id: "profile", 
      title: "Profile", 
      icon: <PersonOutlineIcon fontSize={collapsed ? "small" : "medium"} />, 
      path: `/homepage/profile/${localStorage.getItem("user_id")}` 
    },
  ];

  const handleNavigate = (path) => {
    if (path.includes("messages")) {
      const event = new CustomEvent('toggleMessages', { detail: { show: true } });
      window.dispatchEvent(event);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="h-full flex flex-col py-2">
      {/* Logo */}
      <div className={`mb-4 ${collapsed ? 'px-2' : 'px-4'} py-2`}>
        <div className="w-10 h-10 rounded-full hover:bg-blue-900/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7 fill-white">
            <g>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </g>
          </svg>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`
              cursor-pointer px-3 py-3 rounded-full flex items-center 
              ${isActive(item.id) ? 'font-bold' : 'font-normal'} 
              ${!collapsed && 'hover:bg-gray-900'}
              ${collapsed ? 'justify-center mx-auto' : 'justify-start space-x-4 mx-1 pr-5'}
            `}
            onClick={() => handleNavigate(item.path)}
          >
            <div>{item.icon}</div>
            {!collapsed && <div>{item.title}</div>}
          </div>
        ))}
      </nav>

      {/* Post Button */}
      <div className={`mt-4 ${collapsed ? 'px-1' : 'px-3'}`}>
        <Button
          sx={{
            width: "100%",
            borderRadius: "9999px",
            py: 1.5,
            bgcolor: "#1d9bf0",
            color: "white",
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#1a8cd8"
            }
          }}
          variant="contained"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ) : (
            "Post"
          )}
        </Button>
      </div>

      {/* User Profile */}
      <div className="mt-auto mb-3">
        <div 
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-3 rounded-full hover:bg-gray-900 cursor-pointer`}
          onClick={handleClick}
        >
          <div className="flex items-center space-x-3">
            <Avatar
              alt={userData?.username || "User"}
              src={
                userData?.avatarUrl ||
                "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"
              }
              sx={{ width: 40, height: 40 }}
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm truncate max-w-[120px]">
                  {userData?.firstName || ""} {userData?.lastName || ""}
                </span>
                <span className="text-gray-500 text-xs">
                  @{userData?.username || "user"}
                </span>
              </div>
            )}
          </div>
          {!collapsed && <MoreHorizIcon />}
        </div>
      </div>
      
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        PaperProps={{
          sx: {
            bgcolor: '#000',
            border: '1px solid #333',
            color: 'white',
            mt: 1
          }
        }}
      >
        <MenuItem onClick={handleViewProfile}>View profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

export default Navigation;
