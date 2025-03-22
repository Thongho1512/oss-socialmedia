package com.oss.socialmedia.controller.request.post;

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
public class ReqCreationPostDTO {
    private String userId;
    private String caption;
    private boolean privacy;
    private List<MultipartFile> media;
}
