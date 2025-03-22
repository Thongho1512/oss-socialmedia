package com.oss.socialmedia.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.oss.socialmedia.common.MessageStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "messages")
public class MessageEntity {

    @Id
    private String Id;
    @Field("sender_id")
    private String senderId;
    @Field("receiver_id")
    private String receiverId;
    private String content;
    @Field("status")
    private MessageStatus status; // Type: The category of the message, like regular chat, joining a chat, or leaving.
    @Field("is_read")
    private Boolean isRead;
    @Field("created_at")
    private Instant createdAt;

    // Getters and Setters
}
