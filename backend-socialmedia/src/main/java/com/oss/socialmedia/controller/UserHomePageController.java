package com.oss.socialmedia.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oss.socialmedia.service.PostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/homepage")
@Tag(name = "Homepage controller")
@Slf4j(topic = "HOMEPAGE-CONTROLLER")
@RequiredArgsConstructor
public class UserHomePageController {
    private final PostService postService;

    @Operation(summary = "Homepage", description = "Fetch all posts")
    @GetMapping("") 
    public ResponseEntity<Map<String, Object>> getList() {
    
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all posts successfully");    
        map.put("Data", postService.findPostByUserId());
        return ResponseEntity.ok(map);
    }
}
