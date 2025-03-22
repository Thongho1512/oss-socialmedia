package com.oss.socialmedia.service.mapper;

import org.mapstruct.Mapper;

import com.oss.socialmedia.controller.request.role.ReqCreationRoleDTO;
import com.oss.socialmedia.controller.request.role.ReqUpdateRoleDTO;
import com.oss.socialmedia.model.RoleEntity;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleEntity creationDtoToEntity(ReqCreationRoleDTO dto);
    RoleEntity updateDtoToEntity(ReqUpdateRoleDTO dto);
}
