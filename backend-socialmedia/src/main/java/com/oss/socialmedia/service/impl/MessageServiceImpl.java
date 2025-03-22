package com.oss.socialmedia.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oss.socialmedia.common.MessageStatus;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.MessageEntity;
import com.oss.socialmedia.repository.MessageRepository;
import com.oss.socialmedia.service.MessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j(topic = "MESSAGE-SERVICE")
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService{
    private final MessageRepository messageRepository;

    public MessageEntity saveMessage(String senderId, String receiverId, String content) {
        MessageEntity message = MessageEntity.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .status(MessageStatus.SENT)
                .createdAt(Instant.now())
                .build();
        return messageRepository.save(message);
    }

    public List<MessageEntity> getChatHistory(String senderId, String receiverId) {
        return messageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }

    @Transactional
    public void updateMessageStatus(String id, MessageStatus status) {
        MessageEntity message = messageRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        message.setStatus(status);
        messageRepository.save(message);
    }
}
