package com.oss.socialmedia.controller;

import com.oss.socialmedia.controller.request.ReqCreationUserDTO;
import com.oss.socialmedia.controller.request.ReqPasswordUserDTO;
import com.oss.socialmedia.controller.request.ReqUpdateUserDTO;
import com.oss.socialmedia.controller.response.UserDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mockup/users")
@Tag(name = "Mockup user controller")
public class MockupUserController {

    @Operation(summary = "users", description = "Fetch all users")
    @GetMapping("/list")
    public Map<String, Object> getList(@RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<UserDTO> usersList = new ArrayList<>();
        UserDTO user1 = new UserDTO.Builder()
                .setId("abc")
                .setUserName("thongho")
                .setEmail("thongho1512@gmail.com")
                .setFirstName("ho")
                .setLastName("thong")
                .setPhoneNumber("0394710774")
                .build();
        UserDTO user2 = new UserDTO.Builder()
                .setUserName("ThangGap")
                .setEmail("thanggap12@gmail.com")
                .setFirstName("gap")
                .setId("vda")
                .setLastName("thang")
                .setPhoneNumber("")
                .build();
        usersList.add(user1);
        usersList.add(user2);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "fetch all users");
        map.put("Data", usersList);
        return map;
    }

    @Operation(summary = "Users", description = "API get user details by id")
    @GetMapping("/{userId}")
    public Map<String, Object> getUser(@PathVariable String userId) {
        UserDTO user = new UserDTO.Builder()
                .setId(userId)
                .setUserName("thongho")
                .setEmail("thongho1512@gmail.com")
                .setFirstName("ho")
                .setLastName("thong")
                .setPhoneNumber("0394710774")
                .build();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "fetch all users");
        map.put("Data", user);
        return map;
    }

    @Operation(summary = "Users", description = "API create new user")
    @PostMapping("create")
    public Map<String, Object> userCreation(ReqCreationUserDTO user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "create new user");
        map.put("Data", 3);
        return map;
    }

    @Operation(summary = "Users", description = "API update user")
    @PutMapping("/update")
    public Map<String, Object> updateUser(ReqUpdateUserDTO user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "update user");
        map.put("Data", "success");
        return map;
    }

    @Operation(summary = "Users", description = "API change user password")
    @PatchMapping("/change-pwd")
    public Map<String, Object> changeUserPassword(ReqPasswordUserDTO user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Password updated successfully!");
        map.put("Data", "success");
        return map;
    }

    @Operation(summary = "Users", description = "API delete user")
    @DeleteMapping("/delete/{userId}")
    public Map<String, Object> deleteUser(@PathVariable Long userId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete user successfully!");
        map.put("Data", "success");
        return map;
    }

}
