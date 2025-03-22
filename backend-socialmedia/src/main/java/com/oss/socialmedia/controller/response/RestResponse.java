package com.oss.socialmedia.controller.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RestResponse<T> {
        private int statusCode;
        private String error;
        // message có thể là string, hoặc arrayList
        private Object message;
        private T data;
}
