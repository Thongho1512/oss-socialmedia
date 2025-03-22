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

import com.oss.socialmedia.controller.request.like.ReqCreationLikeDTO;
import com.oss.socialmedia.service.LikeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/likes")
@Tag(name = "Like controller")
@Slf4j(topic = "LIKE-CONTROLLER")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @Operation(summary = "likes", description = "Fetch all likes")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all likes successfully");
        map.put("Data", likeService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }


    @Operation(summary = "Likes", description = "API create new like")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> likeCreation(@Valid @RequestBody ReqCreationLikeDTO like) {
        likeService.add(like);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Like created successfully");
        map.put("Data", "");
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Likes", description = "API delete like")
    @DeleteMapping("/{likeId}")
    public ResponseEntity<Map<String, Object>> deleteLike(@PathVariable String likeId) {
        likeService.delete(likeId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete like successfully!");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }
}
