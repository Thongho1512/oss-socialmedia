package com.oss.socialmedia.common;

import java.io.Serializable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Media implements Serializable{
    private String url;  
    private String type; // IMAGE hoặc VIDEO


    public Media(String url, String type) {
        this.url = url;
        this.type = type;
    }
}
