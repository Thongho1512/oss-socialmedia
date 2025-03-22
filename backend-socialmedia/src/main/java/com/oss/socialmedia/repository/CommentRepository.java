package com.oss.socialmedia.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.CommentEntity;

public interface CommentRepository extends MongoRepository<CommentEntity, String>{
    @Query(
            "{ 'content': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'userId': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'postId': { '$regex': ?0, '$options': 'i' } }, ")
    Page<CommentEntity> searchByKeyword(String keyword, Pageable pageable);
}
