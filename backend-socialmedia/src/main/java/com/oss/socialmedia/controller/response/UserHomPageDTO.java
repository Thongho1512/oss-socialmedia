package com.oss.socialmedia.controller.response;


import java.time.Instant;
import java.util.List;


import com.oss.socialmedia.common.Media;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHomPageDTO {
    private String id;
    private String userId;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private String caption;
    private boolean privacy;
    private List<Media> media;    
    private Instant createdAt;
    private String userName;
}
