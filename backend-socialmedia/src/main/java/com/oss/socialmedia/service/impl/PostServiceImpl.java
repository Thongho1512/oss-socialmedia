package com.oss.socialmedia.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.oss.socialmedia.common.Media;
import com.oss.socialmedia.controller.request.post.ReqCreationPostDTO;
import com.oss.socialmedia.controller.request.post.ReqUpdatePostDTO;
import com.oss.socialmedia.controller.response.PostPageDTO;
import com.oss.socialmedia.controller.response.UserDTO;
import com.oss.socialmedia.controller.response.UserHomPageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.FollowEntity;
import com.oss.socialmedia.model.PostEntity;
import com.oss.socialmedia.model.UserEntity;
import com.oss.socialmedia.repository.PostRepository;
import com.oss.socialmedia.service.FollowService;
import com.oss.socialmedia.service.PostService;
import com.oss.socialmedia.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService{

    private final PostRepository postRepository;
    private final UserIsRequesting userIsRequesting;
    private final UserService userService;
    private final FollowService followService;

    @Value("${file.upload.image-dir}")
        private String imageUploadDir; // Thư mục lưu ảnh

    @Value("${file.upload.video-dir}")
    private String videoUploadDir; // Thư mục lưu video

    @Override
    public PostPageDTO findAll(String keyword, String sort, int page, int size) {
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
        Page<PostEntity> entityPage;
        if (StringUtils.hasLength(keyword)) {
            keyword = ".*" + keyword.toLowerCase() + ".*";
            entityPage = postRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = postRepository.findAll(pageable);
        }
        return getPostPageDTO(page, size, entityPage);
    }
    private PostPageDTO getPostPageDTO(int page, int size, Page<PostEntity> postEntities) {
        List<PostEntity> postsList = postEntities.stream().map(
                entity -> PostEntity.builder()
                        .id(entity.getId())
                        .likeCount(entity.getLikeCount())
                        .commentCount(entity.getCommentCount())
                        .caption(entity.getCaption())
                        .media(entity.getMedia())
                        .shareCount(entity.getShareCount())
                        .userId(entity.getUserId())
                        .build())
                .toList();
        PostPageDTO res = new PostPageDTO();
        res.setPageNumber(page);
        res.setPageSize(size);
        res.setTotalElements(postEntities.getTotalElements());
        res.setTotalPages(postEntities.getTotalPages());
        res.setPosts(postsList);
        return res;
    }

    @Override
    public PostEntity findById(String id) {
        return postRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }


    // lưu vào thư mục 
    public String saveFile(MultipartFile file) throws IOException {
        // Kiểm tra loại file
        String contentType = file.getContentType();
        String uploadDir;

        if (contentType != null && contentType.startsWith("image")) {
            uploadDir = imageUploadDir; // Lưu vào thư mục ảnh
        } else if (contentType != null && contentType.startsWith("video")) {
            uploadDir = videoUploadDir; // Lưu vào thư mục video
        } else {
            throw new IllegalArgumentException("Chỉ hỗ trợ upload hình ảnh hoặc video.");
        }
        Path uploadPath = Paths.get(System.getProperty("user.dir"), uploadDir);

        // Đảm bảo thư mục tồn tại
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file duy nhất
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Lưu file vào thư mục
        Files.copy(file.getInputStream(), filePath); // D:/oss/socialmedia( getInputStream lấy ra thư mục gốc)

        return uploadDir + "/" + fileName; // Trả về đường dẫn lưu file
    }

    @Override
    public void add(ReqCreationPostDTO reqDto) {
        List<Media> mediaList = new ArrayList<>();

        for (MultipartFile file : reqDto.getMedia()) {
            try {
                // Lưu file vào thư mục tương ứng
                String fileUrl = saveFile(file);

                // Xác định loại file (IMAGE/VIDEO)
                String type = file.getContentType().startsWith("image") ? "IMAGE" : "VIDEO";

                mediaList.add(new Media(fileUrl, type));
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi lưu file", e);
            }
        }

        // Tạo bài viết mới
        PostEntity post = new PostEntity();
        post.setUserId(userIsRequesting.getIdUserIsRequesting());
        post.setCaption(reqDto.getCaption());
        post.setPrivacy(reqDto.isPrivacy());
        post.setMedia(mediaList);
        post.setCreatedAt(Instant.now());
        postRepository.save(post);
    }

    @Override
    public void update(ReqUpdatePostDTO req) {
        List<Media> mediaList = new ArrayList<>();

        for (MultipartFile file : req.getMedia()) {
            try {
                // Lưu file vào thư mục tương ứng
                String fileUrl = saveFile(file);

                // Xác định loại file (IMAGE/VIDEO)
                String type = file.getContentType().startsWith("image") ? "IMAGE" : "VIDEO";

                mediaList.add(new Media(fileUrl, type));
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi lưu file", e);
            }
        }
        PostEntity post = new PostEntity();
        post.setId(req.getId());
        post.setUserId(req.getUserId());
        post.setCaption(req.getCaption());
        post.setPrivacy(req.isPrivacy());
        post.setCommentCount(req.getCommentCount());
        post.setLikeCount(req.getLikeCount());
        post.setShareCount(req.getShareCount());
        post.setCreatedAt(req.getCreatedAt());
        post.setMedia(mediaList);
        post.setCreatedAt(req.getCreatedAt());
        post.setUpdatedAt(Instant.now());
        postRepository.save(post);
    }


    @Override
    public void delete(String id) {
        PostEntity post = findById(id);
        postRepository.delete(post);
    }

    @Override
    public void updateLike(String id){
        PostEntity post = findById(id);
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
    }

    @Override
    public void updateComment(String id){
        PostEntity post = findById(id);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);
    }

    @Override
    public void updateShare(String id){
        PostEntity post = findById(id);
        post.setShareCount(post.getShareCount() + 1);
        postRepository.save(post);
    }
    @Override
    public List<UserHomPageDTO> findPostByUserId() {
        List<PostEntity> post = new ArrayList<>();
        String userId = userIsRequesting.getIdUserIsRequesting();
        List<FollowEntity> follow = followService.findByFollowerId(userId);
        for(int i = 0; i < follow.size(); i++){
            List<PostEntity> post1 = postRepository.findByUserId(follow.get(i).getFolloweeId());
            post.addAll(post1);
        }
        List<UserHomPageDTO> userHomPageDTOList = new ArrayList<>();
        for(int i = 0; i < post.size(); i++){
            UserDTO user = userService.findById(post.get(i).getUserId());
            UserHomPageDTO userHomPageDTO = UserHomPageDTO.builder()
                    .id(post.get(i).getId())
                    .userId(post.get(i).getUserId())
                    .caption(post.get(i).getCaption())
                    .media(post.get(i).getMedia())
                    .likeCount(post.get(i).getLikeCount())
                    .commentCount(post.get(i).getCommentCount())
                    .shareCount(post.get(i).getShareCount())
                    .createdAt(post.get(i).getCreatedAt())
                    .userName(user.getUsername())
                    .build();
            userHomPageDTOList.add(userHomPageDTO);
        }
        return userHomPageDTOList;
    }
    @Override
    public List<PostEntity> getPostsByUserAuth() {
        String userId = userIsRequesting.getIdUserIsRequesting();
        return postRepository.findByUserId(userId);
    }

    @Override
    public List<PostEntity> getPostsByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }
    
}
