package com.oss.socialmedia.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.oss.socialmedia.controller.request.follow.ReqCreationFollowDTO;
import com.oss.socialmedia.controller.response.FollowPageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.FollowEntity;
import com.oss.socialmedia.model.UserEntity;
import com.oss.socialmedia.repository.FollowRepository;
import com.oss.socialmedia.repository.UserRepository;
import com.oss.socialmedia.service.FollowService;
import com.oss.socialmedia.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService{

    private final FollowRepository followRepository;
    private final UserService userService;
    private final UserIsRequesting userIsRequesting;

    @Override
    public FollowPageDTO findAll(String keyword, String sort, int page, int size) {
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
        Page<FollowEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = followRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = followRepository.findAll(pageable);
        }
        return getFollowPageDTO(page, size, entityPage);
    }
    // configure the object to be returned to the controller
    private FollowPageDTO getFollowPageDTO(int page, int size, Page<FollowEntity> followEntities) {
        List<FollowEntity> followsList = followEntities.stream().map(
                entity -> FollowEntity.builder()
                        .id(entity.getId())
                        .followeeId(entity.getFolloweeId())
                        .followerId(entity.getFollowerId())
                        .status(entity.getStatus())
                        .createdAt(entity.getCreatedAt())
                        .build())
                .toList();
        FollowPageDTO res = new FollowPageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(followEntities.getTotalElements());
        res.setTotalPages(followEntities.getTotalPages());
        res.setFollows(followsList);
        return res;
    }

    /***
     * 
     */
    @Override
    public FollowEntity findById(String id) {
        return followRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
    }

    @Override
    @Transactional
    public void add(ReqCreationFollowDTO req) {
        FollowEntity follow = new FollowEntity();
        follow.setCreatedAt(Instant.now());
        follow.setFolloweeId(req.getFolloweeId());
        follow.setFollowerId(userIsRequesting.getIdUserIsRequesting());
        if(userService.findById(req.getFolloweeId()).getIsPrivate() == true){
            follow.setStatus("PENDING");
        } else{
            follow.setStatus("FOLLOWING");
            userService.updateFolloweeCount("plus",req.getFolloweeId());
            userService.updateFollowingCount("plus");
        }
        followRepository.save(follow);
    }

    @Override
    @Transactional
    public void delete(String id) {
        FollowEntity follow = findById(id);
        userService.updateFolloweeCount("minus",follow.getFolloweeId());
        userService.updateFollowingCount("minus");
        followRepository.deleteById(id);
    }
    @Override
    public List<FollowEntity> findByFollowerId(String userId) {
        return followRepository.findByFollowerId(userId);
    }

}
