package com.oss.socialmedia.controller.request.permission;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReqUpdatePermissionDTO {
    @NotBlank(message = "Id must not be blank")
    private String id;

    private String name;

    private String apiPath;

    private String method;

    private String module;

    private Instant createdAt;
    
    private String createdBy;
}
