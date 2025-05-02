package com.oss.socialmedia.controller;

import com.oss.socialmedia.controller.request.ReqAvatarUrl;
import com.oss.socialmedia.controller.request.ReqBio;
import com.oss.socialmedia.controller.request.ReqCreationUserDTO;
import com.oss.socialmedia.controller.request.ReqPasswordUserDTO;
import com.oss.socialmedia.controller.request.ReqUpdateUserDTO;
import com.oss.socialmedia.service.PostService;
import com.oss.socialmedia.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User controller")
@Slf4j(topic = "USER-CONTROLLER")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PostService postService;


    @Operation(summary = "users", description = "Fetch all users")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all users successfully");
        map.put("Data", userService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Users", description = "API get user details by id")
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable String userId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get user successfully");
        map.put("Data1", userService.findById(userId));
        // Sử dụng userId từ path parameter thay vì lấy từ người dùng đang đăng nhập
        map.put("Data2", postService.getPostsByUserId(userId)); 
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Users", description = "API create new user")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> userCreation(@Valid @RequestBody ReqCreationUserDTO user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "User created successfully");
        map.put("Data", userService.add(user));
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Users", description = "API update user")
    @PutMapping("")
    public ResponseEntity<Map<String, Object>> updateUser(@Valid @RequestBody ReqUpdateUserDTO req) {
        log.info("Update user: {}", req);
        userService.update(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "update user successfully");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Users", description = "API change user password")
    @PatchMapping("/change-pwd")
    public ResponseEntity<Map<String, Object>> changePassword(@Valid @RequestBody ReqPasswordUserDTO req) {
        userService.changePassword(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Password updated successfully!");
        map.put("Data", "success");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Users", description = "API delete user")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        userService.delete(userId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete user successfully!");
        map.put("Data", "success");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Users", description = "API update user's bio")
    @PatchMapping("/bio")
    public ResponseEntity<Map<String, Object>> updateBio(@RequestBody ReqBio req) {
        userService.updateBio(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Bio updated successfully!");
        map.put("Data", "success");
        return ResponseEntity.ok(map);
    }
    @Operation(summary = "Users", description = "API update user's avatar")
    @PatchMapping(value = "/bio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateAvatar(@ModelAttribute ReqAvatarUrl req) {
        userService.updateAvatarUrl(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Bio updated successfully!");
        map.put("Data", "success");
        return ResponseEntity.ok(map);
    }

}
