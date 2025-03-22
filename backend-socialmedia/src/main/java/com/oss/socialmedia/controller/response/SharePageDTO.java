package com.oss.socialmedia.controller.response;
import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.ShareEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharePageDTO extends PageDTOAbstract implements Serializable {
    private List<ShareEntity> shares;
}