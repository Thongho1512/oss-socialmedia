import React, { useState, useEffect } from "react";
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  ListItemButton,
  Avatar, 
  Typography, 
  Paper, 
  Box,
  Divider,
  IconButton,
  TextField,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const UsersList = ({ visible, onClose, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const accessToken = localStorage.getItem("access_token");
  
  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/users?size=20",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data && response.data.Status === 200) {
        setUsers(response.data.Data.users || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/users?keyword=${searchQuery}&size=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data && response.data.Status === 200) {
        setUsers(response.data.Data.users || []);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error);
      setError("Không thể tìm kiếm người dùng");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUserSelect = (user) => {
    onSelectUser(user);
  };
  
  if (!visible) return null;
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'absolute', 
        bottom: '100%', 
        right: 0, 
        width: '330px',
        height: '400px',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#1e88e5',
        color: 'white',
      }}>
        <Typography variant="subtitle1">Danh sách người dùng</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Search box */}
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
      
      <Divider />
      
      {/* Users list */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>Không tìm thấy người dùng nào</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <ListItemButton
                  onClick={() => handleUserSelect(user)}
                  sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, py: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={user.username} 
                      src={user.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"}
                      sx={{ width: 32, height: 32 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName || ""} ${user.lastName || ""}`}
                    secondary={`@${user.username || ""}`}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItemButton>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default UsersList;