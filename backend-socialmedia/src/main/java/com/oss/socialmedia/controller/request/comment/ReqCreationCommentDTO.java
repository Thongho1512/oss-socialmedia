package com.oss.socialmedia.controller.request.comment;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ReqCreationCommentDTO {
    private String postId;
    private String content;
}
