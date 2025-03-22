package com.oss.socialmedia.controller.request.role;

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
public class ReqCreationRoleDTO {
    private String name;
    private String description;
    private Set<String> permissions;
}
