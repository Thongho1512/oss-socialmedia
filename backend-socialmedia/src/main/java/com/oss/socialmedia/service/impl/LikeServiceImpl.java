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

import com.oss.socialmedia.controller.request.like.ReqCreationLikeDTO;
import com.oss.socialmedia.controller.response.LikePageDTO;
import com.oss.socialmedia.controller.response.PermissionPageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.LikeEntity;
import com.oss.socialmedia.model.PermissionEntity;
import com.oss.socialmedia.model.PostEntity;
import com.oss.socialmedia.repository.LikeRepository;
import com.oss.socialmedia.repository.PostRepository;
import com.oss.socialmedia.service.LikeService;
import com.oss.socialmedia.service.PostService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService{
    private final LikeRepository likeRepository;
    private final PostService postService;
    private final UserIsRequesting userIsRequesting;
    private final PostRepository postRepository;

    @Override
    public LikePageDTO findAll(String keyword, String sort, int page, int size) {
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
        Page<LikeEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = likeRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = likeRepository.findAll(pageable);
        }
        return getlikePageDTO(page, size, entityPage);
    }
    // configure the object to be returned to the controller
    private LikePageDTO getlikePageDTO(int page, int size, Page<LikeEntity> likeEntities) {
        List<LikeEntity> likesList = likeEntities.stream().map(
                entity -> LikeEntity.builder()
                        .id(entity.getId())
                        .userId(entity.getUserId())
                        .postId(entity.getPostId())
                        .createdAt(entity.getCreatedAt())
                        .build())
                .toList();
        LikePageDTO res = new LikePageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(likeEntities.getTotalElements());
        res.setTotalPages(likeEntities.getTotalPages());
        res.setLikes(likesList);
        return res;
    }


    @Override
    public LikeEntity findById(String id) {
        return likeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
    }

    @Override
    @Transactional
    public void add(ReqCreationLikeDTO req) {
        LikeEntity like = new LikeEntity();
        like.setPostId(req.getPostId());
        like.setUserId(userIsRequesting.getIdUserIsRequesting());
        like.setCreatedAt(Instant.now());
        likeRepository.save(like);
        postService.updateLike(req.getPostId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        LikeEntity like = findById(id);
        PostEntity post = postService.findById(like.getPostId());
        likeRepository.deleteById(id);
        post.setLikeCount(post.getLikeCount() - 1);
        postRepository.save(post);
    }

}
