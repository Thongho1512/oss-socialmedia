package com.oss.socialmedia.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.ShareEntity;

public interface ShareRepository extends MongoRepository<ShareEntity, String>{
    @Query(
            "{ 'content': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'userId': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'postId': { '$regex': ?0, '$options': 'i' } }, ")
    Page<ShareEntity> searchByKeyword(String keyword, Pageable pageable);
}
