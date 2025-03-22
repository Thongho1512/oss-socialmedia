package com.oss.socialmedia.model;

import java.time.Instant;
import java.util.Date;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.oss.socialmedia.common.Gender;
import com.oss.socialmedia.common.Status;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserEntity {
    @Id
    private String id;
    @Field("last_name")
    private String lastName;
    @Field("first_name")
    private String firstName;
    @NotNull(message = "Username cannot be null")
    @Size(min = 1, max = 255, message = "Username must be between 1 and 255 characters")
    private String username;
    @NotNull(message = "Password cannot be null")
    @Size(min = 1, max = 255, message = "Password must be between 1 and 255 characters")
    private String password;
    @Field("date_of_birth")
    private Date dob;
    @NotNull(message = "Email cannot be null")
    @Size(min = 1, max = 255, message = "Email must be between 1 and 255 characters")
    private String email;
    @Field("phone_number")
    private String phoneNumber;
    private Gender gender;
    private Status status;
    private String bio;
    private String avatar_url;
    @Field("is_private")
    private boolean isPrivate;
    @Field("roles")
    private Set<String> roles;
    @Field("follower_count")
    private int followerCount;
    @Field("following_count")
    private int followingCount;
    @Field("refresh_token")
    private String refreshToken;
    @Field("created_at")
    private Instant createdAt;
    @Field("updated_at")
    private Instant updatedAt;
    @Field("created_by")
    private String createdBy;
    @Field("updated_by")
    private String updatedBy;

    public void setIsPrivate(Boolean isPrivate){
        this.isPrivate = isPrivate;
    }

    public Boolean getIsPrivate(){
        return isPrivate;
    }

}
