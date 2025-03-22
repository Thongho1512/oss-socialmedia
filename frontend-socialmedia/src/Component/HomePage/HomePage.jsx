import React from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import Grid from "@mui/material/Grid"; 
import { Route, Routes } from "react-router-dom";
import Profile from "../Profile/Profile";
import LoginPage from "../LoginPage/LoginPage";


const HomePage = () => {
  return (
    <Grid container className="px-5 lg:px-36 justify-between">
      <Grid item xs={0} lg={2.5} className="hidden lg:block w-full relative">
        <Navigation />
      </Grid>
      <Grid item xs={12} lg={6} className="hidden lg:block w-full relative">
        <Routes>
          <Route path="/" element={<HomeSection />}> </Route>
          <Route path="/profile/:id" element={<Profile />}> </Route>
         
             
         
        </Routes>
       
      </Grid>
      <Grid item xs={0} lg={3} className="hidden lg:block w-full relative">
        <RightPart />
        <LoginPage/>
      </Grid>
    </Grid>
  );
};

export default HomePage;
// import React from "react";
// import Navigation from "../Navigation/Navigation";
// import HomeSection from "../HomeSection/HomeSection";
// import RightPart from "../RightPart/RightPart";
// import Grid2 from "@mui/material/Grid2";

// const HomePage = () => {
//   return (
    
//     <Grid2 
//       container 
//       className="w-screen h-screen flex bg-white text-black justify-between "
//     >
//       {/* Sidebar (Navigation) */}
//       <Grid2 
//         item xs={3} 
//         className="h-full border-r border-gray-300 p-4"
//       >
//         <Navigation />
//       </Grid2>

//       {/* Nội dung chính */}
//       <Grid2 
//         item xs={6} 
//         className="h-full border-r border-gray-300 overflow-y-auto p-4"
//       >
//         <HomeSection />
//       </Grid2>

//       {/* Phần gợi ý bên phải */}
//       <Grid2 
//         item xs={3} 
//         className="h-full p-4"
//       >
//         <RightPart />
//       </Grid2>
//     </Grid2>
 
//   );
// };

// export default HomePage;
