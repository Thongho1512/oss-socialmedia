package com.oss.socialmedia.service.mapper;

import org.mapstruct.Mapper;

import com.oss.socialmedia.controller.request.permission.ReqCreationPermissionDTO;
import com.oss.socialmedia.controller.request.permission.ReqUpdatePermissionDTO;
import com.oss.socialmedia.model.PermissionEntity;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    PermissionEntity PermissionDTOtoPermissionEntity(ReqCreationPermissionDTO dto);
    PermissionEntity reqUpdateToEntity(ReqUpdatePermissionDTO dto);
}
