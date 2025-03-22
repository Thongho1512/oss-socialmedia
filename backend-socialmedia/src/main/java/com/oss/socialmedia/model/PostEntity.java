package com.oss.socialmedia.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.oss.socialmedia.common.Media;

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
@Document(collection = "posts")
public class PostEntity implements Serializable{
    
    @Id
    private String id;
    @Field("user_id")
    private String userId;
    @Field("like_count")
    private int likeCount;
    @Field("comment_count")
    private int commentCount;
    @Field("share_count")
    private int shareCount;
    private String caption;
    private boolean privacy;
    private List<Media> media;    
    @Field("created_at")
    private Instant createdAt;
    @Field("updated_at")
    private Instant updatedAt;
}
