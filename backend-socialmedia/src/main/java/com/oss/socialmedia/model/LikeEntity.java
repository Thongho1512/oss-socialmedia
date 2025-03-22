package com.oss.socialmedia.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "likes")
public class LikeEntity {
    @Id
    private String id;
    @Field("user_id")
    private String userId;
    @Field("post_id")
    private String postId;
    @Field("created_at")
    private Instant createdAt;
}
