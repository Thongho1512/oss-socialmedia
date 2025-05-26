import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

/**
 * Dialog component for editing share content
 */
const ShareEditDialog = ({ 
  open, 
  onClose, 
  shareData, 
  onShareUpdate 
}) => {
  const [editedContent, setEditedContent] = useState(shareData?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog opens with new share data
  React.useEffect(() => {
    if (open && shareData) {
      setEditedContent(shareData.content || "");
      setError("");
    }
  }, [open, shareData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError("");
      
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken || !shareData?.id) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/v1/shares`,
        {
          id: shareData.id,
          content: editedContent,
          postId: shareData.postId,
          userId: shareData.userId,
          createdAt: shareData.createdAt
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.Status === 200) {
        // Call onShareUpdate with the updated share data
        onShareUpdate({
          ...shareData,
          content: editedContent,
        });
        onClose();
      } else {
        setError(response.data?.Message || "Failed to update share");
      }
    } catch (error) {
      console.error("Error updating share:", error);
      setError(
        error.response?.data?.Message || 
        "Error updating share. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        style: {
          backgroundColor: "#15202b",
          color: "white",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        padding: "16px 24px"      }}>
        <Typography variant="h6">Edit Share</Typography>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: "24px" }}>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth          placeholder="Write a comment about this post..."
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          InputProps={{
            sx: { 
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(29, 155, 240, 0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1d9bf0",
              }
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
            },
            "& label": {
              color: "gray",
            },
            "& label.Mui-focused": {
              color: "#1d9bf0",
            },
            marginTop: 1,
          }}
          disabled={isSubmitting}
        />
        
        {error && (
          <Typography 
            color="error" 
            variant="body2" 
            sx={{ mt: 2, fontSize: "14px" }}
          >
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        padding: "12px 24px 24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
      }}>        <Button 
          onClick={onClose}
          color="primary"
          disabled={isSubmitting}
          sx={{ 
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitting || !editedContent.trim()}
          sx={{
            backgroundColor: "#1d9bf0",
            color: "white",
            borderRadius: "20px",
            "&:hover": {
              backgroundColor: "#1a8cd8",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(29, 155, 240, 0.5)",
              color: "rgba(255, 255, 255, 0.5)",
            }
          }}
        >          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareEditDialog;
