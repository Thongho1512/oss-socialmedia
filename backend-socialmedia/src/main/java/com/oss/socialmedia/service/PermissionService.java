package com.oss.socialmedia.service;


import com.oss.socialmedia.controller.request.permission.ReqCreationPermissionDTO;
import com.oss.socialmedia.controller.request.permission.ReqUpdatePermissionDTO;
import com.oss.socialmedia.controller.response.PermissionPageDTO;
import com.oss.socialmedia.model.PermissionEntity;

public interface PermissionService {
    PermissionPageDTO findAll(String keyword, String sort, int page, int size);

    PermissionEntity findById(String id);

    String add(ReqCreationPermissionDTO req)  ;

    void update(ReqUpdatePermissionDTO req);

    void delete(String id);

}
