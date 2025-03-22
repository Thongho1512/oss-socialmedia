package com.oss.socialmedia.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.LikeEntity;

public interface LikeRepository extends MongoRepository<LikeEntity, String>{
    @Query(
            "{ 'id': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'userId': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'postId': { '$regex': ?0, '$options': 'i' } }, ")
    Page<LikeEntity> searchByKeyword(String keyword, Pageable pageable);
}
