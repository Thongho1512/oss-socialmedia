package com.oss.socialmedia.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.oss.socialmedia.common.SecurityUtil;
import com.oss.socialmedia.common.Status;
import com.oss.socialmedia.controller.request.ReqAvatarUrl;
import com.oss.socialmedia.controller.request.ReqBio;
import com.oss.socialmedia.controller.request.ReqCreationUserDTO;
import com.oss.socialmedia.controller.request.ReqPasswordUserDTO;
import com.oss.socialmedia.controller.request.ReqUpdateUserDTO;
import com.oss.socialmedia.controller.response.UserDTO;
import com.oss.socialmedia.controller.response.UserPageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.UserEntity;
import com.oss.socialmedia.repository.UserRepository;
import com.oss.socialmedia.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j(topic = "USER-SERVICE")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload.image-dir}")
    private String imageUploadDir; // Directory for image uploads

    @Override
    public UserPageDTO findAll(String keyword, String sort, int page, int size) {

        // Sorting
        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("(\\w+)(:)(.*)"); // tencot:asc/desc
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(3).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        //
        int page1 = 0;
        if (page > 0) {
            page1 = page - 1;
        }
        // Paging
        Pageable pageable = PageRequest.of(page1, size, Sort.by(order));
        Page<UserEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = userRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = userRepository.findAll(pageable);
        }
        return getUserPageDTO(page, size, entityPage);
    }

    



    // used for controller
    @Override
    public UserDTO findById(String id) {
        UserEntity user = getUser(id);
        UserDTO dto = new UserDTO.Builder()
                .setDob(user.getDob())
                .setEmail(user.getEmail())
                .setFirstName(user.getFirstName())
                .setGender(user.getGender())
                .setId(id)
                .setLastName(user.getLastName())
                .setPhoneNumber(user.getPhoneNumber())
                .setUserName(user.getUsername())
                .setRoles(user.getRoles())
                .setFollowerCount(user.getFollowerCount())
                .setFollowingCount(user.getFollowingCount())
                .setBio(user.getBio())
                .setAvatarUrl(user.getAvatar_url())
                .setIsPrivate(user.getIsPrivate())
                .build();
        return dto;
    }


    @Override
    public UserDTO findByUsername(String username) {
        UserEntity user = userRepository.findByUsername(username);
        UserDTO dto = new UserDTO.Builder()
                .setDob(user.getDob())
                .setEmail(user.getEmail())
                .setFirstName(user.getFirstName())
                .setGender(user.getGender())
                .setId(user.getId())
                .setLastName(user.getLastName())
                .setPhoneNumber(user.getPhoneNumber())
                .setUserName(user.getUsername())
                .setRoles(user.getRoles())
                .build();
        return dto;
    }

    @Override
    public UserEntity findByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email);
        return user;
    }

    @Override
    public String add(ReqCreationUserDTO req) {
        log.info("Save user: {}", req);
        UserEntity user = new UserEntity();
        user.setLastName(req.getLastName());
        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());
        user.setDob(req.getDob());
        user.setEmail(req.getEmail());
        user.setFirstName(req.getFirstName());
        user.setGender(req.getGender());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setStatus(req.getStatus().ACTIVE);
        user.setRoles(req.getRoles());
        user.setCreatedAt(Instant.now());
        userRepository.save(user);
        return user.getId();
    }

    @Override
    public void update(ReqUpdateUserDTO req) {
        log.info("Update user: {}", req);
        UserEntity user = getUser(req.getId());
        user.setLastName(req.getLastName());
        user.setDob(req.getDob());
        user.setEmail(req.getEmail());
        user.setFirstName(req.getFirstName());
        user.setGender(req.getGender());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setUpdatedAt(Instant.now());
        user.setRoles(req.getRoles());
        user.setCreatedAt(req.getCreatedAt());
        user.setCreatedBy(req.getCreatedBy());
        user.setIsPrivate(req.getIsPrivate());
        userRepository.save(user);
    }

    @Override
    public void changePassword(ReqPasswordUserDTO req) {
        log.info("Change password for user: {}", req);
        UserEntity user = getUser(req.getId());
        if (req.getComfirmPassword().equals(req.getComfirmPassword()))
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);
    }

    @Override
    public void delete(String id) {
        log.info("Delete user has id: {}", id);
        UserEntity user = getUser(id);
        user.setStatus(Status.INACTIVE);
        userRepository.save(user);
        log.info("Delete user successfully: {}", user);
    }

    @Override
    public void updateUserToken(String refreshToken, String email){
        UserEntity user = findByEmail(email);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
    }


    @Override
    public UserEntity getUserByRefreshTokenAndEmail(String refresh_token, String email) {
        return userRepository.findByRefreshTokenAndEmail(refresh_token, email);
    }

    @Override
    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }

    @Override
    public UserEntity handleCreateUserRegister(ReqCreationUserDTO req) {
        log.info("Save register user: {}", req);
        UserEntity user = new UserEntity();
        user.setLastName(req.getLastName());
        user.setUsername(req.getUsername());
        user.setDob(req.getDob());
        user.setPassword(req.getPassword());
        user.setEmail(req.getEmail());
        user.setFirstName(req.getFirstName());
        user.setGender(req.getGender());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setStatus(req.getStatus().ACTIVE);
        user.setRoles(req.getRoles());
        user.setIsPrivate(false);
        user.setCreatedAt(Instant.now());
        return userRepository.save(user);
    }

    @Override
    public UserDTO convertToUserDTO(UserEntity req) {
        UserDTO user = new UserDTO();
        user.setId(req.getId());
        user.setIsPrivate(req.getIsPrivate());
        user.setLastName(req.getLastName());
        user.setUsername(req.getUsername());
        user.setDob(req.getDob());
        user.setEmail(req.getEmail());
        user.setFirstName(req.getFirstName());
        user.setGender(req.getGender());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setRoles(req.getRoles());
        return user;
    }
    

    @Override
    public void updateBio(ReqBio bio) {
        String email = getEmailOfUserIsRequiring();
        UserEntity user = findByEmail(email);
        user.setBio(bio.getBio());
        userRepository.save(user);
    }

    @Override
    public void updateAvatarUrl(ReqAvatarUrl avatarUrl) {
        String email = getEmailOfUserIsRequiring();
        UserEntity user = findByEmail(email);
        
        try {
            if (avatarUrl.getAvatarFile() != null && !avatarUrl.getAvatarFile().isEmpty()) {
                // If a file was uploaded directly
                String fileUrl = saveAvatarFile(avatarUrl.getAvatarFile());
                user.setAvatar_url(fileUrl);
                userRepository.save(user);
                log.info("Avatar saved as file: {}", fileUrl);
            } else if (avatarUrl.getAvatarUrl() != null && !avatarUrl.getAvatarUrl().isEmpty()) {
                String avatarUrlString = avatarUrl.getAvatarUrl();
                
                // Check if it's a base64 string
                if (avatarUrlString.startsWith("data:image")) {
                    // Extract data from base64 string
                    String[] parts = avatarUrlString.split(",");
                    String imageType = parts[0].split(";")[0].split("/")[1];
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(parts[1]);
                    
                    // Create file from base64 data
                    String fileName = System.currentTimeMillis() + "_images." + imageType;
                    Path uploadPath = Paths.get(System.getProperty("user.dir"), imageUploadDir);
                    
                    // Ensure directory exists
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    
                    Path filePath = uploadPath.resolve(fileName);
                    Files.write(filePath, imageBytes);
                    
                    // Save the path to database
                    String fileUrl = imageUploadDir + "/" + fileName;
                    user.setAvatar_url(fileUrl);
                    userRepository.save(user);
                    log.info("Avatar saved from base64: {}", fileUrl);
                } else {
                    // If it's already a valid path, use it directly
                    user.setAvatar_url(avatarUrlString);
                    userRepository.save(user);
                    log.info("Avatar URL saved directly: {}", avatarUrlString);
                }
            }
        } catch (IOException e) {
            log.error("Error saving avatar file", e);
            throw new RuntimeException("Error when saving avatar file", e);
        }
    }
    
    // Method to save avatar file
    private String saveAvatarFile(MultipartFile file) throws IOException {
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image")) {
            throw new IllegalArgumentException("Only image files are supported for avatars.");
        }
        
        Path uploadPath = Paths.get(System.getProperty("user.dir"), imageUploadDir);

        // Ensure directory exists
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Create a unique file name
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Save the file
        Files.copy(file.getInputStream(), filePath);

        // Return the relative path to be stored in database
        return imageUploadDir + "/" + fileName;
    }

    @Override
    public void updateFollowingCount(String req) {
        UserEntity user = findByEmail(getEmailOfUserIsRequiring());
        if(req == "plus")
            user.setFollowingCount(user.getFollowingCount() + 1);
        else if (req == "minus")
        user.setFollowingCount(user.getFollowingCount() - 1);
        userRepository.save(user);
    }



    @Override
    public void updateFolloweeCount(String req, String id) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
        if(req == "plus")
            user.setFollowerCount(user.getFollowerCount() + 1);
        else if (req == "minus")
            user.setFollowerCount(user.getFollowerCount() - 1);
        userRepository.save(user);
    }





    // get user's email is requiring function
    private String getEmailOfUserIsRequiring(){
        String email = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        return email;
    }


    // used for service
    private UserEntity getUser(String id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // configure the object to be returned to the controller
    private UserPageDTO getUserPageDTO(int page, int size, Page<UserEntity> userEntities) {
        List<UserDTO> usersList = userEntities.stream().map(
                entity -> new UserDTO.Builder()
                        .setDob(entity.getDob())
                        .setEmail(entity.getEmail())
                        .setFirstName(entity.getFirstName())
                        .setGender(entity.getGender())
                        .setId(entity.getId())
                        .setIsPrivate(entity.getIsPrivate())
                        .setLastName(entity.getLastName())
                        .setPhoneNumber(entity.getPhoneNumber())
                        .setUserName(entity.getUsername())
                        .setBio(entity.getBio())
                        .setAvatarUrl(entity.getAvatar_url())
                        .setFollowerCount(entity.getFollowerCount())
                        .setFollowingCount(entity.getFollowingCount())
                        .setRoles(entity.getRoles())
                        .build())
                .toList();
        UserPageDTO res = new UserPageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(userEntities.getTotalElements());
        res.setTotalPages(userEntities.getTotalPages());
        res.setUsers(usersList);
        return res;
    }



}
