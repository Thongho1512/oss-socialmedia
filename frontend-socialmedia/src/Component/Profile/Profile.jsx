import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import { Button } from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useState } from "react";
import TripleTCard from "../HomeSection/TripleTCard"; // Adjust the path based on your project structure
 






const Profile = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);
  const handleOpenProfileModel = () => {
    console.log("open profile model");
  };
  const handleFollowUser = () => {
    console.log("follow user");
  };
    const [tabValue,setTabValue] = useState("1");
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if(newValue === "4"){
            console.log("4")
        }
            else if(newValue === "1"){
                console.log("user triplet")
            }
        
        }
  return (
    <div>
      <section className={"z-50 flex items-center sticky top-0 bg-opacity-95"}>
        <KeyboardBackspaceIcon
          className="cursor-pointer"
          onclick={handleBack}
        />
        <h1 className="py-5 text-xl font-bold opacity-90 ml-5">
          Welcome to the Profile Page
        </h1>
      </section>
      <section>
        <img
          className="w-[100%] h-[15rem] object-cover"
          src="https:media.istockphoto.com/id/1144142614/vi/anh/ng%E1%BA%AFm-nh%C3%ACn-b%E1%BA%A7u-tr%E1%BB%9Di-t%C3%ADm-bu%E1%BB%95i-t%E1%BB%91i-v%E1%BB%9Bi-nh%E1%BB%AFng-%C4%91%C3%A1m-m%C3%A2y-cirrus-v%C3%A0-nh%E1%BB%AFng-v%C3%AC-sao.jpg?s=612x612&w=0&k=20&c=G4NnRh1yHa6hr2TbeojspUeG9NBfRYUiNtRbc1dN0EM="
          alt=""
        />
      </section>
      <section className="pl-6">
        <div className="flex justify-between items-start mt-5 h-[5rem] ">
          <Avatar
            className="transform -translate-y-24"
            alt="thang-gap "
            src="https:media.istockphoto.com/id/1144142614/vi/anh/ng%E1%BA%AFm-nh%C3%ACn-b%E1%BA%A7u-tr%E1%BB%9Di-t%C3%ADm-bu%E1%BB%95i-t%E1%BB%91i-v%E1%BB%9Bi-nh%E1%BB%AFng-%C4%91%C3%A1m-m%C3%A2y-cirrus-v%C3%A0-nh%E1%BB%AFng-v%C3%AC-sao.jpg?s=612x612&w=0&k=20&c=G4NnRh1yHa6hr2TbeojspUeG9NBfRYUiNtRbc1dN0EM="
            sx={{ width: "10rem", height: "10rem", border: "4px solid white" }}
          />
          {true? (
            <Button
              onClick={handleOpenProfileModel}
              variant="contained"
              sx={{ borderRadius: "20px" }}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={handleFollowUser}
              variant="contained"
              sx={{ borderRadius: "20px" }}
            >
              {true ? "Follow" : "Unfollow"}
            </Button>
          )}
        </div>
        <div>
          <div className="flex items-center">
            <h1 className="font-bold text-lg">Thang Gap   </h1>

            
          </div>
          <h1 className="text-gray-500">@thanggap . 2m </h1>
        </div>
        <div className=" mt-2 space-y-3">
          <p> heloo, im code with thangap </p>
          <div className="py-1 flex space-x-5">
            <div className="flex items-center text-gray-500 ">
              <BusinessCenterIcon />
              <p className="ml-2"> Education </p>
            </div>
            <div className="flex  items-center  text-gray-500 ">
              <LocationOnIcon />
              <p className="ml-2"> Ho Chi Minh </p>
            </div>
            <div className="flex  items-center  text-gray-500 ">
              <CalendarMonthIcon />
              <p className="ml-2"> Joined Jun 2022 </p>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-1 font-semibold">
              <span>198</span>
              <span className="text-gray-500">Following</span>
            </div>
          

          <div className="flex items-center space-x-1 font-semibold">
            <span>509</span>
            <span className="text-gray-500">Followers</span>
          </div>
          </div>
        </div>
      </section>
       <Box sx={{ width: '100%', typography: 'body1' }} >  
    <TabContext value={tabValue}>  
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} >  
            <TabList onChange={handleTabChange} aria-label="lab API tabs example">  
                <Tab label="Posted" value="1" />  
                <Tab label="Friend" value="2" />  
                <Tab label="Likes" value="3" />  
            </TabList>  
        </Box>  
        <TabPanel value="1">   {[1,1,1,1,1].map((item)=> <TripleTCard/>)} </TabPanel>  
        <TabPanel value="2">Item Two</TabPanel>  
        <TabPanel value="3">Item Three</TabPanel>  
    </TabContext>  
</Box>  
      <section>
        
      </section>
    </div>
  );
};

export default Profile;
