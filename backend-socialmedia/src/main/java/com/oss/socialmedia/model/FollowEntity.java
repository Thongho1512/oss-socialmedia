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
@Document(collection = "follows")
public class FollowEntity {
    @Id
    private String id;
    private String status;
    @Field("follower_id")
    private String followerId;
    @Field("followee_id")
    private String followeeId;
    @Field("created_at")
    private Instant createdAt;
}
