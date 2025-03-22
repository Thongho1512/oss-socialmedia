package com.oss.socialmedia.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.oss.socialmedia.model.PermissionEntity;

public interface PermissionRepository extends MongoRepository<PermissionEntity, String>{
    @Query(
            "{ 'name': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'method': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'module': { '$regex': ?0, '$options': 'i' } }, ")
    Page<PermissionEntity> searchByKeyword(String keyword, Pageable pageable);

    boolean existsByNameAndApiPathAndMethodAndModule(String name, String apiPath, String method, String module);

    // boolean existsByName(String name);
    // boolean existsByApiPath(String apiPath);
    // boolean existsByMethod(String method);
    // boolean existsByModule(String module);
    
}
