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


import com.oss.socialmedia.controller.request.permission.ReqCreationPermissionDTO;
import com.oss.socialmedia.controller.request.permission.ReqUpdatePermissionDTO;
import com.oss.socialmedia.service.PermissionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/permissions")
@Tag(name = "Permission controller")
@Slf4j(topic = "PERMISSION-CONTROLLER")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @Operation(summary = "permissions", description = "Fetch all permissions")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all permissions successfully");
        map.put("Data", permissionService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Permissions", description = "API create new permission")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> permissionCreation(@Valid @RequestBody ReqCreationPermissionDTO permission) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Permission created successfully");
        map.put("Data", permissionService.add(permission));
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Permissions", description = "API update permission")
    @PutMapping("")
    public ResponseEntity<Map<String, Object>> updatePermission(@Valid @RequestBody ReqUpdatePermissionDTO req) {
        log.info("Update permission: {}", req);
        permissionService.update(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "update permission successfully");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Permissions", description = "API delete permission")
    @DeleteMapping("/{permissionId}")
    public ResponseEntity<Map<String, Object>> deletePermission(@PathVariable String permissionId) {
        permissionService.delete(permissionId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete permission successfully!");
        map.put("Data", "success");
        return ResponseEntity.ok(map);
    }
}
