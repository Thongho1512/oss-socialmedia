package com.oss.socialmedia.service;

import java.util.List;

import com.oss.socialmedia.controller.request.follow.ReqCreationFollowDTO;
import com.oss.socialmedia.controller.response.FollowPageDTO;
import com.oss.socialmedia.model.FollowEntity;

public interface FollowService {
    FollowPageDTO findAll(String keyword, String sort, int page, int size);

    FollowEntity findById(String id);

    void add(ReqCreationFollowDTO req)  ;

    void delete(String id);
    
    List<FollowEntity> findByFollowerId(String userId);
}
