package com.oss.socialmedia.service;

import com.oss.socialmedia.controller.request.role.ReqCreationRoleDTO;
import com.oss.socialmedia.controller.request.role.ReqUpdateRoleDTO;
import com.oss.socialmedia.controller.response.RolePageDTO;
import com.oss.socialmedia.model.RoleEntity;

public interface RoleService {
    RolePageDTO findAll(String keyword, String sort, int page, int size);

    RoleEntity findById(String id);

    String add(ReqCreationRoleDTO req)  ;

    void update(ReqUpdateRoleDTO req);

    void delete(String id);
}
