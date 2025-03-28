import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import NotificationIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Message";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GroupIcon from "@mui/icons-material/Group";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PendingIcon from "@mui/icons-material/Pending";

export const navigationMenu = [
  {
    title: "Home",
    icon: <HomeIcon />,
    path: "/home",
  },
 

  {
    title: "Messages",
    icon: <MessageIcon />,
    path: "/messages",
  },
  {
    title: "Lists Friends",
    icon: <ListAltIcon />,
    path: "/lists",
  },

 
  {
    title: "Profile",
    icon: <AccountCircleIcon />,
    path: "/profile",
  },

];
