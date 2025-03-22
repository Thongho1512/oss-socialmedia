package com.oss.socialmedia.service;


import com.oss.socialmedia.controller.request.ReqAvatarUrl;
import com.oss.socialmedia.controller.request.ReqBio;
import com.oss.socialmedia.controller.request.ReqCreationUserDTO;
import com.oss.socialmedia.controller.request.ReqPasswordUserDTO;
import com.oss.socialmedia.controller.request.ReqUpdateUserDTO;
import com.oss.socialmedia.controller.response.UserDTO;
import com.oss.socialmedia.controller.response.UserPageDTO;
import com.oss.socialmedia.model.UserEntity;

public interface UserService {
    UserPageDTO findAll(String keyword, String sort, int page, int size);

    UserDTO findById(String id);

    UserDTO findByUsername(String username);

    UserEntity findByEmail(String email);

    String add(ReqCreationUserDTO req);

    void update(ReqUpdateUserDTO req);

    void changePassword(ReqPasswordUserDTO req);

    void delete(String id);

    void updateUserToken(String refreshToken, String email);

    UserEntity getUserByRefreshTokenAndEmail(String refresh_token, String email);

    boolean isEmailExist(String email);

    UserEntity handleCreateUserRegister(ReqCreationUserDTO user);

    UserDTO convertToUserDTO(UserEntity userHasSaved);

    void updateBio(ReqBio bio);
    void updateAvatarUrl(ReqAvatarUrl avatarUrl);
    void updateFollowingCount(String req);
    void updateFolloweeCount(String req, String id);

}
