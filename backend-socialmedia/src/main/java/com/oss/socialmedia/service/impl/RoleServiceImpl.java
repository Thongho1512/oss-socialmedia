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
import org.springframework.util.StringUtils;

import com.oss.socialmedia.controller.request.role.ReqCreationRoleDTO;
import com.oss.socialmedia.controller.request.role.ReqUpdateRoleDTO;
import com.oss.socialmedia.controller.response.RolePageDTO;
import com.oss.socialmedia.exception.InvalidParameterException;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.RoleEntity;
import com.oss.socialmedia.repository.RoleRepository;
import com.oss.socialmedia.service.RoleService;
import com.oss.socialmedia.service.mapper.RoleMapper;

@Service
public class RoleServiceImpl implements RoleService{
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper){
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    @Override
    public RolePageDTO findAll(String keyword, String sort, int page, int size) {
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
        Page<RoleEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = roleRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = roleRepository.findAll(pageable);
        }
        return getRolePageDTO(page, size, entityPage);
    }
    private RolePageDTO getRolePageDTO(int page, int size, Page<RoleEntity> RoleEntities) {
        List<RoleEntity> rolesList = RoleEntities.stream().map(
                entity -> RoleEntity.builder()
                        .id(entity.getId())
                        .name(entity.getName())
                        .description(entity.getDescription())
                        .permissions(entity.getPermissions())
                        .createdAt(entity.getCreatedAt())
                        .updatedAt(entity.getUpdatedAt())
                        .createdBy(entity.getCreatedBy())
                        .updatedBy(entity.getUpdatedBy())
                        .build())
                .toList();
        RolePageDTO res = new RolePageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(RoleEntities.getTotalElements());
        res.setTotalPages(RoleEntities.getTotalPages());
        res.setRoles(rolesList);
        return res;
    }

    @Override
    public RoleEntity findById(String id) {
        return roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    @Override
    public String add(ReqCreationRoleDTO req) {
        if(roleRepository.existsByName(req.getName())){
            throw new InvalidParameterException("Name attribute already exist.");
        } else {
            RoleEntity role = roleMapper.creationDtoToEntity(req);
            role.setCreatedAt(Instant.now());
            return roleRepository.save(role).getId();
        }
    }

    @Override
    public void update(ReqUpdateRoleDTO req) {
        if(roleRepository.existsByName(req.getName())){
            throw new InvalidParameterException("Name attribute already exist.");
        } else {
            RoleEntity role = roleMapper.updateDtoToEntity(req);
            role.setUpdatedAt(Instant.now());
            roleRepository.save(role);
        }
    }

    @Override
    public void delete(String id) {
        RoleEntity role = findById(id);
        roleRepository.delete(role);
    }
}
