import React from "react";
import { navigationMenu } from "./NavigationMenu";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, MenuItem, Menu } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const Navigation = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log("logout");
    handleClose();
  };
  return (
    <div className="h-screen sticky top-0 left-10 "> 
      <div className="py-5">
        <svg
          height="30"
          width="30"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="r-jwli3a r-4qtqp9 r-yyyyoo r-labpbf r-1777fci r-dnmrzs r-9q4qqr r-bnwqim r-1plcrui"
        >
          <g>
            <path d="M18.244 2.25h3.808l-7.227 8.26 2.6 8.502 11.241 16.171-5.214-6.817L99 21.75H.6817.73-8.8351.254 2.5H8.0814.713 6.231 2.1-161 17.521.83L17.084 4.126H5.117Z"></path>
          </g>
        </svg>
      </div>

      <div className="space-y-6">
        {navigationMenu.map((item) => (
          <div
            className="cursor-pointer flex space-x-3 items-center"
            onClick={() =>
              item.title === "Profile"
                ? navigate(`/profile/${5}`)
                : navigate(item.path)
            }
          >
            {item.icon}
            <p className="text-xl">{item.title}</p>
          </div>
        ))}
      </div>

      <div className="py-10">
        <Button
          sx={{
            width: "100%",
            borderRadius: "29px",
            py: "15px",
            bgcolor: "#1e88e5",
          }}
          variant="contained"
        >
          TripleT
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            alt="username"
            src="http://res.cloudinary.com/dnbw04gbs/image/upload/v1690639851/instagram%20post/bywtgh9vj4e80aywstss.png"
          />
          <div>
            <span>Nguyễn Văn Trường</span>
            <br />
            <span className="opacity-70">truong@gmail.com</span>
          </div>
        </div>

        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <MoreHorizIcon />
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleLogout}>Logout </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Navigation;
