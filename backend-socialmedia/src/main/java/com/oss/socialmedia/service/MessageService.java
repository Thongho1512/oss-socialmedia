package com.oss.socialmedia.service;

import java.util.List;


import com.oss.socialmedia.common.MessageStatus;
import com.oss.socialmedia.model.MessageEntity;

public interface MessageService {
    MessageEntity saveMessage(String senderId, String receiverId, String content);
    List<MessageEntity> getChatHistory(String senderId, String receiverId);
    void updateMessageStatus(String id, MessageStatus status);
}
