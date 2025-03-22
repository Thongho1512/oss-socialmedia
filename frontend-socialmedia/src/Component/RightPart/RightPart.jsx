import React from 'react'

import Brightness4Icon from "@mui/icons-material/Brightness4";
import SearchIcon from "@mui/icons-material/Search";
import Buttton from "@mui/material/Button";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const RightPart = () => {
  

  const handleChangeTheme = () => {
   console.log("change theme")

  };

  return (
    <div className="py-5 sticky top-0 right-10 ">
      <div className="relative flex items-center">
        <input type="text" className="py-3 rounded-full text-gray-500 w-full pl-12" />

        <div className="absolute top-0 left-0 p-3 pt-3">
          <SearchIcon className="text-gray-500" />
        </div>
        <Brightness4Icon onClick={handleChangeTheme} className="cursor-pointer" />
      </div>

     <section className="my-5">
        <h1 className='text-xl font-bold'>.</h1>
        <h1 font-bold my-2 > Đăng kí đi</h1>
        <Buttton variant="contained" color="primary" sx={{padding : "10px , paddingX : 20px, borderRadius : 25px"}}> 
           Get Verified
        </Buttton>

     </section>
    <section className='mt-7 space-x-5'>
      <h1> what's happening? </h1>
      <div>
      <p className='text-sm'> phim phim </p>
      <p className='font-bold'> hàn quốc </p>

      </div>
      <div>
        <div className='flex justify-between w-full'>
        <p className='font-bold'>Entertainment , Trending </p>
        <p>34k fl </p>
        <MoreHorizIcon />
        
        </div>
      </div>
    </section>
    </div>
  );
};

export default RightPart;


