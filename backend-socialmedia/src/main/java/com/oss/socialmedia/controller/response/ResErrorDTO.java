package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ResErrorDTO<T> implements Serializable{
    private Instant timestamp;
    private Integer status;
    private Object message;
    private String path;
    private String error;
}
