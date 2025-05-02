import React from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import Grid from "@mui/material/Grid"; 
import { Route, Routes } from "react-router-dom";
import Profile from "../Profile/Profile";
import LoginPage from "../LoginPage/LoginPage";
import TripleTDetails from "../TripleTDetails/TripleTDetails";


const HomePage = () => {
  return (
    <Grid container className="px-5 lg:px-36 justify-between">
      <Grid item xs={0} lg={2.5} className="hidden lg:block w-full relative">
        <Navigation />
      </Grid>
      <Grid item xs={12} lg={6} className="hidden lg:block w-full relative">
        <Routes>
          <Route path="/" element={<HomeSection />}> </Route>
          <Route path="/home" element={<HomeSection />}> </Route>
          <Route path="/profile/:id" element={<Profile />}> </Route>
          <Route path="/triplet/:id" element={<TripleTDetails />}> </Route>

        </Routes>
       
      </Grid>
      <Grid item xs={0} lg={3} className="hidden lg:block w-full relative">
        <RightPart />
       
      </Grid>
    </Grid>
  );
};

export default HomePage;
