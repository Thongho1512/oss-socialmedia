package com.oss.socialmedia.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.oss.socialmedia.controller.request.permission.ReqCreationPermissionDTO;
import com.oss.socialmedia.controller.request.permission.ReqUpdatePermissionDTO;
import com.oss.socialmedia.controller.response.PermissionPageDTO;
import com.oss.socialmedia.exception.InvalidParameterException;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.PermissionEntity;
import com.oss.socialmedia.repository.PermissionRepository;
import com.oss.socialmedia.repository.RoleRepository;
import com.oss.socialmedia.service.PermissionService;
import com.oss.socialmedia.service.mapper.PermissionMapper;


@Service
public class PermissionServiceImpl implements PermissionService{

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;
    private final RoleRepository roleRepository;

    public PermissionServiceImpl(PermissionRepository permissionRepository,
    PermissionMapper permissionMapper, RoleRepository roleRepository){
        this.permissionRepository = permissionRepository;
        this.permissionMapper = permissionMapper;
        this.roleRepository = roleRepository;
    }


    @Override
    public PermissionPageDTO findAll(String keyword, String sort, int page, int size) {
       // Sorting
        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("(\\w+)(:)(.*)"); // tencot:asc/desc
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(3).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        //
        int page1 = 0;
        if (page > 0) {
            page1 = page - 1;
        }
        // Paging
        Pageable pageable = PageRequest.of(page1, size, Sort.by(order));
        Page<PermissionEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = permissionRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = permissionRepository.findAll(pageable);
        }
        return getPermissionPageDTO(page, size, entityPage);
    }
    // configure the object to be returned to the controller
    private PermissionPageDTO getPermissionPageDTO(int page, int size, Page<PermissionEntity> permissionEntities) {
        List<PermissionEntity> permissionsList = permissionEntities.stream().map(
                entity -> PermissionEntity.builder()
                        .id(entity.getId())
                        .name(entity.getName())
                        .apiPath(entity.getApiPath())
                        .method(entity.getMethod())
                        .module(entity.getModule())
                        .createdAt(entity.getCreatedAt())
                        .updatedAt(entity.getUpdatedAt())
                        .createdBy(entity.getCreatedBy())
                        .updatedBy(entity.getUpdatedBy())
                        .build())
                .toList();
        PermissionPageDTO res = new PermissionPageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(permissionEntities.getTotalElements());
        res.setTotalPages(permissionEntities.getTotalPages());
        res.setPermissions(permissionsList);
        return res;
    }


    @Override
    public PermissionEntity findById(String id) {
        return permissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    @Override
    public String add(ReqCreationPermissionDTO req) throws InvalidParameterException {        
        
        if(permissionRepository.existsByNameAndApiPathAndMethodAndModule(
            req.getName(), req.getApiPath(), req.getMethod(), req.getModule())){
                throw new InvalidParameterException("Permission already exist!");
            }
        PermissionEntity entity = permissionMapper.PermissionDTOtoPermissionEntity(req);
        entity.setCreatedAt(Instant.now());
        return permissionRepository.save(entity).getId();
    }

    @Override
    public void update(ReqUpdatePermissionDTO req) {
        PermissionEntity permission = findById(req.getId());
        permission = permissionMapper.reqUpdateToEntity(req);
        permission.setUpdatedAt(Instant.now());
        if(permissionRepository.existsByNameAndApiPathAndMethodAndModule(
            permission.getName(), permission.getApiPath(), permission.getMethod(), permission.getModule()
        ))
            throw new InvalidParameterException("Permission already exist");
        else {
            permissionRepository.save(permission);
        }
    }


    @Override
    @Transactional
    public void delete(String id) {
        PermissionEntity permission = findById(id);
        roleRepository.deleteElementPermissionInRole(id);
        permissionRepository.deleteById(id);
    }
}
