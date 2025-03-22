package com.oss.socialmedia.controller.request.share;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqUpdateShareDTO {
    private String id;
    private String content;
    private String postId;
    private String userId;
    private Instant createdAt;
}
