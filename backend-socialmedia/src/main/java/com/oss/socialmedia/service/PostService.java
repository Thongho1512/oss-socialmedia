package com.oss.socialmedia.service;

import java.util.List;

import com.oss.socialmedia.controller.request.post.ReqCreationPostDTO;
import com.oss.socialmedia.controller.request.post.ReqUpdatePostDTO;
import com.oss.socialmedia.controller.response.PostPageDTO;
import com.oss.socialmedia.controller.response.UserHomPageDTO;
import com.oss.socialmedia.model.PostEntity;

public interface PostService {
    PostPageDTO findAll(String keyword, String sort, int page, int size);

    PostEntity findById(String id);

    void add(ReqCreationPostDTO req)  ;

    void update(ReqUpdatePostDTO req);

    void delete(String id);

    void updateLike(String id);

    void updateComment(String id);
    
    void updateShare(String id);

    List<UserHomPageDTO> findPostByUserId();

    // get posts of user is authenticated
    List<PostEntity> getPostsByUserAuth();

    List<PostEntity> getPostsByUserId(String userId);
}
