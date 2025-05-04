import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useFormik } from "formik";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { CircularProgress, Snackbar, Alert, Divider, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import axios from "axios";
import * as Yup from "yup";
import "./ProfileModal.css";

const ProfileModal = ({ open, handleClose, userData, onProfileUpdate }) => {
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640); // sm breakpoint in Tailwind
  const [notification, setNotification] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Validation schema for form fields
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    phoneNumber: Yup.string().matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
    gender: Yup.string().oneOf(["MALE", "FEMALE", "OTHER"], "Invalid gender selection"),
  });

  // Validation schema for password change
  const passwordValidationSchema = Yup.object({
    password: Yup.string()
      .required("Password is required")
      .min(4, "Password should be at least 4 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Check screen size for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user data when modal opens
  React.useEffect(() => {
    if (open && userData) {
      // Split full name into first and last name if we have fullName but not firstName/lastName
      formik.resetForm({
        values: {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          username: userData.username || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          gender: userData.gender || "OTHER",
          backgroundImage: null,
          image: null,
          // Keep the ID for the API call
          id: userData.id || "",
          // Keep any other fields that might be needed for the API
          isPrivate: userData.isPrivate || false,
          roles: userData.roles || ["user"],
          createdAt: userData.createdAt || null,
          createdBy: userData.createdBy || null
        }
      });

      // Reset password form
      passwordFormik.resetForm({
        values: {
          password: "",
          confirmPassword: "",
        }
      });
    }
  }, [open, userData]);

  const handleSubmit = async (values) => {
    console.log("Submitting updated profile:", values);
    setLoading(true);

    try {
      // Get access token from local storage
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Create the request payload from form values
      const payload = {
        id: values.id,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        isPrivate: values.isPrivate,
        roles: values.roles,
        createdAt: values.createdAt,
        createdBy: values.createdBy
      };

      // Call the API to update user profile
      const response = await axios.put(
        "http://localhost:8080/api/v1/users",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
        }
      );

      console.log("Profile update response:", response.data);

      // Show success notification
      setNotification({
        open: true,
        message: "Profile updated successfully!",
        severity: "success"
      });

      // Notify parent component that profile was updated
      if (onProfileUpdate) {
        onProfileUpdate(response.data.Data || values);
      }

      // Close the modal after successful update
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Show error notification with appropriate message
      const errorMessage = error.response?.data?.Message || error.message || "Failed to update profile. Please try again.";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    console.log("Submitting password change request");
    setPasswordLoading(true);

    try {
      // Get access token from local storage
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Create the request payload for password change
      const payload = {
        id: userData.id, 
        password: values.password,
        comfirmPassword: values.password // Using the exact same value to ensure they match
      };

      console.log("User data:", userData);
      console.log("Sending password change payload:", JSON.stringify(payload));

      // Call the API to change password
      const response = await axios.patch(
        "http://localhost:8080/api/v1/users/change-pwd",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
        }
      );

      console.log("Password change response:", response.data);

      if (response.data) {
        // Show success notification
        setNotification({
          open: true,
          message: response.data.Message || "Mật khẩu đã được thay đổi thành công!",
          severity: "success"
        });

        // Reset password form
        passwordFormik.resetForm();

        try {
          // Get user credentials to re-authenticate with new password
          const username = userData.username || userData.email;
          
          // Call login API with new password to get fresh token
          const loginResponse = await axios.post(
            "http://localhost:8080/api/v1/auth/login",
            {
              username: username,
              password: values.password
            }
          );
          
          if (loginResponse.data && loginResponse.data.access_token) {
            // Update token in localStorage
            localStorage.setItem("access_token", loginResponse.data.access_token);
            
            // Optionally update user_id if it's returned in the response
            if (loginResponse.data.user && loginResponse.data.user.id) {
              localStorage.setItem("user_id", loginResponse.data.user.id);
            }
            
            console.log("Authentication refreshed with new credentials");
            
            setNotification({
              open: true,
              message: "Mật khẩu đã được thay đổi và phiên đăng nhập đã được làm mới!",
              severity: "success"
            });
          }
        } catch (loginError) {
          console.error("Error refreshing authentication:", loginError);
          
          // If re-authentication fails, prompt the user to log out
          setTimeout(() => {
            const shouldLogout = window.confirm("Mật khẩu đã được thay đổi. Bạn có muốn đăng nhập lại không?");
            if (shouldLogout) {
              localStorage.clear();
              window.location.href = "/auth/login";
            }
          }, 1000);
        }
      } else {
        throw new Error("Phản hồi không mong đợi từ máy chủ");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      
      const errorMessage = error.response?.data?.Message || error.message || "Không thể thay đổi mật khẩu. Vui lòng thử lại.";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      gender: "OTHER",
      backgroundImage: null,
      image: null,
      // Hidden fields needed for API
      id: "",
      isPrivate: false,
      roles: ["user"],
      createdAt: null,
      createdBy: null
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });
  
  const passwordFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: ""
    },
    validationSchema: passwordValidationSchema,
    onSubmit: handlePasswordChange,
  });
  
  const handleImageChange = (event) => {
    setUploading(true);
    const { name } = event.target;
    const file = event.target.files[0];
    
    if (file) {
      // Convert the file to Base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        // Store in formik state for current session
        formik.setFieldValue(name, file);
        
        // Save to localStorage for persistence
        if (name === 'image') {
          localStorage.setItem('user_avatar', base64String);
          // Update context or state to reflect avatar change immediately
          if (onProfileUpdate) {
            const updatedData = {
              ...userData,
              avatarUrl: base64String
            };
            onProfileUpdate(updatedData);
          }
        } else if (name === 'backgroundImage') {
          localStorage.setItem('user_cover', base64String);
          // Update context or state to reflect cover change immediately
          if (onProfileUpdate) {
            const updatedData = {
              ...userData,
              coverUrl: base64String
            };
            onProfileUpdate(updatedData);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    
    setUploading(false);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({...notification, open: false});
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? '95%' : 600,
    maxWidth: '100%',
    bgcolor: "#000000",
    border: "1px solid #333",
    boxShadow: 24,
    p: isMobile ? 2 : 4,
    outline: "none",
    borderRadius: "4px",
    maxHeight: '90vh',
    color: "#fff"
  };

  const darkInputProps = {
    sx: { 
      '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': {
          borderColor: '#333',
        },
        '&:hover fieldset': {
          borderColor: '#666',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#1d9bf0',
        }
      },
      '& .MuiInputLabel-root': {
        color: 'gray'
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#1d9bf0'
      },
      '& .MuiFormHelperText-root': {
        color: 'rgb(244, 67, 54)'
      }
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={(loading || passwordLoading) ? null : handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <IconButton onClick={handleClose} aria-label="close" disabled={loading || passwordLoading} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
              <p className="text-sm sm:text-base">Edit Profile</p>
            </div>
            <Button 
              onClick={formik.handleSubmit}
              disabled={loading}
              sx={{ 
                fontSize: isMobile ? '0.75rem' : 'inherit',
                color: '#fff',
                backgroundColor: loading ? 'transparent' : '#1d9bf0',
                '&:hover': {
                  backgroundColor: loading ? 'transparent' : '#1a8cd8'
                }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#1d9bf0' }} /> : "Save"}
            </Button>
          </div>

          <div className="hideScrollBar overflow-y-scroll overflow-x-hidden h-[50vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh]">
            <React.Fragment>
              <div className="w-full">
                <div className="relative">
                  <img
                    className="w-full h-[8rem] sm:h-[10rem] md:h-[12rem] object-cover object-center"
                    src={userData?.coverUrl || "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000"}
                    alt="Cover background"
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
                      border: "4px solid black",
                    }}
                    src={userData?.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"}
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
              {/* First Name Field */}
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                size={isMobile ? "small" : "medium"}
                {...darkInputProps}
              />
              
              {/* Last Name Field */}
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                size={isMobile ? "small" : "medium"}
                {...darkInputProps}
              />
              
              {/* Username Field */}
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                size={isMobile ? "small" : "medium"}
                {...darkInputProps}
              />
              
              {/* Email Field */}
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                size={isMobile ? "small" : "medium"}
                {...darkInputProps}
              />
              
              {/* Phone Number Field */}
              <TextField
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                size={isMobile ? "small" : "medium"}
                {...darkInputProps}
              />
              
              {/* Gender Selection */}
              <FormControl 
                fullWidth 
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#666',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1d9bf0',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'gray'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1d9bf0'
                  },
                  '& .MuiSelect-icon': {
                    color: 'gray'
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgb(244, 67, 54)'
                  }
                }}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  label="Gender"
                >
                  <MenuItem value="MALE" sx={{ color: 'white', backgroundColor: '#000', '&:hover': { backgroundColor: '#222' } }}>Male</MenuItem>
                  <MenuItem value="FEMALE" sx={{ color: 'white', backgroundColor: '#000', '&:hover': { backgroundColor: '#222' } }}>Female</MenuItem>
                  <MenuItem value="OTHER" sx={{ color: 'white', backgroundColor: '#000', '&:hover': { backgroundColor: '#222' } }}>Other</MenuItem>
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
              
              {/* Password Change Section */}
              <div className="mt-6 mb-4">
                <Divider sx={{ bgcolor: '#333', mb: 2 }} />
                
                <Accordion 
                  sx={{
                    bgcolor: '#121212',
                    color: 'white',
                    '&:before': {
                      display: 'none',
                    },
                    border: '1px solid #333',
                    borderRadius: '4px',
                    '&.Mui-expanded': {
                      margin: 0,
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    aria-controls="password-change-content"
                    id="password-change-header"
                    sx={{
                      '&.Mui-expanded': {
                        minHeight: 48,
                        borderBottom: '1px solid #333'
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <LockIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 'bold' }}>Change Password</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="space-y-3">
                      {/* Password Field */}
                      <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="New Password"
                        type="password"
                        value={passwordFormik.values.password}
                        onChange={passwordFormik.handleChange}
                        error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                        helperText={passwordFormik.touched.password && passwordFormik.errors.password}
                        size={isMobile ? "small" : "medium"}
                        {...darkInputProps}
                      />
                      
                      {/* Confirm Password Field */}
                      <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                        helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                        size={isMobile ? "small" : "medium"}
                        {...darkInputProps}
                      />
                      
                      <div className="flex justify-end mt-3">
                        <Button 
                          onClick={passwordFormik.handleSubmit}
                          disabled={passwordLoading}
                          sx={{ 
                            fontSize: isMobile ? '0.75rem' : 'inherit',
                            color: '#fff',
                            backgroundColor: passwordLoading ? 'transparent' : '#1d9bf0',
                            '&:hover': {
                              backgroundColor: passwordLoading ? 'transparent' : '#1a8cd8'
                            }
                          }}
                        >
                          {passwordLoading ? <CircularProgress size={20} sx={{ color: '#1d9bf0' }} /> : "Update Password"}
                        </Button>
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
      
      {/* Notification for success/error */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%', backgroundColor: notification.severity === 'success' ? '#004D40' : '#311B92', color: 'white' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ProfileModal;
