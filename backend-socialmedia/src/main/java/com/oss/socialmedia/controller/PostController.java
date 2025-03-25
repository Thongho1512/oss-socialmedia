package com.oss.socialmedia.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oss.socialmedia.controller.request.post.ReqCreationPostDTO;
import com.oss.socialmedia.controller.request.post.ReqUpdatePostDTO;
import com.oss.socialmedia.service.PostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/posts")
@Tag(name = "Post controller")
@Slf4j(topic = "POST-CONTROLLER")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @Operation(summary = "Posts", description = "Fetch all posts")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        log.info("Get all posts.");
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all posts successfully");
        map.put("Data", postService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Posts", description = "API create new post")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> postCreation(@ModelAttribute ReqCreationPostDTO reqDto) {
        postService.add(reqDto);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Post created successfully");
        map.put("Data", "");
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Posts", description = "API update post")
    @PutMapping("")
    public ResponseEntity<Map<String, Object>> updatePost(@ModelAttribute ReqUpdatePostDTO req) {
        log.info("Update post: {}", req);
        postService.update(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "update post successfully");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Posts", description = "API delete post")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable String postId) {
        postService.delete(postId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete post successfully!");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }
    
}
