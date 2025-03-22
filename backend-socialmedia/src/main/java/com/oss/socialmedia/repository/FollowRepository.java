package com.oss.socialmedia.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.FollowEntity;

public interface FollowRepository extends MongoRepository<FollowEntity, String>{
    @Query(
            "{ 'id': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'followerId': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'followeeId': { '$regex': ?0, '$options': 'i' } }, ")
    Page<FollowEntity> searchByKeyword(String keyword, Pageable pageable);
    List<FollowEntity> findByFollowerId(String userId);
}
