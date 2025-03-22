package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.LikeEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LikePageDTO extends PageDTOAbstract implements Serializable {
    private List<LikeEntity> likes;
}