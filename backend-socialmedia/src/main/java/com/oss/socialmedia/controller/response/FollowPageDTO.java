package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.FollowEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FollowPageDTO extends PageDTOAbstract implements Serializable {
    private List<FollowEntity> follows;
}
