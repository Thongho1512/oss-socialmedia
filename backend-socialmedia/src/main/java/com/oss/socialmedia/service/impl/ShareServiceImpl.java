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

import com.oss.socialmedia.controller.request.share.ReqCreationShareDTO;
import com.oss.socialmedia.controller.request.share.ReqUpdateShareDTO;
import com.oss.socialmedia.controller.response.RolePageDTO;
import com.oss.socialmedia.controller.response.SharePageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.LikeEntity;
import com.oss.socialmedia.model.PostEntity;
import com.oss.socialmedia.model.RoleEntity;
import com.oss.socialmedia.model.ShareEntity;
import com.oss.socialmedia.repository.PostRepository;
import com.oss.socialmedia.repository.ShareRepository;
import com.oss.socialmedia.service.PostService;
import com.oss.socialmedia.service.ShareService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShareServiceImpl implements ShareService{
    private final ShareRepository shareRepository;
    private final UserIsRequesting userIsRequesting;
    private final PostService postService;
    private final PostRepository postRepository;

    @Override
    public SharePageDTO findAll(String keyword, String sort, int page, int size) {
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
        Page<ShareEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = shareRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = shareRepository.findAll(pageable);
        }
        return getSharePageDTO(page, size, entityPage);
    }
    private SharePageDTO getSharePageDTO(int page, int size, Page<ShareEntity> shareEntities) {
        List<ShareEntity> sharesList = shareEntities.stream().map(
                entity -> ShareEntity.builder()
                        .id(entity.getId())
                        .content(entity.getContent())
                        .userId(entity.getUserId())
                        .postId(entity.getPostId())
                        .createdAt(entity.getCreatedAt())
                        .updatedAt(entity.getUpdatedAt())
                        .build())
                .toList();
        SharePageDTO res = new SharePageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(shareEntities.getTotalElements());
        res.setTotalPages(shareEntities.getTotalPages());
        res.setShares(sharesList);
        return res;
    }

    @Override
    public ShareEntity findById(String id) {
        return shareRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    @Override
    @Transactional
    public void add(ReqCreationShareDTO req) {
        ShareEntity share = new ShareEntity();
        share.setPostId(req.getPostId());
        share.setUserId(userIsRequesting.getIdUserIsRequesting());
        share.setContent(req.getContent());
        share.setCreatedAt(Instant.now());
        shareRepository.save(share);
        postService.updateShare(req.getPostId());
    }

    @Override
    public void update(ReqUpdateShareDTO req) {
        ShareEntity share = findById(req.getId());
        share.setContent(req.getContent());
        share.setUpdatedAt(Instant.now());
        shareRepository.save(share);
    }

    @Override
    @Transactional
    public void delete(String id) {
        ShareEntity share = findById(id);
        PostEntity post = postService.findById(share.getPostId());
        shareRepository.deleteById(id);
        post.setShareCount(post.getShareCount() - 1);
        postRepository.save(post);
    }

}
