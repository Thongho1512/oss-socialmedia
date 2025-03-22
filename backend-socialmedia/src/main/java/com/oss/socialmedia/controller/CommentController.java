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

import com.oss.socialmedia.controller.request.comment.ReqCreationCommentDTO;
import com.oss.socialmedia.controller.request.like.ReqCreationLikeDTO;
import com.oss.socialmedia.service.CommentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/comments")
@Tag(name = "Comment controller")
@Slf4j(topic = "COMMENT-CONTROLLER")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @Operation(summary = "Comments", description = "Fetch all comments")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all comments successfully");
        map.put("Data", commentService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Comments", description = "API create new comment")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> commentCreation(@Valid @RequestBody ReqCreationCommentDTO comment) {
        commentService.add(comment);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Comment created successfully");
        map.put("Data", "");
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Comments", description = "API delete comment")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComemnt(@PathVariable String commentId) {
        commentService.delete(commentId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete comment successfully!");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }
}
