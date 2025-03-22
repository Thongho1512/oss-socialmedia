package com.oss.socialmedia.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.RoleEntity;
import com.oss.socialmedia.repository.custom.CustomRoleRepository;

public interface RoleRepository extends MongoRepository<RoleEntity, String>, CustomRoleRepository{
    @Query("{ 'status': 'ACTIVE', " +
            "'$or': [ " +
            "{ 'name': { '$regex': ?0, '$options': 'i' } }, " +
            "] }")
    Page<RoleEntity> searchByKeyword(String keyword, Pageable pageable);
    boolean existsByName(String name);

}
