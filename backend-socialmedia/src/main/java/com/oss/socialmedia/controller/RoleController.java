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


import com.oss.socialmedia.controller.request.role.ReqCreationRoleDTO;
import com.oss.socialmedia.controller.request.role.ReqUpdateRoleDTO;
import com.oss.socialmedia.service.RoleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Role controller")
@Slf4j(topic = "ROLE-CONTROLLER")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @Operation(summary = "Roles", description = "Fetch all roles")
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        log.info("Get all roles.");
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Get all roles successfully");
        map.put("Data", roleService.findAll(keyword, sort, page, size));
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Roles", description = "API create new role")
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> roleCreation(@Valid @RequestBody ReqCreationRoleDTO role) {
        log.info("Create role: {}", role);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Role created successfully");
        map.put("Data", roleService.add(role));
        return ResponseEntity.status(HttpStatus.CREATED).body(map);
    }

    @Operation(summary = "Roles", description = "API update role")
    @PutMapping("")
    public ResponseEntity<Map<String, Object>> updateRole(@Valid @RequestBody ReqUpdateRoleDTO req) {
        log.info("Update role: {}", req);
        roleService.update(req);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "update role successfully");
        map.put("Data", "");
        return ResponseEntity.ok(map);
    }

    @Operation(summary = "Roles", description = "API delete role")
    @DeleteMapping("/{roleId}")
    public ResponseEntity<Map<String, Object>> deleteRole(@PathVariable String roleId) {
        roleService.delete(roleId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Status", HttpStatus.OK.value());
        map.put("Message", "Delete role successfully!");
        map.put("Data", "success");
        return ResponseEntity.ok(map);
    }
}
