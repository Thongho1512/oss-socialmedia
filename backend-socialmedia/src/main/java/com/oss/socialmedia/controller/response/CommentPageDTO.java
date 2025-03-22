package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.CommentEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentPageDTO extends PageDTOAbstract implements Serializable {
    private List<CommentEntity> comments;
}