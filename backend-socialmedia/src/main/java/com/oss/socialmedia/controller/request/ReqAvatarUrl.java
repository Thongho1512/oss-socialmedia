package com.oss.socialmedia.controller.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReqAvatarUrl {
    private String avatarUrl;
    private MultipartFile avatarFile;
}
