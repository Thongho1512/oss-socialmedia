package com.oss.socialmedia.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.oss.socialmedia.model.MessageEntity;

public interface MessageRepository extends MongoRepository<MessageEntity, String> {
    List<MessageEntity> findBySenderIdAndReceiverId(String senderId, String receiverId);
}
