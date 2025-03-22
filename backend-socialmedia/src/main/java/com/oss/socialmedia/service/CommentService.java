package com.oss.socialmedia.service;

import com.oss.socialmedia.controller.request.comment.ReqCreationCommentDTO;
import com.oss.socialmedia.controller.response.CommentPageDTO;
import com.oss.socialmedia.model.CommentEntity;

public interface CommentService {
    CommentPageDTO findAll(String keyword, String sort, int page, int size);

    CommentEntity findById(String id);

    void add(ReqCreationCommentDTO req)  ;

    void delete(String id);
}
