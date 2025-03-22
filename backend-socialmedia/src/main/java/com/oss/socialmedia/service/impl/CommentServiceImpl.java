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

import com.oss.socialmedia.controller.request.comment.ReqCreationCommentDTO;
import com.oss.socialmedia.controller.response.CommentPageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.CommentEntity;
import com.oss.socialmedia.model.PostEntity;
import com.oss.socialmedia.repository.CommentRepository;
import com.oss.socialmedia.repository.PostRepository;
import com.oss.socialmedia.service.CommentService;
import com.oss.socialmedia.service.PostService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService{
    private final CommentRepository commentRepository;
    private final UserIsRequesting userIsRequesting;
    private final PostService postService;
    private final PostRepository postRepository;

    @Override
    public CommentPageDTO findAll(String keyword, String sort, int page, int size) {
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
        Page<CommentEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = commentRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = commentRepository.findAll(pageable);
        }
        return getCommentPageDTO(page, size, entityPage);
    }
    // configure the object to be returned to the controller
    private CommentPageDTO getCommentPageDTO(int page, int size, Page<CommentEntity> commentEntities) {
        List<CommentEntity> commentsList = commentEntities.stream().map(
                entity -> CommentEntity.builder()
                        .id(entity.getId())
                        .userId(entity.getUserId())
                        .postId(entity.getPostId())
                        .content(entity.getContent())
                        .parentComment(entity.getParentComment())
                        .createdAt(entity.getCreatedAt())
                        .updatedAt(entity.getUpdatedAt())
                        .build())
                .toList();
        CommentPageDTO res = new CommentPageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(commentEntities.getTotalElements());
        res.setTotalPages(commentEntities.getTotalPages());
        res.setComments(commentsList);
        return res;
    }
    @Override
    public CommentEntity findById(String id) {
        return commentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
    }

    @Override
    @Transactional
    public void add(ReqCreationCommentDTO req) {
        CommentEntity comment = new CommentEntity();
        comment.setPostId(req.getPostId());
        comment.setUserId(userIsRequesting.getIdUserIsRequesting());
        comment.setContent(req.getContent());
        comment.setCreatedAt(Instant.now());
        commentRepository.save(comment);
        postService.updateComment(req.getPostId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        CommentEntity like = findById(id);
        PostEntity post = postService.findById(like.getPostId());
        commentRepository.deleteById(id);
        post.setCommentCount(post.getCommentCount() - 1);
        postRepository.save(post);
    }

}
