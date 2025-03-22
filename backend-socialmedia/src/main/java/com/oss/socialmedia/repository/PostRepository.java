package com.oss.socialmedia.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.PostEntity;

public interface PostRepository extends MongoRepository<PostEntity, String>{
    @Query("{ [ " +
            "{ 'caption': { '$regex': ?0, '$options': 'i' } }, " +
            "] }")
    Page<PostEntity> searchByKeyword(String keyword, Pageable pageable);
    List<PostEntity> findByUserId(String userId);
}