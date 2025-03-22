package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.PostEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostPageDTO extends PageDTOAbstract implements Serializable {
    private List<PostEntity> posts;
}