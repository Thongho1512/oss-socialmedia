package com.oss.socialmedia.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.oss.socialmedia.common.SecurityUtil;
import com.oss.socialmedia.model.UserEntity;
import com.oss.socialmedia.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserIsRequesting {
    
    private final UserService userService;

    // get user's email is requiring function
    private  String getEmailOfUserIsRequiring(){
        String email = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        return email;
    }
    
    public String getIdUserIsRequesting(){
        UserEntity user = userService.findByEmail(getEmailOfUserIsRequiring());
        return user.getId();
    }
}
