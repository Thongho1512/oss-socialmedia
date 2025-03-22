package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.PermissionEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PermissionPageDTO extends PageDTOAbstract implements Serializable {
    private List<PermissionEntity> permissions;
}