package com.oss.socialmedia.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.UserEntity;

public interface UserRepository extends MongoRepository<UserEntity, String> {
    // @Query(value = "select u from UserEntity u where u.status='ACTIVE' " +
    // "and (lower(u.firstName) like :keyword " +
    // "or lower(u.lastName) like :keyword " +
    // "or lower(u.username) like :keyword " +
    // "or lower(u.phone) like :keyword " +
    // "or lower(u.email) like :keyword)")
    @Query("{ 'status': 'ACTIVE', " +
            "'$or': [ " +
            "{ 'firstName': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'lastName': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'username': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'phone': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'email': { '$regex': ?0, '$options': 'i' } } " +
            "] }")
    Page<UserEntity> searchByKeyword(String keyword, Pageable pageable);
    UserEntity findByUsername(String username);
    UserEntity findByEmail(String email);
    UserEntity findByRefreshTokenAndEmail(String refreshToken, String email);
    boolean existsByEmail(String email);
}
