import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useFormik } from "formik";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import "./ProfileModal.css";

const ProfileModal = ({ open, handleClose }) => {
  const [uploading, setUploading] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640); // sm breakpoint in Tailwind

  // Check screen size for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (values) => {
    console.log("handle_submit", values);
  };

  const formik = useFormik({
    initialValues: {
      fullName: "",
      website: "",
      location: "",
      bio: "",
      backgroundImage: "",
      image: "",
    },
    onSubmit: handleSubmit,
  });
  
  const handleImageChange = (event) => {
    setUploading(true);
    const { name } = event.target;
    const file = event.target.files[0];
    formik.setFieldValue(name, file);
    setUploading(false);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? '95%' : 600,
    maxWidth: '100%',
    bgcolor: "background.paper",
    border: "none",
    boxShadow: 24,
    p: isMobile ? 2 : 4,
    outline: "none",
    borderRadius: "4px",
    maxHeight: '90vh',
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IconButton onClick={handleClose} aria-label="delete">
                  <CloseIcon />
                </IconButton>
                <p className="text-sm sm:text-base">Edit Profile</p>
              </div>
              <Button type="submit" sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}>Save</Button>
            </div>

            <div className="hideScrollBar overflow-y-scroll overflow-x-hidden h-[50vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh]">
              <React.Fragment>
                <div className="w-full">
                  <div className="relative">
                    <img
                      className="w-full h-[8rem] sm:h-[10rem] md:h-[12rem] object-cover object-center"
                      src="https:media.istockphoto.com/id/1144142614/vi/anh/ng%E1%BA%AFm-nh%C3%ACn-b%E1%BA%A7u-tr%E1%BB%9Di-t%C3%ADm-bu%E1%BB%95i-t%E1%BB%91i-v%E1%BB%9Bi-nh%E1%BB%AFng-%C4%91%C3%A1m-m%C3%A2y-cirrus-v%C3%A0-nh%E1%BB%AFng-v%C3%AC-sao.jpg?s=612x612&w=0&k=20&c=G4NnRh1yHa6hr2TbeojspUeG9NBfRYUiNtRbc1dN0EM="
                      alt=""
                    />
                    <input
                      type="file"
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      name="backgroundImage"
                    />
                  </div>
                </div>

                <div className="w-full transform -translate-y-10 sm:-translate-y-15 md:-translate-y-20 m-1.4 h-[3rem] sm:h-[4rem] md:h-[6rem]">
                  <div className="relative">
                    <Avatar
                      sx={{
                        width: { xs: "5rem", sm: "7rem", md: "10rem" },
                        height: { xs: "5rem", sm: "7rem", md: "10rem" },
                        border: "4px solid white",
                      }}
                      src="http://res.cloudhttps:media.istockphoto.com/id/1144142614/vi/anh/ng%E1%BA%AFm-nh%C3%ACn-b%E1%BA%A7u-tr%E1%BB%9Di-t%C3%ADm-bu%E1%BB%95i-t%E1%BB%91i-v%E1%BB%9Bi-nh%E1%BB%AFng-%C4%91%C3%A1m-m%C3%A2y-cirrus-v%C3%A0-nh%E1%BB%AFng-v%C3%AC-sao.jpg?s=612x612&w=0&k=20&c=G4NnRh1yHa6hr2TbeojspUeG9NBfRYUiNtRbc1dN0EM=inary.com/dnbw84pgs/image/upload/v1696939851/instagram%20post/bywrth9y/14e88ayussts.png"
                    />
                    <input
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
                      style={{ maxWidth: isMobile ? '5rem' : '10rem' }}
                      onChange={handleImageChange}
                      name="image"
                      type="file"
                    />
                  </div>
                </div>
              </React.Fragment>
              <div className="space-y-3 mt-2 sm:mt-6">
                <TextField
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.fullName && Boolean(formik.errors.fullName)
                  }
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  id="bio"
                  name="bio"
                  label="Bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  error={formik.touched.bio && Boolean(formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  id="website"
                  name="website"
                  label="Website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.website && Boolean(formik.errors.website)
                  }
                  helperText={formik.touched.website && formik.errors.website}
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.location && Boolean(formik.errors.location)
                  }
                  helperText={formik.touched.location && formik.errors.location}
                  size={isMobile ? "small" : "medium"}
                />
                <div className="my-2 sm:my-3">
                  <p className="text-sm sm:text-lg">Birth date . Edit</p>
                  <p className="text-lg sm:text-2xl">October 26, 1999</p>
                </div>
                <p className="py-2 sm:py-3 text-sm sm:text-lg">Edit Professional Profile</p>
              </div>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

export default ProfileModal;
