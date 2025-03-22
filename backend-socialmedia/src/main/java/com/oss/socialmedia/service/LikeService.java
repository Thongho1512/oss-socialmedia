package com.oss.socialmedia.service;

import com.oss.socialmedia.controller.request.like.ReqCreationLikeDTO;
import com.oss.socialmedia.controller.response.LikePageDTO;
import com.oss.socialmedia.model.LikeEntity;

public interface LikeService {
    LikePageDTO findAll(String keyword, String sort, int page, int size);

    LikeEntity findById(String id);

    void add(ReqCreationLikeDTO req)  ;

    void delete(String id);
} 
