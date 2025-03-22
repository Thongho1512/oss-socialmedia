package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserPageDTO extends PageDTOAbstract implements Serializable {
    private List<UserDTO> users;
}
