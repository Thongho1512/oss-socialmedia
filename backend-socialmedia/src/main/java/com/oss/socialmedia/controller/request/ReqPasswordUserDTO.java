package com.oss.socialmedia.controller.request;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class ReqPasswordUserDTO implements Serializable {
    @NotBlank(message = "Id must not be blank")
    private String id;
    @NotBlank(message = "Password must not be blank")
    @Size(min = 1, max = 255, message = "Password must be between 1 and 255 characters")
    private String password;
    private String comfirmPassword;

}
