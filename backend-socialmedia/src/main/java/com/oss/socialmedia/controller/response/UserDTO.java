package com.oss.socialmedia.controller.response;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

import org.springframework.data.mongodb.core.mapping.Field;

import com.oss.socialmedia.common.Gender;

public class UserDTO implements Serializable {
    private String id;
    private String lastName;
    private String firstName;
    private Date dob;
    private String email;
    private String phoneNumber;
    private Gender gender;
    private String username;
    private String bio;
    private String avatarUrl;
    private int followerCount;
    private int followingCount;
    private Set<String> roles;
    @Field("is_private")
    private boolean isPrivate;
    
    
    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setFollowerCount(int followerCount) {
        this.followerCount = followerCount;
    }

    public void setFollowingCount(int followingCount) {
        this.followingCount = followingCount;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setDob(Date dob) {
        this.dob = dob;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    public void setIsPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public String getId() {
        return id;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public Date getDob() {
        return dob;
    }

    public String getBio() {
        return bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public int getFollowerCount() {
        return followerCount;
    }

    public int getFollowingCount() {
        return followingCount;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Gender getGender() {
        return gender;
    }

    public String getUsername() {
        return username;
    }
    public Set<String> getRoles() {
        return roles;
    }
    public boolean getIsPrivate() {
        return isPrivate;
    }


    public static class Builder {
        private final UserDTO user = new UserDTO();

        public Builder setRoles(Set<String> roles) {
            user.setRoles(roles);
            return this;
        }
        public Builder setIsPrivate(boolean isPrivate) {
            user.setIsPrivate(isPrivate);
            return this;
        }

        public Builder setId(String id) {
            user.setId(id);
            return this;
        }

        public Builder setFirstName(String firstName) {
            user.setFirstName(firstName);
            return this;
        }

        public Builder setLastName(String lastName) {
            user.setLastName(lastName);
            return this;
        }

        public Builder setDob(Date dob) {
            user.setDob(dob);
            return this;
        }

        public Builder setEmail(String email) {
            user.setEmail(email);
            return this;
        }

        public Builder setPhoneNumber(String phoneNumber) {
            user.setPhoneNumber(phoneNumber);
            return this;
        }

        public Builder setGender(Gender gender) {
            user.setGender(gender);
            return this;
        }

        public Builder setUserName(String userName) {
            user.setUsername(userName);
            return this;
        }
        public Builder setBio(String bio) {
            user.setBio(bio);
            return this;

        }
    
        public Builder setAvatarUrl(String avatarUrl) {
            user.setAvatarUrl(avatarUrl);
            return this;

        }
    
        public Builder setFollowerCount(int followerCount) {
            user.setFollowerCount(followerCount);
            return this;

        }
    
        public Builder setFollowingCount(int followingCount) {
            user.setFollowingCount(followingCount);
            return this;

        }

        public UserDTO build() {
            return user;
        }
    }
}