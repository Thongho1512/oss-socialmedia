package com.oss.socialmedia.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oss.socialmedia.controller.request.share.ReqCreationShareDTO;
import com.oss.socialmedia.controller.request.share.ReqUpdateShareDTO;
import com.oss.socialmedia.service.ShareService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/shares")
@Tag(name = "Share controller")
@Slf4j(topic = "SHARE-CONTROLLER")
@RequiredArgsConstructor
public class ShareController {
    private final ShareService shareService;

    @Operation(summary = "Shares", description = "Fetch all shares")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all shares successfully");
        map.put("Data", shareService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Shares", description = "API create new share")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> shareCreation(@Valid @RequestBody ReqCreationShareDTO share) {
        shareService.add(share);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Share created successfully");
        map.put("Data", "");
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Share", description = "API delete share")
    @DeleteMapping("/{shareId}")
    public ResponseEntity<Map<String, Object>> deleteShare(@PathVariable String shareId) {
        shareService.delete(shareId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete share successfully!");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Share", description = "API update share")
    @PutMapping("")
    public ResponseEntity<Map<String, Object>> updateShare(@Valid @RequestBody ReqUpdateShareDTO req) {
        shareService.update(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Update share successfully!");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }
}
