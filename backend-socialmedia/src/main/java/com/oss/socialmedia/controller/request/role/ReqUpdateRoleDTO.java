package com.oss.socialmedia.controller.request.role;

import java.time.Instant;
import java.util.Set;

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
public class ReqUpdateRoleDTO {
    private String id;
    private String name;
    private String description;
    private Set<String> permissions;
    private Instant createdAt;
    private String createdBy;
}
