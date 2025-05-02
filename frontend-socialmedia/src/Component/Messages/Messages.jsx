import React, { useState, useEffect, useRef } from "react";
import { 
  Box,
  Typography, 
  Avatar, 
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import GifIcon from "@mui/icons-material/Gif";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const Messages = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [messageGroups, setMessageGroups] = useState([]);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showConversation, setShowConversation] = useState(false);
  
  const currentUserId = localStorage.getItem("user_id");
  const accessToken = localStorage.getItem("access_token");

  // Check if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load users when component mounts
  useEffect(() => {
    loadUsers();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      if (selectedUser) {
        loadChatHistory(selectedUser.id, true);
      }
    }, 5000); // Poll every 5 seconds for new messages
    
    setPollInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  
  // Load messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      loadChatHistory(selectedUser.id);
      setShowConversation(true);
      
      // Clear any existing polling
      if (pollInterval) clearInterval(pollInterval);
      
      // Set up polling for new messages
      const interval = setInterval(() => {
        if (selectedUser) {
          loadChatHistory(selectedUser.id, true);
        }
      }, 5000);
      
      setPollInterval(interval);
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [selectedUser]);
  
  // Auto-scroll to the bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Group messages by date for better UI organization
  useEffect(() => {
    if (messages.length > 0) {
      const groups = groupMessagesByDate(messages);
      setMessageGroups(groups);
    } else {
      setMessageGroups([]);
    }
  }, [messages]);
  
  const loadUsers = async () => {
    setLoadingUsers(true);
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
      setLoadingUsers(false);
    }
  };
  
  const loadChatHistory = async (receiverId, checkNewOnly = false) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/chat/history?senderId=${currentUserId}&receiverId=${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        if (checkNewOnly) {
          // Kiểm tra tin nhắn mới và chỉ thêm những tin nhắn chưa có
          const newMessages = response.data.filter(
            newMsg => !messages.some(existingMsg => existingMsg.id === newMsg.id)
          );
          
          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
          }
        } else {
          // Thay thế hoàn toàn danh sách tin nhắn
          setMessages(response.data);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
      setError("Không thể tải tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      const response = await axios.post(
        `http://localhost:8080/api/chat/send?senderId=${currentUserId}&receiverId=${selectedUser.id}&content=${encodeURIComponent(newMessage)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        // Thêm tin nhắn mới vào danh sách tin nhắn hiện tại
        const newMsg = {
          id: Date.now().toString(), // Temporary ID until we refresh
          senderId: currentUserId,
          receiverId: selectedUser.id,
          content: newMessage,
          createdAt: new Date().toISOString(),
          read: false
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage(""); // Clear input after sending
        
        // Refresh messages to get the actual message from server
        setTimeout(() => {
          loadChatHistory(selectedUser.id);
        }, 500);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    }
  };
  
  const handleUserSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    
    setLoadingUsers(true);
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
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const groupMessagesByDate = (messages) => {
    // Đầu tiên, loại bỏ các tin nhắn trùng lặp dựa vào ID
    const uniqueMessages = [];
    const messageIds = new Set();
    
    // Sắp xếp tin nhắn theo thời gian tăng dần
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Loại bỏ tin nhắn trùng lặp
    sortedMessages.forEach((msg) => {
      if (!messageIds.has(msg.id)) {
        messageIds.add(msg.id);
        uniqueMessages.push(msg);
      }
    });
    
    // Gom nhóm các tin nhắn theo ngày
    const groups = [];
    uniqueMessages.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      const group = groups.find(g => g.date === date);
      if (group) {
        group.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    
    return groups;
  };
  
  const handleBack = () => {
    if (showConversation && isMobile) {
      setShowConversation(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Box className="h-full flex flex-col bg-black">
      {/* Header */}
      <Box className="flex justify-between items-center p-4 border-b border-gray-800">
        <Box className="flex items-center">
          <IconButton 
            onClick={handleBack} 
            className="mr-2 text-white"
            sx={{ color: 'white' }}
          >
            {isMobile && showConversation ? <ArrowBackIcon /> : <CloseIcon />}
          </IconButton>
          <Typography variant="h6" className="text-white">
            {selectedUser && showConversation 
              ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`
              : "Messages"
            }
          </Typography>
        </Box>
      </Box>

      {/* Mobile View: Toggle between conversations list and active chat */}
      {isMobile ? (
        <Box className="flex-grow overflow-hidden">
          {!showConversation ? (
            // Conversations List
            <Box className="h-full flex flex-col">
              <Box className="p-3">
                <form onSubmit={handleUserSearch}>
                  <TextField
                    fullWidth
                    placeholder="Search people"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'gray' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '9999px',
                        backgroundColor: '#202327',
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' }
                      },
                      input: { color: 'white' }
                    }}
                  />
                </form>
              </Box>

              <Box className="flex-grow overflow-auto">
                {loadingUsers ? (
                  <Box className="flex justify-center p-4">
                    <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
                  </Box>
                ) : users.length === 0 ? (
                  <Box className="p-4 text-center text-gray-500">
                    No users found
                  </Box>
                ) : (
                  <Box>
                    {users.map((user) => (
                      <Box 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
                      >
                        <Avatar 
                          src={user.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
                          alt={user.username} 
                          sx={{ width: 48, height: 48 }}
                          className="mr-3"
                        />
                        <Box>
                          <Typography className="font-bold text-white">
                            {`${user.firstName || ""} ${user.lastName || ""}`}
                          </Typography>
                          <Typography className="text-gray-500 text-sm">
                            @{user.username || ""}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            // Active Chat
            <ChatArea 
              selectedUser={selectedUser}
              loading={loading}
              error={error}
              messageGroups={messageGroups}
              currentUserId={currentUserId}
              messagesEndRef={messagesEndRef}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          )}
        </Box>
      ) : (
        // Desktop View: Show both conversations and active chat
        <Box className="flex-grow flex overflow-hidden">
          {/* Conversations List */}
          <Box className="w-2/5 border-r border-gray-800 overflow-hidden flex flex-col">
            <Box className="p-3">
              <form onSubmit={handleUserSearch}>
                <TextField
                  fullWidth
                  placeholder="Search people"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'gray' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9999px',
                      backgroundColor: '#202327',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' }
                    },
                    input: { color: 'white' }
                  }}
                />
              </form>
            </Box>

            <Box className="flex-grow overflow-auto">
              {loadingUsers ? (
                <Box className="flex justify-center p-4">
                  <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
                </Box>
              ) : users.length === 0 ? (
                <Box className="p-4 text-center text-gray-500">
                  No users found
                </Box>
              ) : (
                <Box>
                  {users.map((user) => (
                    <Box 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 ${selectedUser?.id === user.id ? 'bg-gray-800' : ''}`}
                    >
                      <Avatar 
                        src={user.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
                        alt={user.username} 
                        sx={{ width: 48, height: 48 }}
                        className="mr-3"
                      />
                      <Box>
                        <Typography className="font-bold text-white">
                          {`${user.firstName || ""} ${user.lastName || ""}`}
                        </Typography>
                        <Typography className="text-gray-500 text-sm">
                          @{user.username || ""}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Active Chat */}
          <Box className="w-3/5 flex flex-col">
            {selectedUser ? (
              <ChatArea 
                selectedUser={selectedUser}
                loading={loading}
                error={error}
                messageGroups={messageGroups}
                currentUserId={currentUserId}
                messagesEndRef={messagesEndRef}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
              />
            ) : (
              <Box className="flex-grow flex items-center justify-center text-gray-500">
                <Typography>Select a conversation to start messaging</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Separate component for the chat area
const ChatArea = ({ 
  selectedUser, 
  loading, 
  error, 
  messageGroups, 
  currentUserId, 
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleSendMessage
}) => {
  return (
    <Box className="h-full flex flex-col">
      {/* Messages Area */}
      <Box className="flex-grow overflow-auto p-4 bg-black">
        {loading && messageGroups.length === 0 ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
          </Box>
        ) : error ? (
          <Box className="flex justify-center items-center h-full">
            <Typography className="text-red-500">{error}</Typography>
          </Box>
        ) : messageGroups.length === 0 ? (
          <Box className="flex flex-col justify-center items-center h-full">
            <Avatar 
              src={selectedUser.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
              sx={{ width: 80, height: 80, mb: 2 }}
            />
            <Typography className="font-bold text-white mb-1">
              {`${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`}
            </Typography>
            <Typography className="text-gray-500 mb-2">
              @{selectedUser.username || ""}
            </Typography>
            <Typography className="text-gray-500 text-sm">
              Start a new conversation
            </Typography>
          </Box>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <Box key={groupIndex} className="mb-4">
              <Box className="flex justify-center mb-4">
                <Typography className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm">
                  {group.date}
                </Typography>
              </Box>
              
              {group.messages.map((message, msgIndex) => {
                const isCurrentUser = message.senderId === currentUserId;
                
                return (
                  <Box 
                    key={message.id}
                    className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <Box className="flex items-end">
                      {!isCurrentUser && (
                        <Avatar 
                          src={selectedUser.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
                          sx={{ width: 28, height: 28, mr: 1 }}
                          className="mb-1"
                        />
                      )}
                      
                      <Box 
                        className={`py-2 px-3 rounded-2xl max-w-xs break-words ${
                          isCurrentUser 
                            ? 'bg-twitter-blue text-white rounded-tr-none' 
                            : 'bg-gray-800 text-white rounded-tl-none'
                        }`}
                      >
                        <Typography>{message.content}</Typography>
                        <Typography className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input Area */}
      <Box className="p-3 border-t border-gray-800 bg-black">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <IconButton 
            size="small" 
            className="text-twitter-blue mr-2"
            sx={{ color: '#1d9bf0' }}
          >
            <ImageIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            className="text-twitter-blue mr-2"
            sx={{ color: '#1d9bf0' }}
          >
            <GifIcon fontSize="small" />
          </IconButton>
          
          <TextField
            fullWidth
            placeholder="Start a new message"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
                backgroundColor: '#202327',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' }
              },
              input: { color: 'white' }
            }}
          />
          
          <IconButton 
            size="small" 
            className="text-twitter-blue ml-2"
            sx={{ color: '#1d9bf0' }}
            disabled={!newMessage.trim()}
            type="submit"
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </form>
      </Box>
    </Box>
  );
};

export default Messages;