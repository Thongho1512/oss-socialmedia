package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import com.oss.socialmedia.model.RoleEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RolePageDTO extends PageDTOAbstract implements Serializable {
    private List<RoleEntity> roles;
}
