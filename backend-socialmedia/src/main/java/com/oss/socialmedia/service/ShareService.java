package com.oss.socialmedia.service;

import com.oss.socialmedia.controller.request.share.ReqCreationShareDTO;
import com.oss.socialmedia.controller.request.share.ReqUpdateShareDTO;
import com.oss.socialmedia.controller.response.SharePageDTO;
import com.oss.socialmedia.model.ShareEntity;

public interface ShareService {
    SharePageDTO findAll(String keyword, String sort, int page, int size);

    ShareEntity findById(String id);

    void add(ReqCreationShareDTO req);

    void update(ReqUpdateShareDTO req);

    void delete(String id);

}
