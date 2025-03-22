import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import { Button, MenuItem, Menu } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import { FavoriteBorder, FavoriteOutlined } from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const TripleTCard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDeleteTripleT = () => {
    console.log("delete tripleT");
    handleClose();
  };
  const handleOpenReplyModel = () => {
    console.log("open model");
  };

  const handleCreateTripleT = () => {
    console.log("handle create retweet");
  };

  const handleLikeTipleT = () => {
    console.log("handle like tweet");
  };

  return (
    <div className="flex space-x-5">
      <Avatar
        onclick={() => navigate("/profile/{6}")}
        className="cursor-pointer"
        alt="username"
        src="https://yt3.ggpht.com/MKAbGjzzrPfP1n1NH9wNHSN9HR3dTugpNEpg5bBGvznkWKuGU5xPP7ckH0hBqGl4V3FEXH_B=s48-c-k-c0x00ffffff-no-rj"
      />
      <div className="w-full">
        <div className="flex justify-between item-center">
          <div className="flex cursor-pointer items-center space-x-2">
            <span className="font-semibold">Thắng Gấp</span>
            <span className="text-gray-600">@thanggap . 2m </span>
          </div>
          <div>
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
              <MenuItem onClick={handleDeleteTripleT}>Delete TripleT</MenuItem>
            </Menu>
          </div>
        </div>
        <div className="mt-2">
          <div className="cursor-pointer">
            <p className=" mb-2 p-0 ">ví dụ hoihoi</p>
            <img
              src="https://yt3.ggpht.com/MKAbGjzzrPfP1n1NH9wNHSN9HR3dTugpNEpg5bBGvznkWKuGU5xPP7ckH0hBqGl4V3FEXH_B=s48-c-k-c0x00ffffff-no-rj"
              alt=""
              className="w-[28rem] border border-gray-300 p-5 rounded-md"
            />
          </div>
          <div className="py-5 flex flex-wrap justify-between items-center">
            <div className="space-x-3 flex items-center text-gray-600">
              <ChatBubbleOutlineIcon className="cursor-pointer" onClick={handleOpenReplyModel} />
              <p>43</p>
            </div>

            <div className={`${true ? "text-pink-600" : "text-gray-600"} space-x-3 flex items-center`} >
              <RepeatIcon onClick={handleCreateTripleT} className="cursor-pointer" />
              <p>54</p>
            </div>

            <div className={`${true ? "text-pink-600" : "text-gray-600"} space-x-3 flex items-center`}>

              {true ? <FavoriteIcon onClick={handleLikeTipleT} className="cursor-pointer"/> : <FavoriteOutlined onClick={handleLikeTipleT} className="cursor-pointer"/>}
              <p>54</p>                      
            </div>

            <div className="space-x-3 flex items-center text-gray-600">
              <BarChartIcon  className="cursor-pointer" onClick={handleOpenReplyModel} />
              <p>4300</p>
            </div>

            <div className="space-x-3 flex items-center text-gray-600">
              <FileUploadIcon className="cursor-pointer" onClick={handleOpenReplyModel} />
        
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripleTCard;
