import React, { useState, useEffect, useRef } from "react";
import { 
  Box,
  Typography, 
  Avatar, 
  TextField,
  IconButton,
  CircularProgress,
  Divider
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const Messages = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [messageGroups, setMessageGroups] = useState([]);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showConversation, setShowConversation] = useState(false);
  
  // Lấy ID người dùng hiện tại từ localStorage
  const currentUserId = localStorage.getItem("user_id");
  const accessToken = localStorage.getItem("access_token");

  // Kiểm tra xem có đang ở chế độ mobile không
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Tải danh sách người dùng khi component được mount
  useEffect(() => {
    loadUsers();
    
    // Thiết lập polling để cập nhật tin nhắn mới
    const interval = setInterval(() => {
      if (selectedUser) {
        loadChatHistory(selectedUser.id, true);
      }
    }, 5000); // Polling mỗi 5 giây
    
    setPollInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  
  // Tải tin nhắn khi người dùng được chọn
  useEffect(() => {
    if (selectedUser) {
      loadChatHistory(selectedUser.id);
      setShowConversation(true);
      
      // Xóa polling hiện tại
      if (pollInterval) clearInterval(pollInterval);
      
      // Thiết lập polling mới cho cuộc trò chuyện này
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
  
  // Nhóm tin nhắn theo ngày
  useEffect(() => {
    if (messages.length > 0) {
      const groups = groupMessagesByDate(messages);
      setMessageGroups(groups);
    } else {
      setMessageGroups([]);
    }
  }, [messages]);
  
  // Tải danh sách người dùng
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
        // Lọc danh sách người dùng để loại bỏ người dùng hiện tại
        const allUsers = response.data.Data.users || [];
        const filteredUsers = allUsers.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Tải lịch sử tin nhắn
  const loadChatHistory = async (receiverId, checkNewOnly = false) => {
    setLoading(true);
    try {
      // Gọi đồng thời cả hai chiều của API để lấy toàn bộ tin nhắn
      const [sentResponse, receivedResponse] = await Promise.all([
        // Tin nhắn gửi đi (từ người dùng hiện tại đến người nhận)
        axios.get(
          `http://localhost:8080/api/chat/history?senderId=${currentUserId}&receiverId=${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        ),
        // Tin nhắn nhận được (từ người nhận gửi đến người dùng hiện tại)
        axios.get(
          `http://localhost:8080/api/chat/history?senderId=${receiverId}&receiverId=${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      ]);
      
      console.log("API sent messages:", sentResponse.data);
      console.log("API received messages:", receivedResponse.data);
      console.log("Current User ID:", currentUserId);
      
      // Kết hợp tin nhắn từ cả hai chiều
      let combinedMessages = [];
      
      if (sentResponse.data && Array.isArray(sentResponse.data)) {
        combinedMessages = [...combinedMessages, ...sentResponse.data];
      }
      
      if (receivedResponse.data && Array.isArray(receivedResponse.data)) {
        combinedMessages = [...combinedMessages, ...receivedResponse.data];
      }
      
      // Đảm bảo rằng nội dung tin nhắn được định dạng đúng
      const formattedMessages = combinedMessages.map(msg => {
        return {
          ...msg,
          content: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content
        };
      });
      
      console.log("Combined formatted messages:", formattedMessages);
      
      if (checkNewOnly) {
        // Chỉ thêm tin nhắn mới nếu không tồn tại
        const newMessages = formattedMessages.filter(
          newMsg => !messages.some(existingMsg => existingMsg.id === newMsg.id)
        );
        
        if (newMessages.length > 0) {
          setMessages(prev => {
            // Kết hợp tin nhắn hiện có với tin nhắn mới và sắp xếp theo thời gian
            const combined = [...prev, ...newMessages];
            return combined.sort((a, b) => 
              new Date(a.createdAt) - new Date(b.createdAt)
            );
          });
        }
      } else {
        // Sắp xếp tin nhắn theo thời gian tăng dần
        const sortedMessages = formattedMessages.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Lỗi khi tải tin nhắn:", error);
      setError("Không thể tải tin nhắn. Vui lòng thử lại sau.");
      // Nếu có lỗi, thử sử dụng API tổng hợp
      try {
        const fallbackResponse = await axios.get(
          `http://localhost:8080/api/chat/history`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        console.log("Fallback API Response:", fallbackResponse.data);
        
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          // Lọc tin nhắn liên quan đến cuộc trò chuyện hiện tại
          const relevantMessages = fallbackResponse.data.filter(
            msg => (msg.senderId === currentUserId && msg.receiverId === receiverId) || 
                  (msg.senderId === receiverId && msg.receiverId === currentUserId)
          );
          
          // Định dạng và sắp xếp tin nhắn theo thời gian
          const formattedMessages = relevantMessages.map(msg => {
            return {
              ...msg,
              content: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content
            };
          }).sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          
          if (checkNewOnly) {
            const newMessages = formattedMessages.filter(
              newMsg => !messages.some(existingMsg => existingMsg.id === newMsg.id)
            );
            
            if (newMessages.length > 0) {
              setMessages(prev => [...prev, ...newMessages].sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt)
              ));
            }
          } else {
            setMessages(formattedMessages);
          }
        }
      } catch (fallbackError) {
        console.error("Tất cả các API đều thất bại:", fallbackError);
        setError("Không thể kết nối với máy chủ tin nhắn");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý gửi tin nhắn mới
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
        // Thêm tin nhắn mới vào danh sách hiện tại
        const newMsg = {
          id: Date.now().toString(), // ID tạm thời
          senderId: currentUserId,
          receiverId: selectedUser.id,
          content: newMessage,
          createdAt: new Date().toISOString(),
          status: "SENT",
          isRead: false
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage(""); // Xóa nội dung tin nhắn sau khi gửi
        
        // Chỉ tải lại tin nhắn từ server
        setTimeout(() => {
          loadChatHistory(selectedUser.id);
        }, 500);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    }
  };
  
  // Nhóm tin nhắn theo ngày
  const groupMessagesByDate = (messages) => {
    // Loại bỏ tin nhắn trùng lặp dựa trên ID
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
    
    // Nhóm tin nhắn theo ngày
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
  
  // Xử lý khi nhấn nút quay lại
  const handleBack = () => {
    if (showConversation && isMobile) {
      setShowConversation(false);
    } else if (onClose) {
      onClose();
    }
  };
  
  // Định dạng ngày hiện tại
  const formatDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // getMonth() trả về 0-11
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box className="h-full flex flex-col bg-black text-white border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <Box className="flex justify-between items-center p-3 border-b border-gray-800 bg-black shadow-sm">
        <Box className="flex items-center">
          <IconButton 
            onClick={handleBack} 
            className="mr-2"
            size="small"
            sx={{ color: 'white' }}
          >
            {isMobile && showConversation ? <ArrowBackIcon /> : <CloseIcon />}
          </IconButton>
          <Typography variant="h6" className="font-medium text-base text-white">
            {selectedUser && showConversation 
              ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`
              : "Tin nhắn"
            }
          </Typography>
        </Box>
      </Box>

      {/* Giao diện Mobile: Chuyển đổi giữa danh sách cuộc trò chuyện và chat hiện tại */}
      {isMobile ? (
        <Box className="flex-grow overflow-hidden">
          {!showConversation ? (
            // Danh sách cuộc trò chuyện
            <Box className="h-full flex flex-col">
              <Box className="flex-grow overflow-auto bg-black">
                {loadingUsers ? (
                  <Box className="flex justify-center p-4">
                    <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
                  </Box>
                ) : users.length === 0 ? (
                  <Box className="p-4 text-center text-gray-400">
                    Không tìm thấy người dùng nào
                  </Box>
                ) : (
                  <Box>
                    {users.map((user) => (
                      <Box 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center p-2 hover:bg-gray-900 cursor-pointer border-b border-gray-800"
                      >
                        <Avatar 
                          src={user.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
                          sx={{ width: 32, height: 32 }}
                          className="mr-2"
                        />
                        <Box>
                          <Typography className="text-xs font-medium text-white">
                            {`${user.firstName || ""} ${user.lastName || ""}`}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            // Chat hiện tại
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
        // Giao diện Desktop: Hiển thị cả danh sách cuộc trò chuyện và chat hiện tại
        <Box className="flex-grow flex overflow-hidden">
          {/* Danh sách cuộc trò chuyện - width reduced from w-2/5 to w-1/3 */}
          <Box className="w-1/3 border-r border-gray-800 overflow-hidden flex flex-col bg-black">
            <Box className="flex-grow overflow-auto">
              {loadingUsers ? (
                <Box className="flex justify-center p-4">
                  <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
                </Box>
              ) : users.length === 0 ? (
                <Box className="p-4 text-center text-gray-400">
                  Không tìm thấy người dùng nào
                </Box>
              ) : (
                <Box>
                  {users.map((user) => (
                    <Box 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center p-2 cursor-pointer hover:bg-gray-900 ${selectedUser?.id === user.id ? 'bg-gray-900' : ''}`}
                    >
                      <Avatar 
                        src={user.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
                        sx={{ width: 32, height: 32 }}
                        className="mr-2"
                      />
                      <Box className="flex-grow">
                        <Typography className="text-xs font-medium text-white">
                          {`${user.firstName || ""} ${user.lastName || ""}`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Chat hiện tại - width increased from w-3/5 to w-2/3 */}
          <Box className="w-2/3 flex flex-col bg-black">
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
              <Box className="flex-grow flex flex-col items-center justify-center text-gray-400">
                <Typography className="text-xl font-medium text-gray-300 mb-2">
                  Tin nhắn của bạn
                </Typography>
                <Typography className="text-center text-gray-400 max-w-sm">
                  Gửi tin nhắn riêng tư cho bạn bè
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Component riêng cho khu vực chat
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
  // Hàm định dạng thời gian từ chuỗi ISO thành định dạng HH:MM
  const formatMessageTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box className="h-full flex flex-col">
      {/* Khu vực tin nhắn */}
      <Box className="flex-grow overflow-auto p-3 bg-black">
        {loading && messageGroups.length === 0 ? (
          <Box className="flex justify-center items-center h-full">
            <CircularProgress size={24} sx={{ color: '#1d9bf0' }} />
          </Box>
        ) : error ? (
          <Box className="flex justify-center items-center h-full">
            <Typography className="text-red-500 text-sm">{error}</Typography>
          </Box>
        ) : messageGroups.length === 0 ? (
          <Box className="flex flex-col justify-center items-center h-full">
            <Avatar 
              src={selectedUser.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"} 
              sx={{ width: 80, height: 80, mb: 2 }}
            />
            <Typography className="font-medium text-white mb-1">
              {`${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`}
            </Typography>
            <Typography className="text-gray-400 text-sm">
              Bắt đầu cuộc trò chuyện mới
            </Typography>
          </Box>
        ) : (
          <Box className="space-y-4">
            {messageGroups.map((group, groupIndex) => (
              <Box key={groupIndex} className="space-y-1">
                <Box className="flex justify-center mb-3">
                  <Typography className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                    {group.date}
                  </Typography>
                </Box>
                
                {group.messages.map((message, messageIndex) => {
                  // Log để debug
                  console.log(`Message ${messageIndex}:`, message);
                  console.log(`Is current user (${currentUserId === message.senderId}):`, currentUserId, message.senderId);
                  
                  const isCurrentUser = message.senderId === currentUserId;
                  const showAvatar = !isCurrentUser && 
                    (messageIndex === 0 || 
                    group.messages[messageIndex - 1].senderId !== message.senderId);
                    
                  // Check if this is a new message from the sender
                  const isNewSenderMessage = messageIndex === 0 || 
                    group.messages[messageIndex - 1].senderId !== message.senderId;
                    
                  return (
                    <Box key={message.id}>
                      {/* Show timestamp only for first message in consecutive messages from same sender */}
                      {isNewSenderMessage && (
                        <Box className="flex justify-center mb-1">
                          <Typography className="text-gray-500 text-sm">
                            {formatMessageTime(message.createdAt)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box 
                        className={`flex items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && showAvatar && (
                          <Avatar
                            src={selectedUser?.avatarUrl || "https://static.oneway.vn/post_content/2022/07/21/file-1658342005830-resized.jpg"}
                            sx={{ width: 28, height: 28, mr: 1, mb: 0.5 }}
                          />
                        )
}
                        
                        {!isCurrentUser && !showAvatar && (
                          <Box sx={{ width: 28, mr: 1 }} /> // Placeholder để giữ căn lề
                        )
}
                        
                        <Box 
                          className={`max-w-[75%] ${
                            isCurrentUser ? 'bg-[#1d9bf0] text-white' : 'bg-[#333639] text-white'
                          } px-3 py-2 rounded-2xl ${
                            isCurrentUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
                          }`}
                        >
                          <Typography className="text-sm break-words">
                            {message.content}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Khu vực nhập tin nhắn */}
      <Box className="p-3 bg-black border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <TextField
            fullWidth
            placeholder="Aa"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{
              '.MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#333639',
                fontSize: '0.9rem',
                padding: '2px 8px',
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton 
                  size="small"
                  sx={{ color: '#1d9bf0' }}
                  disabled={!newMessage.trim()}
                  type="submit"
                >
                  <SendIcon fontSize="small" sx={{ color: '#1d9bf0' }} />
                </IconButton>
              )
            }}
          />
        </form>
      </Box>
    </Box>
  );
};

export default Messages;


