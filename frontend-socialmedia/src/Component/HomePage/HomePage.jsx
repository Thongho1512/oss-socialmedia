import React, { useState } from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import Grid from "@mui/material/Grid";
import { Routes, Route } from "react-router-dom";
import Profile from "../Profile/Profile";
import TripleTDetails from "../TripleTDetails/TripleTDetails"; // Import the new component
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Grid container className="max-w-7xl mx-auto">
        {/* Left Navigation Column - Collapsed on mobile */}
        <Grid 
          item 
          xs={1} 
          md={3} 
          lg={2.5} 
          xl={2.5}
          className="sticky top-0 h-screen border-r border-gray-800"
        >
          <div className={`h-full ${isMobile ? 'px-1' : 'px-4'}`}>
            <Navigation collapsed={isMobile} />
          </div>
        </Grid>

        {/* Main Content Column */}
        <Grid 
          item 
          xs={11} 
          md={isTablet ? 9 : 6} 
          lg={6}
          xl={5.5}
          className="border-r border-gray-800"
        >
          <div className="min-h-screen">
            {selectedUser ? (
              <Profile 
                userData={selectedUser} 
                onBack={handleClearSelectedUser} 
              />
            ) : (
              <Routes>
                <Route path="" element={<HomeSection />} />
                <Route path="home" element={<HomeSection />} />
                <Route path="profile/:id" element={<Profile />} />
                <Route path="triplet/:postId" element={<TripleTDetails />} /> {/* Add route for TripleTDetails */}
              </Routes>
            )}
          </div>
        </Grid>

        {/* Right Column - Hidden on mobile and tablet */}
        <Grid 
          item 
          lg={3.5} 
          xl={4}
          className="hidden lg:block sticky top-0 h-screen"
        >
          <div className="px-6 py-2 h-full">
            <RightPart onUserSelect={handleUserSelect} />
          </div>
        </Grid>
      </Grid>
      
      {/* Mobile compose button (fixed) */}
      <div className="fixed bottom-20 right-5 md:right-8 lg:hidden">
        <button className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
