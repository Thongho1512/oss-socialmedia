package com.oss.socialmedia.controller.request.post;

import java.time.Instant;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

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
public class ReqUpdatePostDTO {
    private String id;
    private String userId;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private String caption;
    private boolean privacy;
    private List<MultipartFile> media;
    private Instant createdAt;
}
