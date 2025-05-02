package com.oss.socialmedia.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oss.socialmedia.controller.request.follow.ReqCreationFollowDTO;
import com.oss.socialmedia.controller.request.like.ReqCreationLikeDTO;
import com.oss.socialmedia.service.FollowService;
import com.oss.socialmedia.service.LikeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/follows")
@Tag(name = "Follow controller")
@Slf4j(topic = "FOLLOW-CONTROLLER")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;

    @Operation(summary = "follows", description = "Fetch all follows")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all follows successfully");
        map.put("Data", followService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }


    @Operation(summary = "Follows", description = "API create new follow")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> followCreation(@Valid @RequestBody ReqCreationFollowDTO follow) {
        followService.add(follow);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Follow created successfully");
        map.put("Data", "");
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Follows", description = "API delete follow")
    @DeleteMapping("/{followId}")
    public ResponseEntity<Map<String, Object>> deleteFollow(@PathVariable String followId) {
        followService.delete(followId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete follow successfully!");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }
}
